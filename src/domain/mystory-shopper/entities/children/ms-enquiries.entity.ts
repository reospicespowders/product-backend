import mongoose from "mongoose";
import { ApprovalStatus } from "../../enums/approval-status.enum";



export const MSEnquirySchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-project'
    },
    factorId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-factor'
    },
    enquiry: {
        type: String
    },
    correctAnswer: {
        type: String
    },
    serviceUrl: {
        type: String
    },
    approvalStatus: {
        type: String,
        enum: [...Object.values(ApprovalStatus)]
    },
    comments: {
        type: String
    },
}, { strict: true, timestamps: true })