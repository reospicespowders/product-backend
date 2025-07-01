import mongoose from "mongoose";
import { ApprovalStatus } from "../enums/approval-status.enum";



export const MSEvaluationSchema = new mongoose.Schema({
    factors: [{
        factorId: {
            type: mongoose.Types.ObjectId,
            ref: 'ms-factor'
        },
        grade: {
            type: Number,
            default: 0
        },
        percentage: {
            type: Number,
            default: 0
        },
        msComments: {
            type: String
        },
    }],
    enquiries: [{
        enquiryId: {
            type: mongoose.Types.ObjectId,
            ref: 'ms-enquiry'
        },
        employeeAnswer: {
            type: String
        },
        msComments: {
            type: String
        }
    }],

    projectId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-project'
    },

    channel: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-channel'
    },

    branch: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-channel'
    },

    visitTime: {
        type: Date
    },

    vendorComments: {
        type: String
    },
    internalPMComments: {
        type: String
    },
    approvalStatus: {
        type: String,
        enum: [...Object.values(ApprovalStatus)]
    },
}, { strict: true, timestamps: true })