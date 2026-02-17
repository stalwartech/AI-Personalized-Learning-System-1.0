const mongoose = require("mongoose");

// Daily activity sub schema (Embedded)
const dailyActivitySchema = new mongoose.Schema({
    date: {type: Date, required: true},
    timeSpent: {type: Number, required: true}, // minutes
    lessonsCompleted: {type: Number, default: 0},
},
{_id: false}
)