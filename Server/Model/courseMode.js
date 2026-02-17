const mongoose = require("mongoose");

// This is my video schema 
const videoSchema = new mongoose({
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
const noteSchema = new mongoose({
    plaintext: String,
    pdfUrl: String,
})

// lesson sub-schema (Embedded inside course)
const lessonSchema = new mongoose({
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
const progressSchema = new mongoose({
    completedLessons: {type:Number, default: 0},
    totalLessons: {type:Number, default: 0},
    percentage: {type:Number, default: 0}
},
{_id: false}
)

// Analytic sub-Schema (Embedded inside course)
const analyticSchema = new mongoose({
    totalTimeSpent: {type:Number, default:0},
    averageQuizScore: { type: Number, default: 0},
    lastAccessed: {type: Date, default: Date.now}
},
{_id: false}
);
