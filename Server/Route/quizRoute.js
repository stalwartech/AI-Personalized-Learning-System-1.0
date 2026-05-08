const router = require('express').Router();
const { query } = require('express-validator');
const auth = require('../Middleware/authMiddleware');
const { getCourseQuiz, getRandomQuiz, submitQuizAttempt, getQuizHistory } = require('../Controller/quiz/quizController');

const randomQuizValidation = [
  query('topic').trim().notEmpty().withMessage('Topic is required'),
];

router.get('/course/:courseId', auth, getCourseQuiz);
router.get('/random', auth, randomQuizValidation, getRandomQuiz);
router.get('/history', auth, getQuizHistory);
router.post('/:quizId/attempts', auth, submitQuizAttempt);

module.exports = router;
