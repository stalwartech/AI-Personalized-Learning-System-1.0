const Course = require('../../models/CourseModel');
const Progress = require('../../models/ProgressModel');

/**
 * DELETE COURSE CONTROLLER
 * 
 * What this does:
 * - Deletes a course
 * - Updates user's progress stats
 * 
 * @route   DELETE /api/courses/:courseId
 * @access  Private
 */
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find and delete course
    const course = await Course.findOneAndDelete({
      _id: courseId,
      userId: req.userId
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update user's progress stats
    let userProgress = await Progress.findOne({ userId: req.userId });
    
    if (userProgress) {
      // Decrement counters (Math.max prevents negative numbers)
      userProgress.totalStats.coursesGenerated = Math.max(0, userProgress.totalStats.coursesGenerated - 1);
      
      if (course.status === 'completed') {
        userProgress.totalStats.coursesCompleted = Math.max(0, userProgress.totalStats.coursesCompleted - 1);
      } else if (course.status === 'in-progress') {
        userProgress.totalStats.coursesInProgress = Math.max(0, userProgress.totalStats.coursesInProgress - 1);
      }
      
      await userProgress.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

module.exports = deleteCourse;