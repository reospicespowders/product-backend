import mongoose from "mongoose";
import { ApprovalStatus } from "../../enums/approval-status.enum";



export const MSSubCriteriaSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-project'
    },
    criteriaId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-criteria'
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