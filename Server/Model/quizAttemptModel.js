const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: String,
  selectedAnswer: String,
  correctAnswer: String,
  isCorrect: Boolean,
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'auth',
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null,
  },
  topic: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    enum: ['course', 'random'],
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  answers: {
    type: [answerSchema],
    default: [],
  },
}, { timestamps: true });

quizAttemptSchema.index({ userId: 1, createdAt: -1 });
quizAttemptSchema.index({ userId: 1, quizId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
