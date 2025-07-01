import mongoose from "mongoose";



export const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        default: '',
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    ous: [{
        type: mongoose.Types.ObjectId,
        ref: 'Organizational-Unit',
    }],
    targetUsers: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
    ],
    seenBy: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            seenAt: {
                type: String,
            },
        }
    ],
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
        default: null
    },
    questionBankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'question-bank',
        default: null
    },
    ignoredBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    ignoreLimit: {
        type: Number,
    },
    startDate: {
        type: String,
    },
    endDate: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { strict: true, timestamps: true })