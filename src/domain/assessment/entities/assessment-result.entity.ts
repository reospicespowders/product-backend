import mongoose from "mongoose";
import { QuestionSchema } from "src/domain/survey/entities/survey.entity";



export const AssessmentResultSchema = new mongoose.Schema({
    assessmentId: {
        type: mongoose.Types.ObjectId,
        ref: 'assessment'
    },
    questions: [QuestionSchema],
    externalQuestions: [QuestionSchema],
    email: {
        type: String,
        require: true
    },
    externalName: {
        type: String,
        default: '',
    },
    score: {
        type: Number,
        require: true,
        default: 0
    },
    totalmarks: {
        type: Number,
        require: true,
        default: 0
    },
    isScoreMarked: {
        type: Boolean,
        default: false,
    },
    showResult: {
        type: Boolean,
        default: false,
    },
    attempt: {
        type: Number,
        default: 1,
    },
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: 'courses'
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
})