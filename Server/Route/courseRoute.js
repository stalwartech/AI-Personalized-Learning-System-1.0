const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../Middleware/authMiddleware');
const courseMiddleware = require("../Middleware/courseLimit")
const generateCourse = require("../Controller/course/generateCourse");
const getCourseHistory = require("../Controller/course/getCourseHistory");
const getSingleCourse = require("../Controller/course/getSingleCourse");
const selectVideo = require("../Controller/course/selectVideo");
const completeLesson = require("../Controller/course/completeLesson");
const deleteCourse = require("../Controller/course/deleteCourseController");
const downloadPDF = require("../Controller/course/downloadPDFController");

/** * COURSE ROUTES FOR COURSES* All courses related endpoints */
// ─── Validation Rules ─────────────────────────────────────────────────────────
const generateValidation = [
  body('query').trim().notEmpty().withMessage('Search query is required'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty')
];

const videoValidation = [  body('videoId').trim().notEmpty().withMessage('Video ID is required')];

const completeLessonValidation = [
  body('quizScore').optional().isInt({ min: 0, max: 100 }).withMessage('Quiz score must be 0-100'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be positive')
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// PDF download (public - anyone with link can download)
router.get('/notes/pdf/:filename', downloadPDF);

// Generate new course (main feature!)
router.post('/generate', auth, generateValidation, generateCourse); // Working perfectly now

// Get list of user's courses
router.get('/history', auth, getCourseHistory); // Working perfectly now

// Get single course with all details
router.get('/:courseId', auth, getSingleCourse); // Working perfectly now

// Delete a course
router.delete('/:courseId', auth, deleteCourse); // Working Perfectly now

// Select which video to use for a lesson
router.put('/:courseId/lessons/:lessonId/video', auth, videoValidation, selectVideo); // Neede to be removed

// Mark lesson as completed
router.put('/:courseId/lessons/:lessonId/complete', auth, completeLessonValidation, completeLesson);
router.patch('/:courseId/lessons/:lessonId/complete', auth, completeLessonValidation, completeLesson);

module.exports = router;
