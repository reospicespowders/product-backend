import mongoose from "mongoose";
import { QuestionSchema } from 'src/domain/survey/entities/survey.entity';



export const QuestionBankTopicSchema = new mongoose.Schema({
    questionBankId: {
        type: mongoose.Types.ObjectId,
        ref: 'question-bank'
    },
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    service: {
        type: Object,
        require: true,
    },
    topic: {
        type: mongoose.Types.ObjectId,
        ref: 'question-bank'
    },
    type: {
        type: String,
        enum: ['Service','Topic']
    },
    questions: [QuestionSchema],
}, { strict: true, timestamps: true })