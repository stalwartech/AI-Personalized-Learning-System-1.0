const router = require('express').Router();
const auth = require('../middleware/AuthMiddleware');
const { getProgress, getWeeklyActivity, getTopicsMastery, getPerformanceTrends } = require('../controllers/progress');

/**
 * PROGRESS ROUTES
 * All analytics and progress tracking endpoints
 */

// Get overall progress and stats
router.get('/', auth, getProgress);

// Get last 7 days activity (for charts)
router.get('/weekly-activity', auth, getWeeklyActivity);

// Get progress on different topics/courses
router.get('/topics-mastery', auth, getTopicsMastery);

// Get quiz score trends over time
router.get('/performance-trends', auth, getPerformanceTrends);

module.exports = router;