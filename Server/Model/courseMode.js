const mongoose = require("mongoose");

// This is my video schema 
const videoSchema = new mongoose.Schema({
    title: String,
    videoId: String,
    thumbnail: String,
    channelTitle: String,
    duration: String,
    viewCount: String,
    url: String,
    embedUrl: String 
},
{_id: false}
);

// Notes sub-schema (Embedded inside lesson)
const noteSchema = new mongoose.Schema({
    plaintext: String,
    pdfUrl: String,
})

// lesson sub-schema (Embedded inside course)
const lessonSchema = new mongoose.Schema({
    title: {type: String, required: true},
    order: {type: Number, required: true},
    content: {type: String, required: true},
    videoOptions: [videoSchema],
    selectedVideo: {type: String, default: null},
    notes: noteSchema,
    estimatedDuration: {type: Number, default: 15}, //minutes
    completed: {type: Boolean, default: false},
    quizScore: {type: Number, default: null}
});

// Progress Sub-schema (Embedded inside course)
const progressSchema = new mongoose.Schema({
    completedLessons: {type:Number, default: 0},
    totalLessons: {type:Number, default: 0},
    percentage: {type:Number, default: 0}
},
{_id: false}
)

// Analytic sub-Schema (Embedded inside course)
const analyticSchema = new mongoose.Schema({
    totalTimeSpent: {type:Number, default:0},
    averageQuizScore: { type: Number, default: 0},
    lastAccessed: {type: Date, default: Date.now}
},
{_id: false}
);

// Course schema (The parent schema of all)
const courseSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "auths",
        required: true
    },
    title: {type: String, required:  true},
    description: {type: String, required: true},
    difficulty: {type: String, enum:["Beginner", "Intermediate", "Advance"], required: true},
    searchQuery: {type: String, required: true},
    category: {type: String, default: "General"},
    lessons: [lessonSchema], // Embdedded array
    status:{type: String, enum: ["in-progress", "completed", "abandoned"], default: "in-progress"},
    progress: progressSchema,
    analytic: analyticSchema,
},
{timestamps: true}
);
