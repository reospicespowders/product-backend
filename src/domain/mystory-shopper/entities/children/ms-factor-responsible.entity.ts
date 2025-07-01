import mongoose from "mongoose";
import { FactorStatus, ApprovalStatus } from "../../enums/approval-status.enum";


export const MSFactorResponsibleSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-project'
    },
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-channel'
    },
    branchId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-channel'
    },
    factorId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-factor'
    },
    responsible: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    rsComments: {
        type: String
    },
    status: {
        type: String,
        enum: [...Object.values(FactorStatus)],
        default: 'Pending'
    },
    approvalStatus: {
        type: String,
        enum: [...Object.values(ApprovalStatus)]
    },
    approvalComments: {
        type: String
    },
    repeat: {
        type: Number,
        default: 0
    },
}, { strict: true, timestamps: true })