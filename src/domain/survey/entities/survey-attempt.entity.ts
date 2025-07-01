import mongoose from "mongoose";
import { QuestionSchema } from "./survey.entity";


export const SurveyAttemptSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Types.ObjectId,
        ref: 'survey'
    },
    questions: [QuestionSchema],
    externalQuestions: [QuestionSchema],
    email: {
        type: String,
        require: true
    },
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: 'courses'
    },
    ratingFor: {
        type: String,
        require: false
    },
    ratingForID: {
        type: String,
        require: false
    },
    ratingSubmitted: {
        type: Boolean,
        default: false,
        require: false
    },
    externalName: {
        type: String,
        require: true
    },
    attemptFor: {
        type:  mongoose.Types.ObjectId,
        require: true
    },
    externalFields: {
        type: Object,
    },
    timeTaken: {
        type: Number,
        default: 0
    },
    externalGender: {
        type: String
    },
    attemptStartDate: {
        type: String,
    },
    attemptEndDate: {
        type: String,
    },
    isRedoAllow: {
        type: Boolean,
        default: false,
    },
    attempt: {
        type: Number,
        default: 1,
    },
}, { strict: true, timestamps: true });