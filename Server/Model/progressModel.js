const mongoose = require("mongoose");

// Daily activity sub schema (Embedded)
const dailyActivitySchema = new mongoose.Schema({ // This show th daily activity of the user
    date: {type: Date, required: true}, // This shows the date and time
    timeSpent: {type: Number, required: true}, // minutes
    lessonsCompleted: {type: Number, default: 0}, // This shows the value of the completed lessons
},
{_id: false}

)