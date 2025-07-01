import mongoose from "mongoose";
import { FactorStatus } from "../enums/approval-status.enum";


export const MSFactorLogsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    factorId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-factor'
    },
    comments: {
        type: String
    },
    status: {
        type: String,
        enum: [...Object.values(FactorStatus)]
    },
    oldStatus: {
        type: String,
        enum: [...Object.values(FactorStatus)]
    }
}, { strict: true, timestamps: true })