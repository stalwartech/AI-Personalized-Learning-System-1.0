const mongoose = require("mongoose");

// Daily activity sub schema (Embedded)
const dailyActivitySchema = new mongoose.Schema({ // This show th daily activity of the user
    date: {type: Date, required: true},
    timeSpent: {type: Number, required: true}, // minutes
    lessonsCompleted: {type: Number, default: 0},
},
{_id: false}

)