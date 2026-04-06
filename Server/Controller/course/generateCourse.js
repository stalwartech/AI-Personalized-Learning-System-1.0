const { validationResult } = require('express-validator');
const Course = require('../../Model/courseModel');
const Progress = require('../../Model/progressModel');
const generateCourseWithAI = require("../../Services/AIGenerateCourseService");
const generateNotes = require('../../Services/AIGenerateNoteService');

const { searchVideos } = require('../../Services/youtubeSearchService');
const { generatePDF } = require('../../Services/PDFgenerator');

/**
 * Helper function: Convert markdown text to plain text
 * Removes all markdown symbols like #, **, *, []()
 * 
 * Example:
 * Input:  "# Hello **World**"
 * Output: "Hello World"
 */
function convertMarkdownToPlainText(markdown) {
  let plainText = markdown;
  
  // Remove headers (# ## ###)
  plainText = plainText.replace(/#{1,6}\s/g, '');
  
  // Remove bold (**text**)
  plainText = plainText.replace(/\*\*/g, '');
  
  // Remove italic (*text*)
  plainText = plainText.replace(/\*/g, '');
  
  // Remove links [text](url) - keep just the text
  plainText = plainText.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  return plainText;
}

/**
 * GENERATE COURSE CONTROLLER
 * 
 * This is the MAIN FEATURE of the app!
 * 
 * What happens:
 * 1. User searches: "Learn Python" + "Beginner"
 * 2. AI generates course structure (8 lessons)
 * 3. For EACH lesson:
 *    - Fetch 3 YouTube videos
 *    - Generate AI study notes
 *    - Create PDF from notes
 * 4. Save everything to database (ONE document with all embedded data)
 * 5. Update user's progress stats
 * 6. Return complete course to frontend
 * 
 * Time: Takes 30-60 seconds (lots of API calls happening)
 * 
 * @route   POST /api/courses/generate
 * @access  Private (must be logged in)
 */
const generateCourse = async (req, res) => {
  try {
    // ── Step 1: Validate input ────────────────────────────────────────────────
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // ── Step 2: Extract data ──────────────────────────────────────────────────
    const { query, difficulty } = req.body;
    const userId = req.userId; // Set by auth middleware
    
    // Example: query = "Learn Python", difficulty = "beginner"
    
    console.log(`🎓 Starting course generation: "${query}" (${difficulty})`);

    // ── Step 3: Generate course structure with AI ─────────────────────────────
    // This calls OpenRouter API and gets back:
    // {
    //   title: "Python Programming Fundamentals",
    //   description: "Learn Python from basics...",
    //   category: "Programming",
    //   lessons: [
    //     { title: "Variables", order: 1, content: "...", estimatedDuration: 15 },
    //     { title: "Functions", order: 2, content: "...", estimatedDuration: 20 },
    //     ... 6-8 more lessons
    //   ]
    // }
    const courseDataFromAI = await generateCourseWithAI(query, difficulty);
    console.log(courseDataFromAI);
    
    console.log(`✅ AI generated ${courseDataFromAI.lessons.length} lessons`);

    // ── Step 4: Enhance EACH lesson with videos and notes ─────────────────────
    // We use Promise.all() to do this in PARALLEL (all at once)
    // Why? If we did one at a time, it would take forever
    // Parallel: 30 seconds | Sequential: 5 minutes
    
    const enhancedLessons = await Promise.all(
      courseDataFromAI.lessons.map(async (lesson, index) => {
        // This function runs for EACH lesson simultaneously
        
        try {
          console.log(`🎥 Processing lesson ${index + 1}: "${lesson.title}"`);
          
          // ── 4a: Fetch YouTube videos ────────────────────────────────────────
          // Search query combines: topic + lesson title + difficulty
          // Example: "Learn Python Variables tutorial beginner"
          const youtubeSearchQuery = `${query} ${lesson.title} tutorial ${difficulty}`;
          const videoResults = await searchVideos(youtubeSearchQuery, 3);
          // Returns array of 3 videos (or empty array if none found)
          
          // ── 4b: Generate AI notes ───────────────────────────────────────────
          // AI creates study notes based on the lesson content
          const notesInMarkdown = await generateNotes(lesson.title,lesson.content,difficulty);
          // Returns markdown text with headers, bullet points, etc.
          
          // ── 4c: Convert markdown to plain text ──────────────────────────────
          const plainTextNotes = convertMarkdownToPlainText(notesInMarkdown);
          
          // ── 4d: Generate PDF ────────────────────────────────────────────────
          // Creates a formatted PDF file from the markdown notes
          const pdfResult = await generatePDF(
            lesson.title,
            notesInMarkdown,
            courseDataFromAI.title,
            index + 1
          );
          // Returns: { filename: "notes_variables_123.pdf", url: "/api/courses/notes/pdf/..." }
          
          console.log(`✅ Lesson ${index + 1} enhanced successfully`);
          
          // ── 4e: Return enhanced lesson ───────────────────────────────────────
          return {
            ...lesson,  // Keep original lesson data (title, content, order, etc.)
            videoOptions: videoResults,  // Add the 3 YouTube videos
            selectedVideo: videoResults.length > 0 ? videoResults[0].videoId : null,  // Default to first video
            notes: {
              plainText: plainTextNotes,
              markdown: notesInMarkdown,
              pdfUrl: pdfResult.url
            }
          };
          
        } catch (error) {
          // If anything fails for THIS lesson, log it but don't crash
          // Just return the lesson without videos/notes
          console.error(`⚠️ Error processing lesson "${lesson.title}":`, error.message);
          
          return {
            ...lesson,
            videoOptions: [],
            selectedVideo: null,
            notes: {
              plainText: '',
              markdown: '',
              pdfUrl: null
            }
          };
        }
      })
    );
    
    console.log(`✅ All lessons enhanced`);

    // ── Step 5: Save course to database ───────────────────────────────────────
    // Create a new course document with ALL embedded data
    const newCourse = await Course.create({
      userId: userId,
      title: courseDataFromAI.title,
      description: courseDataFromAI.description,
      difficulty: difficulty,
      searchQuery: query,
      category: courseDataFromAI.category || 'General',
      lessons: enhancedLessons,  // All lessons with videos and notes embedded
      progress: {
        completedLessons: 0,
        totalLessons: enhancedLessons.length,
        percentage: 0
      }
    });
    
    console.log(`✅ Course saved to database: ${newCourse._id}`);

    // ── Step 6: Update user's progress stats ──────────────────────────────────
    // Find or create progress document for this user
    let userProgress = await Progress.findOne({ userId: userId });
    if (!userProgress) {
      // First course - create new progress document
      userProgress = new Progress({ userId: userId });
    }
    
    // Increment counters
    userProgress.totalStats.coursesGenerated += 1;
    userProgress.totalStats.coursesInProgress += 1;
    await userProgress.save();

    // ── Step 7: Send success response ─────────────────────────────────────────
    return res.status(201).json({  // 201 = Created
      success: true,
      message: 'Course generated successfully',
      data: {
        course: newCourse  // Send back the complete course
      }
    });

  } catch (error) {
    // ── Handle any errors ─────────────────────────────────────────────────────
    console.error('Generate course error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating course',
      error: error.message
    });
  }
};

module.exports = generateCourse;