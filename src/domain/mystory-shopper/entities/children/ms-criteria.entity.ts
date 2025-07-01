import mongoose from "mongoose";
import { ApprovalStatus } from "../../enums/approval-status.enum";



export const MSCriteriaSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-project'
    },
    channel: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-channel'
    },
    criteria: {
        type: String,
        required: true
    },
    approvalStatus: {
        type: String,
        enum: [...Object.values(ApprovalStatus)]
    },
    comments: {
        type: String
    },
}, { strict: true, timestamps: true })