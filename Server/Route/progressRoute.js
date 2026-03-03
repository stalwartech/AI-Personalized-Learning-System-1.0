const router = require('express').Router();
const auth = require('../Middleware/authMiddleware');
const getProgress = require("../Controller/progress/getProgressController");
const getWeeklyActivity = require("../Controller/progress/getWeeklyActivityController")
const getTopicsMastery = require("../Controller/progress/getTopicMasteryController")
const getPerformanceTrends = require("../Controller/progress/getperformanceTrendsController")

/**
 * PROGRESS ROUTES
 * All analytics and progress tracking endpoints
 */

// Get overall progress and stats
router.get('/', auth, getProgress); //Working perfectly now

// Get last 7 days activity (for charts)
router.get('/weekly-activity', auth, getWeeklyActivity); // Working perfectly now

// Get progress on different topics/courses
router.get('/topics-mastery', auth, getTopicsMastery); // Working perfectly now

// Get quiz score trends over time
router.get('/performance-trends', auth, getPerformanceTrends); // Working perfectly now

module.exports = router;