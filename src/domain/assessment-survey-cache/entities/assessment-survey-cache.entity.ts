import mongoose from "mongoose";
const Schema = mongoose.Schema;


export const AssessmentSurveyCacheSchema = new mongoose.Schema(
    {
        data: {
            type: Object,
        },
    },
    { strict: false , timestamps:true}
);

export class AssessmentSurveyCache {
    data:any;
}