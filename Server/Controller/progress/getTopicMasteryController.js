const Progress = require('../../models/ProgressModel');

const getWeeklyActivity = async (req, res) => {
  try {
    const userProgress = await Progress.findOne({ userId: req.userId });
    if (!userProgress) {
      return res.status(200).json({ success: true, data: { weeklyActivity: [] } });
    }

    const activity = userProgress.dailyActivity.slice(-7).map(day => ({
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      date: day.date,
      hours: Number((day.timeSpent / 60).toFixed(1)),
      lessonsCompleted: day.lessonsCompleted
    }));

    return res.status(200).json({ success: true, data: { weeklyActivity: activity } });
  } catch (error) {
    console.error('Weekly activity error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching activity', error: error.message });
  }
};

module.exports = getWeeklyActivity;