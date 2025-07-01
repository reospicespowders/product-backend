import mongoose from "mongoose";

export const AssessmentGroupSchema = new mongoose.Schema({
    assessmentIds: [
        {
        type: mongoose.Types.ObjectId,
        ref: 'assessments'
    }],
    
}, { strict: true, timestamps: true })