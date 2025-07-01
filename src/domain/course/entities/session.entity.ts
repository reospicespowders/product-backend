import mongoose from "mongoose";
import { SessionContentType } from "../enums/session-type.enum";
const Schema = mongoose.Schema

export const SessionSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    type: {
        type: String,
    },
    trainer: {
        type: Object,
    },
    address: {
        type: Object
    },
    date: {
        type: String
    },
    start_time: {
        type: String
    },
    end_time: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    attendance: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    seenby: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    attendanceProof: {
        type: Object
    },
    history: {
        type: String
    },
    status: {
        type: String
    },
    sessionType: {
        type: String,
        enum: [...Object.values(SessionContentType)],
    },
    locationLink: {
        type: String
    },
    video_mode: {
        type: String
    },
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: 'course'
    },
    order: {
        type: Number,
        default: 0
    }
},
    { strict: false, timestamps: true }
)