const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Database = require("../Config/db");

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
    },
    isPremium: {
        type: Boolean,
        required: true,
        default: false
    },
    preferences: {
        learningPace: {
            type: String,
            enum: ['relaxed', 'moderate', 'intensive'],
            default: 'moderate'
        },
        defaultDifficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        }
    }
}, { timestamps: true });

authSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

const authModel = mongoose.model("auth", authSchema);

module.exports = authModel;
