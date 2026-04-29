const Course = require('../../Model/courseModel');

const getTopicsMastery = async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });

    const topicsMastery = courses.map((course) => {
      const totalLessons = course.lessons.length;
      const completedLessons = course.lessons.filter((lesson) => lesson.completed).length;
      const lessonsWithScores = course.lessons.filter((lesson) => lesson.quizScore !== null);
      const averageQuizScore = lessonsWithScores.length > 0
        ? Math.round(lessonsWithScores.reduce((sum, lesson) => sum + lesson.quizScore, 0) / lessonsWithScores.length)
        : null;

      return {
        courseId: course._id,
        title: course.title,
        category: course.category || 'General',
        difficulty: course.difficulty,
        status: course.status,
        completedLessons,
        totalLessons,
        progressPercentage: course.progress?.percentage || (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0),
        averageQuizScore
      };
    }).sort((a, b) => b.progressPercentage - a.progressPercentage);

    return res.status(200).json({
      success: true,
      data: { topicsMastery }
    });
  } catch (error) {
    console.error('Topics mastery error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching topics mastery',
      error: error.message
    });
  }
};

module.exports = getTopicsMastery;
