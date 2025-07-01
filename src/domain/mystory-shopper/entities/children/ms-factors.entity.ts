import mongoose from "mongoose";
import { ApprovalStatus, FactorStatus } from "../../enums/approval-status.enum";



export const MSFactorSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-project'
    },
    subCriteriaId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-sub-criteria'
    },
    factor: {
        type: String
    },
    //TODO:Update type of this according to discussion
    measuringType: {
        type: String
    },
    approvalStatus: {
        type: String,
        enum: [...Object.values(ApprovalStatus)]
    },
    reason: {
        type: String,
    },
    comments: {
        type: String
    },
    status: {
        type: String,
        enum: [...Object.values(FactorStatus)],
        default: 'Pending'
    },
    repeat: {
        type: Number,
        default: 0
    },
}, { strict: true, timestamps: true })