const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator(options) {
        return options.length >= 2;
      },
      message: 'A quiz question must have at least two options'
    }
  },
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
}, { _id: false });

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'auth',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    enum: ['course', 'random'],
    default: 'course'
  },
  questions: {
    type: [questionSchema],
    default: []
  }
}, { timestamps: true });

quizSchema.index({ userId: 1, courseId: 1, source: 1 });
quizSchema.index({ userId: 1, topic: 1, source: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
