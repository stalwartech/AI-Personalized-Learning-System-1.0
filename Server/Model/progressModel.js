const mongoose = require("mongoose");

// Daily activity sub schema (Embedded)
const dailyActivitySchema = new mongoose.Schema({ 
    date: {type: Date, required: true}, 
    timeSpent: {type: Number, required: true}, // minutes
    lessonsCompleted: {type: Number, default: 0}, 
},
{_id: false});

// Weak area sub- schema (embedded)
const weakAreaSchema = new mongoose.Schema({
    topic: String,
    score: Number,
    courseId: mongoose.Schema.Types.ObjectId,
    lastReviewed: Date
}, {_id: false});

// Main progress schema 
const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auths",
        required: true,
        unique: true
    },
    totalStats: {
        totalLearningTime: {type: Number, defualt: 0}, // Minutes 
        courseGenerated: {type: Number, default: 0},
        courseCompleted: {type: Number, default: 0},
        courseInProgress: {type: Number, default: 0},
        averageQuizScore: {type: Number, default: 0},
        totalLessonsCompleted: {type: Number, default: 0},
    },
    dailyActivity: [dailyActivitySchema],
    weakAreas: [weakAreaSchema],
    learningVelocity: {
        lessonsPerDay:{type: Number, default: 0},
        dayPerCourse: {type: Number, default: 0},
        avgSessionLength: {type: Number, default: 0},
        activityDaysPerWeek: {type: Number, default: 0}
    },
}, {timestamps: true});

// Add or update today's acitivity 
progressSchema.methods.addActivity = function(timeSpent, lessonsCompleted){
    const today = new Date();
    today.setHours(0,0,0,0);

    const existing = this.dailyActivity.find(a => a.date.getTime() === today.getTime());

    if(existing){
        existing.timeSpent += timeSpent;
        existing.lessonsCompleted += lessonsCompleted;
    }
    else{
        this.dailyActivity.push({date: today, timeSpent, lessonsCompleted});
    }

    // Keep only last 90 days
    if(this.dailyActivity.length > 90){
        this.dailyActivity.slice(-90);
    }
}


// ── Recalculate learning velocity from last 7 days ───────────────────────────
progressSchema.methods.calculateVelocity = function () {
  const last7 = this.dailyActivity.slice(-7);
  if (!last7.length) return;

  const totalLessons = last7.reduce((s, d) => s + d.lessonsCompleted, 0);
  const totalTime    = last7.reduce((s, d) => s + d.timeSpent, 0);
  const activeDays   = last7.filter(d => d.timeSpent > 0).length;

  this.learningVelocity.lessonsPerDay     = Number((totalLessons / 7).toFixed(1));
  this.learningVelocity.activeDaysPerWeek = activeDays;
  this.learningVelocity.avgSessionLength  = activeDays > 0
    ? Math.round(totalTime / activeDays) : 0;
};

module.exports = mongoose.model('Progress', progressSchema);