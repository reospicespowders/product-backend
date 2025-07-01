import { IntersectionType } from "@nestjs/swagger";
import { Question, SurveySettings, UpdateQuestionDto } from "src/domain/survey/dto/survey.dto";
import { User } from "src/domain/user-auth/dto/user-type..dto";



export class Assessment {
    name: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    comments: string;
    accessType: string;
    headerImage?: string;
    attendees?: string[];
    tag: string;
    questionBank: string
    footerText?: string;
    thankyouPageText?: string;
    questions?: Array<Question>;
    attempts: number;
    percentageCriteria: PercentageCriteria[]
    settings: SurveySettings;
    active?: boolean; 
    externals: string[];
    trainingTypeId?: string
    allowedAttempts:number
    totalMarks:number
    certificateMinistry:any;
    createdBy:User | string;
    showCert?: boolean;
    showResult?: boolean;
    defaultScore:number
    topics: string[];
    externalFields: string[];
    attemptStartDate: String
    attemptEndDate: String
    attemptTime: String
    externalQuestions?: Array<Question>;
    totalParticipant: String
} 

export class PercentageCriteria {
    from: number;
    to: number;
    title: string;
    icon: string;
    certificateText: any;
}


export class UpdateAssessmentDto extends IntersectionType(Assessment) {
    _id: string;
    email?: string;
    externalName?: string
    notify?: boolean;
    courseId?:string;
    questions?: UpdateQuestionDto[];
    timeTaken?: number
    externalGender?: string
}