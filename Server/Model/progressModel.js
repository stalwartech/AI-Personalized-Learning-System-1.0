const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// DAILY ACTIVITY SUB-SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
// Tracks what the user did each day
// Example: On Monday, spent 45 minutes, completed 3 lessons
// ─────────────────────────────────────────────────────────────────────────────
const dailyActivitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true  // The specific day (e.g., 2025-02-20)
  },
  timeSpent: {
    type: Number,
    default: 0  // How many minutes spent learning that day
  },
  lessonsCompleted: {
    type: Number,
    default: 0  // How many lessons finished that day
  }
}, { _id: false });

// ─────────────────────────────────────────────────────────────────────────────
// WEAK AREA SUB-SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
// Tracks topics where the user scored poorly (< 75%)
// Used to suggest what to review
// ─────────────────────────────────────────────────────────────────────────────
const weakAreaSchema = new mongoose.Schema({
  topic: String,     // "JavaScript Loops"
  score: Number,     // 68 (their quiz score)
  courseId: mongoose.Schema.Types.ObjectId,  // Which course it's from
  lastReviewed: Date  // When they last looked at it
}, { _id: false });

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PROGRESS SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
// One progress document per user (tracks everything they've done)
// ─────────────────────────────────────────────────────────────────────────────
const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // Each user has exactly ONE progress document
  },
  
  // Overall statistics
  totalStats: {
    totalLearningTime: {
      type: Number,
      default: 0  // Total minutes across all courses
    },
    coursesGenerated: {
      type: Number,
      default: 0  // How many courses created
    },
    coursesCompleted: {
      type: Number,
      default: 0  // How many courses finished (100%)
    },
    coursesInProgress: {
      type: Number,
      default: 0  // How many courses started but not finished
    },
    averageQuizScore: {
      type: Number,
      default: 0  // Average score across ALL quizzes
    },
    totalLessonsCompleted: {
      type: Number,
      default: 0  // Total lessons finished across all courses
    }
  },
  
  // EMBEDDED: Array of daily activities (last 90 days)
  dailyActivity: [dailyActivitySchema],
  
  // Learning velocity (how fast they're learning)
  learningVelocity: {
    lessonsPerDay: {
      type: Number,
      default: 0  // Average lessons completed per day
    },
    daysPerCourse: {
      type: Number,
      default: 0  // Average days to complete a course
    },
    avgSessionLength: {
      type: Number,
      default: 0  // Average minutes per study session
    },
    activeDaysPerWeek: {
      type: Number,
      default: 0  // How many days per week they study
    }
  },
  
  // EMBEDDED: Topics they need to review
  weakAreas: [weakAreaSchema]
  
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────────────────
// INSTANCE METHOD - Add or update today's activity
// ─────────────────────────────────────────────────────────────────────────────
// Called when user completes a lesson
// Example: progress.addActivity(25, 1); // 25 minutes, 1 lesson
// ─────────────────────────────────────────────────────────────────────────────
progressSchema.methods.addActivity = function(timeSpent, lessonsCompleted) {
  // Get today's date at midnight (ignore hours/minutes/seconds)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if we already have an entry for today
  const existingActivity = this.dailyActivity.find(activity => {
    return activity.date.getTime() === today.getTime();
  });
  
  if (existingActivity) {
    // Today already exists - update it
    existingActivity.timeSpent += timeSpent;
    existingActivity.lessonsCompleted += lessonsCompleted;
  } else {
    // Today doesn't exist yet - create new entry
    this.dailyActivity.push({
      date: today,
      timeSpent: timeSpent,
      lessonsCompleted: lessonsCompleted
    });
  }
  
  // Keep only the last 90 days to save space
  if (this.dailyActivity.length > 90) {
    // Remove oldest entries, keep most recent 90
    this.dailyActivity = this.dailyActivity.slice(-90);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTANCE METHOD - Calculate learning velocity
// ─────────────────────────────────────────────────────────────────────────────
// Looks at last 7 days and calculates how fast user is learning
// Example: progress.calculateVelocity();
// ─────────────────────────────────────────────────────────────────────────────
progressSchema.methods.calculateVelocity = function() {
  // Get last 7 days of activity
  const lastSevenDays = this.dailyActivity.slice(-7);
  
  // If no data, exit early
  if (lastSevenDays.length === 0) {
    return;
  }
  
  // Count total lessons in last 7 days
  const totalLessons = lastSevenDays.reduce((sum, day) => {
    return sum + day.lessonsCompleted;
  }, 0);
  
  // Average lessons per day = total / 7
  this.learningVelocity.lessonsPerDay = Number((totalLessons / 7).toFixed(1));
  
  // Count total time in last 7 days
  const totalTime = lastSevenDays.reduce((sum, day) => {
    return sum + day.timeSpent;
  }, 0);
  
  // Count how many days user actually studied (timeSpent > 0)
  const activeDays = lastSevenDays.filter(day => day.timeSpent > 0).length;
  this.learningVelocity.activeDaysPerWeek = activeDays;
  
  // Average session length = total time / active days
  if (activeDays > 0) {
    this.learningVelocity.avgSessionLength = Math.round(totalTime / activeDays);
  } else {
    this.learningVelocity.avgSessionLength = 0;
  }
};

module.exports = mongoose.model('Progress', progressSchema);