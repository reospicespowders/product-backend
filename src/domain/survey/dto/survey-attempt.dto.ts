import { Types } from "mongoose";
import { Question } from "./survey.dto";
import { IntersectionType } from "@nestjs/swagger";


export class SurveyAttempt {
    surveyId:string;
    questions:Array<Question>;
    email:string;
    courseId?:string;
    ratingFor?:string;
    ratingForID?:string;
    ratingSubmitted?:Boolean
    externalName?: string;
    attemptFor ?:  Types.ObjectId
    externalFields: any;
    timeTaken?: number;
    externalGender: string;
    externalQuestions: Array<Question>;
    attemptStartDate: String;
    attemptEndDate: String;
    isRedoAllow : boolean;
    attempt: number
}


export class UpdateSurveyAttempt extends IntersectionType(SurveyAttempt) {
    _id: string;
}