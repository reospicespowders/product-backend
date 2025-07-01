import mongoose from "mongoose";
import { SurveyAttendanceMarkType, SurveyAttendanceStatus } from "../dto/survey-attendance.dto";

export const SurveyAttendanceSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Types.ObjectId,
        ref: 'survey',
        required: true
    },
    attendance: {
        type: [{
            email: {
                type: String,
                require: true
            },
            status: {
                type: String,
                enum: [...Object.values(SurveyAttendanceStatus)],
                default: SurveyAttendanceStatus.Pending
            },
            markType: {
                type: String,
                enum: [...Object.values(SurveyAttendanceMarkType)],
                default: SurveyAttendanceMarkType.Pending
            },
            timestamp: {
                type: Date,
                default: null
            }
        }],
        default: []
    }
}, { timestamps: true })