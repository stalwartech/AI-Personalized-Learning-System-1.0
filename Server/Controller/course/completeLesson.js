const { validationResult } = require('express-validator');
const Course = require('../../Model/courseModel');
const Progress = require('../../Model/progressModel');

/**
 * COMPLETE LESSON CONTROLLER
 * 
 * What this does:
 * 1. Mark lesson as completed
 * 2. Save quiz score (if provided)
 * 3. Update course progress percentage
 * 4. Update user's overall progress stats
 * 5. Track weak areas (topics where user scored < 75%)
 * 
 * @route   PUT /api/courses/:courseId/lessons/:lessonId/complete
 * @access  Private
 */
const completeLesson = async (req, res) => {
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
    const { courseId, lessonId } = req.params;
    const { quizScore, timeSpent = 0 } = req.body;  // timeSpent defaults to 0 if not provided

    // ── Step 3: Find course ───────────────────────────────────────────────────
    const course = await Course.findOne({
      _id: courseId,
      userId: req.userId
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // ── Step 4: Find lesson ───────────────────────────────────────────────────
    const lesson = course.lessons.id(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // ── Step 5: Mark lesson as completed ──────────────────────────────────────
    lesson.completed = true;
    
    // Save quiz score if provided
    if (quizScore !== undefined) {
      lesson.quizScore = quizScore;  // 0-100
    }

    // ── Step 6: Update course progress ────────────────────────────────────────
    // This is an INSTANCE METHOD we defined in Course model
    // It recalculates completedLessons, totalLessons, percentage
    course.updateProgress();
    
    // Update analytics
    course.analytics.totalTimeSpent += timeSpent;
    course.analytics.lastAccessed = Date.now();
    
    await course.save();

    // ── Step 7: Update user's overall progress ───────────────────────────────
    let userProgress = await Progress.findOne({ userId: req.userId });
    
    if (!userProgress) {
      // First time completing a lesson - create progress document
      userProgress = new Progress({ userId: req.userId });
    }

    // Add today's activity
    // This is an INSTANCE METHOD we defined in Progress model
    userProgress.addActivity(timeSpent || lesson.estimatedDuration, 1);
    
    // Update totals
    userProgress.totalStats.totalLessonsCompleted += 1;
    userProgress.totalStats.totalLearningTime += timeSpent;

    // ── Step 8: Track weak areas ──────────────────────────────────────────────
    // If quiz score is below 75%, add to weak areas for review
    if (quizScore !== undefined && quizScore < 75) {
      userProgress.weakAreas.push({
        topic: lesson.title,
        score: quizScore,
        courseId: course._id,
        lastReviewed: new Date()
      });
      
      // Keep only the 10 weakest areas
      userProgress.weakAreas = userProgress.weakAreas
        .sort((areaA, areaB) => areaA.score - areaB.score)  // Sort by score (lowest first)
        .slice(0, 10);  // Keep only first 10
    }

    await userProgress.save();

    // ── Step 9: Send success response ─────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: 'Lesson completed successfully!',
      data: {
        lesson: lesson,
        courseProgress: course.progress  // Updated percentage, completedLessons, etc.
      }
    });

  } catch (error) {
    console.error('Complete lesson error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error completing lesson',
      error: error.message
    });
  }
};

module.exports = completeLesson;