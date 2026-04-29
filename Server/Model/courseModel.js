const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// SUB-SCHEMAS - These are "nested" inside the main Course schema
// ─────────────────────────────────────────────────────────────────────────────
// Think of it like a folder structure:
// Course (folder)
//   ├── lessons/ (sub-folder)
//   │   ├── videoOptions/ (sub-sub-folder)
//   │   └── notes/ (sub-sub-folder)
//   ├── progress/ (sub-folder)
//   └── analytics/ (sub-folder)
// ─────────────────────────────────────────────────────────────────────────────

// Video data stored inside each lesson
const videoSchema = new mongoose.Schema({
  title: String,           // "JavaScript Variables Explained"
  videoId: String,         // "dQw4w9WgXcQ" (YouTube ID)
  thumbnail: String,       // URL to thumbnail image
  channelTitle: String,    // "Programming with Mosh"
  duration: String,        // "15m 30s"
  viewCount: String,       // "2.5M views"
  url: String,            // Full YouTube URL
  embedUrl: String        // Embed URL for iframe
}, { _id: false }); // Don't create separate IDs for videos

// Notes stored inside each lesson
const notesSchema = new mongoose.Schema({
  plainText: String,  // Plain text version (no markdown symbols)
  markdown: String,   // Markdown version (with # headers, **bold**, etc)
  pdfUrl: String     // URL to download PDF file
}, { _id: false });

// Each lesson inside a course
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true  // Must have a title
  },
  order: {
    type: Number,
    required: true  // Lesson 1, Lesson 2, etc.
  },
  content: {
    type: String,
    required: true  // The actual learning content (200-300 words)
  },
  // EMBEDDED: 3 YouTube videos stored directly in this lesson
  videoOptions: [videoSchema],
  
  selectedVideo: {
    type: String,      // Which video the user chose
    default: null      // null means they haven't chosen yet
  },
  
  // EMBEDDED: Notes stored directly in this lesson
  notes: notesSchema,
  
  estimatedDuration: {
    type: Number,      // How long to complete (in minutes)
    default: 15
  },
  completed: {
    type: Boolean,
    default: false     // Has user finished this lesson?
  },
  quizScore: {
    type: Number,
    default: null      // null = not taken yet, 0-100 = score
  }
});

// Progress tracking embedded in course
const progressSchema = new mongoose.Schema({
  completedLessons: {
    type: Number,
    default: 0  // How many lessons done
  },
  totalLessons: {
    type: Number,
    default: 0  // Total number of lessons
  },
  percentage: {
    type: Number,
    default: 0  // 0-100% complete
  }
}, { _id: false });

// Analytics embedded in course
const analyticsSchema = new mongoose.Schema({
  totalTimeSpent: {
    type: Number,
    default: 0  // Total minutes spent on this course
  },
  averageQuizScore: {
    type: Number,
    default: 0  // Average score across all quizzes (0-100)
  },
  lastAccessed: {
    type: Date,
    default: Date.now  // When was course last opened
  }
}, { _id: false });

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COURSE SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Links to User model
    required: true
  },
  title: {
    type: String,
    required: true  // "JavaScript Programming Fundamentals"
  },
  description: {
    type: String  // Brief description of what course covers
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  searchQuery: {
    type: String,
    required: true  // What the user searched for
  },
  category: {
    type: String,
    default: 'General'  // "Programming", "Cooking", "Music", etc.
  },
  
  // ── EMBEDDED LESSONS ARRAY ──
  // All lessons are stored directly inside this course document
  // NOT in a separate collection
  lessons: [lessonSchema],
  
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  
  // ── EMBEDDED PROGRESS ──
  progress: {
    type: progressSchema,
    default: () => ({})
  },
  
  // ── EMBEDDED ANALYTICS ──
  analytics: {
    type: analyticsSchema,
    default: () => ({})
  }
  
}, { timestamps: true }); // Auto-add createdAt and updatedAt

// ─────────────────────────────────────────────────────────────────────────────
// INSTANCE METHOD - Recalculate course progress
// ─────────────────────────────────────────────────────────────────────────────
// Call this whenever a lesson is completed
// Example: course.updateProgress(); await course.save();
// ─────────────────────────────────────────────────────────────────────────────
courseSchema.methods.updateProgress = function() {
  if (!this.progress) {
    this.progress = {};
  }

  if (!this.analytics) {
    this.analytics = {};
  }

  // Count how many lessons are marked as completed
  const completedLessonsCount = this.lessons.filter(lesson => lesson.completed === true).length;
  
  // Update progress object
  this.progress.completedLessons = completedLessonsCount;
  this.progress.totalLessons = this.lessons.length;
  
  // Calculate percentage (avoid division by zero)
  if (this.lessons.length > 0) {
    this.progress.percentage = Math.round((completedLessonsCount / this.lessons.length) * 100);
  } else {
    this.progress.percentage = 0;
  }
  
  // Auto-update status based on progress
  if (this.progress.percentage === 100) {
    this.status = 'completed';
  } else if (this.progress.percentage > 0) {
    this.status = 'in-progress';
  }
  
  // Calculate average quiz score from all completed lessons
  const lessonsWithScores = this.lessons.filter(lesson => lesson.quizScore !== null);
  
  if (lessonsWithScores.length > 0) {
    // Add up all scores and divide by count
    const totalScore = lessonsWithScores.reduce((sum, lesson) => sum + lesson.quizScore, 0);
    this.analytics.averageQuizScore = Math.round(totalScore / lessonsWithScores.length);
  }
};

module.exports = mongoose.model('Course', courseSchema);
