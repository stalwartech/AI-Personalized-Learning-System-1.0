const router = require('express').Router();
const authMiddleware = require('../Middleware/authMiddleware');
const { getProgress, getWeeklyActivity, getTopicsMastery, getPerformanceTrends } = require('../controllers/progress');

/**
 * PROGRESS ROUTES
 * All analytics and progress tracking endpoints
 */

// Get overall progress and stats
router.get('/', authMiddleware, getProgress);

// Get last 7 days activity (for charts)
router.get('/weekly-activity', authMiddleware, getWeeklyActivity);

// Get progress on different topics/courses
router.get('/topics-mastery', authMiddleware, getTopicsMastery);

// Get quiz score trends over time
router.get('/performance-trends', authMiddleware, getPerformanceTrends);

module.exports = router;