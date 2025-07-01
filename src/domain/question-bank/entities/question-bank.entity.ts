import mongoose from 'mongoose';

export const QuestionBankSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        tag: {
            type: mongoose.Types.ObjectId,
            ref: 'survey-tags'
        },
        active: {
            type: Boolean,
            default: true
        },
        standard: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            enum: ['QB','Topic']
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    },
    { strict: true, timestamps: true },
);