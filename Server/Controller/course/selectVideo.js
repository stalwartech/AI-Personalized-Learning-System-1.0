const { validationResult } = require('express-validator');
const Course = require('../../Model/courseModel');

/**
 * SELECT VIDEO CONTROLLER
 * 
 * What this does:
 * User sees 3 video options for a lesson
 * They pick their favorite
 * We save their choice
 * 
 * @route   PUT /api/courses/:courseId/lessons/:lessonId/video
 * @access  Private
 */
const selectVideo = async (req, res) => {
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
    const { courseId, lessonId } = req.params;  // From URL
    const { videoId } = req.body;                // From request body

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

    // ── Step 4: Find lesson inside course ─────────────────────────────────────
    // .id() is a Mongoose method to find subdocument by _id
    const lesson = course.lessons.id(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // ── Step 5: Validate video choice ─────────────────────────────────────────
    // Make sure the videoId is one of the 3 options
    const isValidChoice = lesson.videoOptions.some(video => video.videoId === videoId);

    if (!isValidChoice) {
      return res.status(400).json({
        success: false,
        message: 'Invalid video selection. Video not in available options.'
      });
    }

    // ── Step 6: Update selected video ─────────────────────────────────────────
    lesson.selectedVideo = videoId;
    await course.save();

    // ── Step 7: Send success response ─────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: 'Video selected successfully',
      data: {
        selectedVideo: videoId
      }
    });

  } catch (error) {
    console.error('Select video error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error selecting video',
      error: error.message
    });
  }
};

module.exports = selectVideo;