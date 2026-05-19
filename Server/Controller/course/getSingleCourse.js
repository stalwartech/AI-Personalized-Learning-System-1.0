const Course = require('../../Model/courseModel');

/**
 * GET SINGLE COURSE CONTROLLER
 * 
 * What this does:
 * Returns ONE complete course with ALL details
 * (lessons, videos, notes, progress, etc.)
 * 
 * Also updates "last accessed" timestamp
 * 
 * @route   GET /api/courses/:courseId
 * @access  Private
 */
const getSingleCourse = async (req, res) => {
  try {
    // ── Step 1: Get course ID from URL ────────────────────────────────────────
    // Example URL: /api/courses/abc123xyz
    // req.params.courseId = "abc123xyz"
    const { courseId } = req.params;

    // ── Step 2: Find course in database ───────────────────────────────────────
    const course = await Course.findOne({
      _id: courseId,
      userId: req.userId  // Security: user can only access their own courses
    }).lean();

    // ── Step 3: Check if course exists ────────────────────────────────────────
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // ── Step 4: Update last accessed time without delaying the response ───────
    Course.updateOne(
      { _id: courseId, userId: req.userId },
      { $set: { 'analytics.lastAccessed': new Date() } }
    ).catch((error) => {
      console.error('Failed to update last accessed time:', error.message);
    });

    // ── Step 5: Send course data ──────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      data: {
        course: course  // Includes all lessons with videos, notes, progress, etc.
      }
    });

  } catch (error) {
    console.error('Get single course error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

module.exports = getSingleCourse;
