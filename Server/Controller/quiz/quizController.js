const { validationResult } = require('express-validator');
const Course = require('../../Model/courseModel');
const Quiz = require('../../Model/quizModel');
const QuizAttempt = require('../../Model/quizAttemptModel');
const generateQuiz = require('../../Services/AIGenerateQuizService');

const FREE_QUIZ_LIMIT = 3;
const FREE_QUIZ_GENERATION_LIMIT = 2;
const MIN_QUIZ_QUESTIONS = 10;

const shapeQuizResponse = (quiz, user) => {
  const isPremium = Boolean(user?.isPremium);
  const accessibleQuestions = isPremium
    ? quiz.questions
    : quiz.questions.slice(0, FREE_QUIZ_LIMIT);

  return {
    quiz: {
      _id: quiz._id,
      courseId: quiz.courseId,
      topic: quiz.topic,
      source: quiz.source,
      totalQuestions: quiz.questions.length,
      accessibleQuestions: accessibleQuestions.length,
      questions: accessibleQuestions,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    },
    access: {
      isPremium,
      freeLimit: FREE_QUIZ_LIMIT,
      lockedQuestions: isPremium ? 0 : Math.max(0, quiz.questions.length - FREE_QUIZ_LIMIT),
      upgradeRequired: !isPremium && quiz.questions.length > FREE_QUIZ_LIMIT,
    },
  };
};

const buildCourseContext = (course) => {
  return course.lessons
    .map((lesson) => `${lesson.order}. ${lesson.title}: ${lesson.content}`)
    .join('\n')
    .slice(0, 6000);
};

const ensureQuizGenerationAllowed = async (req, res) => {
  if (req.user?.isPremium) {
    return true;
  }

  const quizzesGenerated = await Quiz.countDocuments({ userId: req.userId });

  if (quizzesGenerated >= FREE_QUIZ_GENERATION_LIMIT) {
    res.status(403).json({
      success: false,
      message: `Free users can generate up to ${FREE_QUIZ_GENERATION_LIMIT} quizzes. Upgrade to premium to generate more quizzes.`,
      limit: FREE_QUIZ_GENERATION_LIMIT,
      quizzesGenerated,
      upgradeRequired: true,
    });
    return false;
  }

  return true;
};

const getCourseQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      userId: req.userId,
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isComplete = course.status === 'completed' || course.progress?.percentage === 100;

    if (!isComplete) {
      return res.status(400).json({
        success: false,
        message: 'Complete this course before taking the course quiz.',
      });
    }

    let quiz = await Quiz.findOne({
      userId: req.userId,
      courseId: course._id,
      source: 'course',
    });

    if (!quiz || quiz.questions.length < MIN_QUIZ_QUESTIONS) {
      const canGenerate = await ensureQuizGenerationAllowed(req, res);
      if (!canGenerate) return;

      const questions = await generateQuiz({
        topic: course.title || course.searchQuery,
        context: buildCourseContext(course),
      });

      quiz = await Quiz.findOneAndUpdate(
        {
          userId: req.userId,
          courseId: course._id,
          source: 'course',
        },
        {
          userId: req.userId,
          courseId: course._id,
          topic: course.title || course.searchQuery,
          source: 'course',
          questions,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      data: shapeQuizResponse(quiz, req.user),
    });
  } catch (error) {
    console.error('Get course quiz error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating course quiz',
      error: error.message,
    });
  }
};

const getRandomQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const topic = req.query.topic.trim();
    const canGenerate = await ensureQuizGenerationAllowed(req, res);
    if (!canGenerate) return;

    const questions = await generateQuiz({ topic });
    const quiz = await Quiz.create({
      userId: req.userId,
      topic,
      source: 'random',
      questions,
    });

    return res.status(200).json({
      success: true,
      data: shapeQuizResponse(quiz, req.user),
    });
  } catch (error) {
    console.error('Get random quiz error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating random quiz',
      error: error.message,
    });
  }
};

const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers = {} } = req.body;

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.userId,
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const availableQuestions = req.user?.isPremium
      ? quiz.questions
      : quiz.questions.slice(0, FREE_QUIZ_LIMIT);

    const normalizedAnswers = availableQuestions.map((question, index) => {
      const selectedAnswer = String(answers[index] || '');

      return {
        question: question.question,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: selectedAnswer === question.correctAnswer,
      };
    });

    const score = normalizedAnswers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = availableQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const attempt = await QuizAttempt.create({
      userId: req.userId,
      quizId: quiz._id,
      courseId: quiz.courseId,
      topic: quiz.topic,
      source: quiz.source,
      score,
      totalQuestions,
      percentage,
      answers: normalizedAnswers,
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz attempt saved',
      data: { attempt },
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving quiz attempt',
      error: error.message,
    });
  }
};

const getQuizHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const totalAttempts = attempts.length;
    const averageScore = totalAttempts > 0
      ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts)
      : 0;
    const bestScore = totalAttempts > 0
      ? Math.max(...attempts.map((attempt) => attempt.percentage))
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        attempts,
        stats: {
          totalAttempts,
          averageScore,
          bestScore,
        },
      },
    });
  } catch (error) {
    console.error('Get quiz history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching quiz history',
      error: error.message,
    });
  }
};

module.exports = {
  getCourseQuiz,
  getRandomQuiz,
  submitQuizAttempt,
  getQuizHistory,
};
