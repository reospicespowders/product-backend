import mongoose from "mongoose";
import { ApprovalStatus, ProjectStep } from "../enums/approval-status.enum";



export const MSStepSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-project'
    },
    sessionId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-session'
    },
    approvalStatus: {
        type: String,
        enum: [...Object.values(ApprovalStatus)]
    },
    comments: {
        type: String
    },
    step: {
        type: String,
        enum: [...Object.values(ProjectStep)]
    },
    doneBy: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    isViewedInternal: {
        type: Boolean,
        default: false,
    },
    isViewedExternal: {
        type: Boolean,
        default: false,
    },
}, { strict: true, timestamps: true })