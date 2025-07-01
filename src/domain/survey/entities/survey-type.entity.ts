import mongoose from "mongoose";

export const SurveyTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    requiredAttendance: {
        type: Boolean,
        default: false
    },
    tag: {
        type: mongoose.Types.ObjectId,
        ref: 'survey-tag'
    },
    active: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
}, { strict: true, timestamps: true });

export const SurveyTagSchema = new mongoose.Schema({
    tag: {
        type: String
    },
    arabic: {
        type: String
    },
    type: {
        type: String
    }
}, { strict: true, timestamps: true })