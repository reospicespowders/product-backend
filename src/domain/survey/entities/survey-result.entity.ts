import mongoose from "mongoose";
import { QuestionSchema } from "src/domain/survey/entities/survey.entity";



export const SurveyResultSchema = new mongoose.Schema({
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
    externalName: {
        type: String,
        default: '',
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
    attempt: {
        type: Number,
        default: 1,
    },
})