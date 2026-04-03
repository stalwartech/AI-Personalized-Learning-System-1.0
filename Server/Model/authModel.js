const mongoose = require("mongoose");
const Database = require("../config/db");

const authSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });


const authModel = mongoose.model("auth", authSchema);

module.exports = authModel;
