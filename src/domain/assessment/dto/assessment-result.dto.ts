import { IntersectionType } from "@nestjs/swagger";
import { Question } from "src/domain/survey/dto/survey.dto";



export class AssessmentResult {
    assessmentId: string;
    questions: Array<Question>;
    email: string;
    externalName: string;
    score: number;
    totalmarks: number;
    isScoreMarked?: boolean;
    showResult?: boolean;
    attempt: number
    courseId?: boolean;
    externalFields: any;
    timeTaken?: number;
    externalGender: string;
    externalQuestions: Array<Question>;
    attemptStartDate: String;
    attemptEndDate: String;
} 

export class UpdateAssessmentResultDto extends IntersectionType(AssessmentResult) {
    _id: string;
}