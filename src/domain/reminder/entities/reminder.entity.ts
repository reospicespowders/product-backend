import mongoose from "mongoose";


export const ReminderSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Types.ObjectId,
        ref: 'survey',
    },
    assessmentId: {
        type: mongoose.Types.ObjectId,
        ref: 'assessment',
    },
    trainingId: {
        type: mongoose.Types.ObjectId,
        ref: 'course',
    },
    type: {
        type: String,
        require: true,
    },
    date: {
        type: Date,
        require: true,
    },
    daysBefore: {
        type: Number,
        require: true,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
    },
}, { strict: false, timestamps: true })