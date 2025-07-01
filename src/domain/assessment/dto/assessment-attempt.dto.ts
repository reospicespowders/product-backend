import { Question } from "src/domain/survey/dto/survey.dto";



export class AssessmentAttempt {
    assessmentId: string;
    questions: Array<Question>;
    email: string;
    externalName: string;
    isRedoAllow : boolean;
    attempt: number;
    courseId?: boolean;
    externalFields: any;
    timeTaken?: number;
    externalGender: string;
    externalQuestions: Array<Question>;
    attemptStartDate: String;
    attemptEndDate: String;
}