const Progress = require('../../models/ProgressModel');
const Course = require('../../models/CourseModel');

/**
 * GET PROGRESS CONTROLLER
 * Returns overall learning analytics for the user
 */
const getProgress = async (req, res) => {
  try {
    let userProgress = await Progress.findOne({ userId: req.userId });
    if (!userProgress) {
      userProgress = new Progress({ userId: req.userId });
    }

    // Recalculate from courses
    const courses = await Course.find({ userId: req.userId });
    userProgress.totalStats.coursesGenerated = courses.length;
    userProgress.totalStats.coursesCompleted = courses.filter(course => course.status === 'completed').length;
    userProgress.totalStats.coursesInProgress = courses.filter(course => course.status === 'in-progress').length;
    
    // Calculate total time
    userProgress.totalStats.totalLearningTime = courses.reduce((total, course) => {
      return total + (course.analytics.totalTimeSpent || 0);
    }, 0);

    // Calculate average quiz score
    const allScores = [];
    courses.forEach(course => {
      course.lessons.forEach(lesson => {
        if (lesson.quizScore !== null) {
          allScores.push(lesson.quizScore);
        }
      });
    });

    if (allScores.length > 0) {
      const totalScore = allScores.reduce((sum, score) => sum + score, 0);
      userProgress.totalStats.averageQuizScore = Math.round(totalScore / allScores.length);
    }

    userProgress.calculateVelocity();
    await userProgress.save();

    return res.status(200).json({
      success: true,
      data: { progress: userProgress }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

module.exports = getProgress;