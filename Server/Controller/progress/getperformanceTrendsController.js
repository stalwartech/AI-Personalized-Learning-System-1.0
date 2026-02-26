const Course = require('../../Model/courseModel');

const getPerformanceTrends = async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });
    
    const scoreData = [];
    courses.forEach(course => {
      course.lessons.forEach(lesson => {
        if (lesson.quizScore !== null && lesson.completed) {
          scoreData.push({ date: lesson.updatedAt || course.updatedAt, score: lesson.quizScore });
        }
      });
    });

    scoreData.sort((a, b) => new Date(a.date) - new Date(b.date));

    const weeklyMap = {};
    scoreData.forEach(({ date, score }) => {
      const weekDate = new Date(date);
      weekDate.setHours(0, 0, 0, 0);
      weekDate.setDate(weekDate.getDate() - weekDate.getDay());
      const key = weekDate.toISOString().split('T')[0];
      if (!weeklyMap[key]) weeklyMap[key] = [];
      weeklyMap[key].push(score);
    });

    const trends = Object.entries(weeklyMap)
      .map(([week, scores]) => ({
        week,
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      }))
      .slice(-8);

    return res.status(200).json({ success: true, data: { trends } });
  } catch (error) {
    console.error('Performance trends error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching trends', error: error.message });
  }
};

module.exports = getPerformanceTrends;