import { IntersectionType } from "@nestjs/swagger";
import { Question } from "src/domain/survey/dto/survey.dto";



export class SurveyResult {
    surveyId: string;
    questions: Array<Question>;
    email: string;
    externalName?: string;
    courseId?:string;
    externalFields: any;
    timeTaken?: number;
    externalGender: string;
    externalQuestions: Array<Question>;
    attemptStartDate: String;
    attemptEndDate: String;
    attempt: number;
} 

export class UpdateSurveyResultDto extends IntersectionType(SurveyResult) {
    _id: string;
}