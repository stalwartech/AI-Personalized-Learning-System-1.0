const { validationResult } = require('express-validator');
const Course = require('../../Model/courseModel');
const Progress = require('../../Model/progressModel');
const generateCourseWithAI = require('../../Services/AIGenerateCourseService');
const generateNotes = require('../../Services/AIGenerateNoteService');
const { searchVideos } = require('../../Services/youtubeSearchService');
const { generatePDF } = require('../../Services/PDFgenerator');

function convertMarkdownToPlainText(markdown = '') {
  return markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
}

function parseAIJson(aiResponse) {
  const cleanedResponse = String(aiResponse || '')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  const firstBrace = cleanedResponse.indexOf('{');
  const lastBrace = cleanedResponse.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('AI did not return a JSON object');
  }

  return JSON.parse(cleanedResponse.slice(firstBrace, lastBrace + 1));
}

function normalizeLesson(lesson, index) {
  const title = String(lesson?.title || `Lesson ${index + 1}`).trim();
  const content = String(lesson?.content || `Learn the key ideas and practical steps for ${title}.`).trim();
  const estimatedDuration = Number(lesson?.estimatedDuration) || 15;

  return {
    title,
    order: Number(lesson?.order) || index + 1,
    content,
    estimatedDuration: Math.min(Math.max(estimatedDuration, 10), 30),
  };
}

async function enrichLesson({ lesson, query, difficulty, courseTitle, index }) {
  const youtubeSearchQuery = `${query} ${lesson.title} tutorial ${difficulty}`;

  const [videoResults, notesInMarkdown] = await Promise.all([
    searchVideos(youtubeSearchQuery, 1).catch((error) => {
      console.error(`YouTube search failed for "${lesson.title}":`, error.message);
      return [];
    }),
    generateNotes(lesson.title, lesson.content, difficulty),
  ]);

  const pdfResult = await generatePDF(
    lesson.title,
    notesInMarkdown,
    courseTitle,
    index + 1
  );

  return {
    ...lesson,
    videoOptions: videoResults,
    selectedVideo: videoResults.length > 0 ? videoResults[0].videoId : null,
    notes: {
      plainText: convertMarkdownToPlainText(notesInMarkdown),
      markdown: notesInMarkdown,
      pdfUrl: pdfResult.url,
    },
    generationStatus: 'ready',
  };
}

async function updateLessonGenerationStatus(courseId, lessonId, generationStatus) {
  await Course.updateOne(
    { _id: courseId, 'lessons._id': lessonId },
    { $set: { 'lessons.$.generationStatus': generationStatus } }
  );
}

async function updateGeneratedLesson(courseId, lessonId, lesson) {
  await Course.updateOne(
    { _id: courseId, 'lessons._id': lessonId },
    {
      $set: {
        'lessons.$.content': lesson.content,
        'lessons.$.estimatedDuration': lesson.estimatedDuration,
        'lessons.$.videoOptions': lesson.videoOptions,
        'lessons.$.selectedVideo': lesson.selectedVideo,
        'lessons.$.notes': lesson.notes,
        'lessons.$.generationStatus': lesson.generationStatus,
      },
    }
  );
}

async function generateRemainingLessonsInBackground({ courseId, lessons, query, difficulty, courseTitle }) {
  console.log(`Background lesson generation started for course ${courseId}`);

  for (let index = 1; index < lessons.length; index += 1) {
    const lesson = lessons[index];
    const lessonId = lesson._id;

    try {
      await updateLessonGenerationStatus(courseId, lessonId, 'generating');

      const enrichedLesson = await enrichLesson({
        lesson,
        query,
        difficulty,
        courseTitle,
        index,
      });

      await updateGeneratedLesson(courseId, lessonId, enrichedLesson);
      console.log(`Background lesson ${index + 1} ready for course ${courseId}`);
    } catch (error) {
      console.error(`Background lesson ${index + 1} failed for course ${courseId}:`, error.message);
      await updateLessonGenerationStatus(courseId, lessonId, 'failed').catch((updateError) => {
        console.error('Failed to mark lesson generation as failed:', updateError.message);
      });
    }
  }

  const course = await Course.findById(courseId).select('lessons.generationStatus').lean();
  const hasFailedLessons = course?.lessons?.some((lesson) => lesson.generationStatus === 'failed');
  const hasUnfinishedLessons = course?.lessons?.some((lesson) => ['pending', 'generating'].includes(lesson.generationStatus));

  await Course.updateOne(
    { _id: courseId },
    { $set: { generationStatus: hasFailedLessons || hasUnfinishedLessons ? 'failed' : 'ready' } }
  );

  console.log(`Background lesson generation finished for course ${courseId}`);
}

/**
 * Generate a course quickly by returning after the first lesson is ready.
 * Remaining lessons are enriched in the background and become visible as they finish.
 */
const generateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { query, difficulty } = req.body;
    const userId = req.userId;

    console.log(`Starting staged course generation: "${query}" (${difficulty})`);

    const aiResponse = await generateCourseWithAI(query, difficulty);
    const courseDataFromAI = parseAIJson(aiResponse);

    if (!Array.isArray(courseDataFromAI.lessons) || courseDataFromAI.lessons.length === 0) {
      throw new Error('AI did not return any lessons');
    }

    const outlineLessons = courseDataFromAI.lessons
      .slice(0, 8)
      .map(normalizeLesson);

    const firstLesson = await enrichLesson({
      lesson: outlineLessons[0],
      query,
      difficulty,
      courseTitle: courseDataFromAI.title,
      index: 0,
    });

    const stagedLessons = [
      firstLesson,
      ...outlineLessons.slice(1).map((lesson) => ({
        ...lesson,
        videoOptions: [],
        selectedVideo: null,
        notes: {
          plainText: '',
          markdown: '',
          pdfUrl: null,
        },
        generationStatus: 'pending',
      })),
    ];

    const newCourse = await Course.create({
      userId,
      title: courseDataFromAI.title,
      description: courseDataFromAI.description,
      difficulty,
      searchQuery: query,
      category: courseDataFromAI.category || 'General',
      lessons: stagedLessons,
      generationStatus: stagedLessons.length > 1 ? 'generating' : 'ready',
      progress: {
        completedLessons: 0,
        totalLessons: stagedLessons.length,
        percentage: 0,
      },
    });

    let userProgress = await Progress.findOne({ userId });
    if (!userProgress) {
      userProgress = new Progress({ userId });
    }

    userProgress.totalStats.coursesGenerated += 1;
    userProgress.totalStats.coursesInProgress += 1;
    await userProgress.save();

    if (stagedLessons.length > 1) {
      setImmediate(() => {
        generateRemainingLessonsInBackground({
          courseId: newCourse._id,
          lessons: newCourse.lessons.map((lesson) => lesson.toObject()),
          query,
          difficulty,
          courseTitle: newCourse.title,
        }).catch((error) => {
          console.error(`Background generation crashed for course ${newCourse._id}:`, error);
          Course.updateOne(
            { _id: newCourse._id },
            { $set: { generationStatus: 'failed' } }
          ).catch((updateError) => {
            console.error('Failed to mark course generation as failed:', updateError.message);
          });
        });
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Course started successfully. More lessons are generating in the background.',
      data: {
        course: newCourse,
      },
    });
  } catch (error) {
    console.error('Generate course error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating course',
      error: error.message,
    });
  }
};

module.exports = generateCourse;
