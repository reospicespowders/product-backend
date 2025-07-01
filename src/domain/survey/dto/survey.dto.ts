import { IntersectionType } from "@nestjs/swagger";
import { SurveyAttendance } from "./survey-attendance.dto";
import { User } from "src/domain/user-auth/dto/user-type..dto";
import { Types } from "mongoose";

export class Question {
    questionCode: string;
    questionText: string;
    type: string;
    order: number;
    pageBreak: boolean;
    separator: boolean;
    active?: boolean;
    meta: any;
}

export class UpdateQuestionDto extends IntersectionType(Question) {
    _id: string;
}

export class Survey {
    name: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    comments: string;
    accessType: string;
    headerImage?: string;
    attendees?: string[];
    attendance: SurveyAttendance[];
    footerText?: string;
    thankyouPageText?: string;
    questions?: Array<Question>;
    attempts: number;
    settings: SurveySettings;
    active?: boolean;
    externals: string[];
    trainingTypeId?: string
    cloneParentId?: string;
    createdBy: User | string
    topics: string[];
    externalFields: string[];
    externalQuestions?: Array<Question>;
    multiAttemptAllow?: boolean;
    anonymous?:boolean
}

export class SurveySettings {
    displayMode: SurveyDisplayMode;
}

export enum SurveyDisplayMode {
    Classic = 'Classic',
    Focus = 'Focus'
}


export class UpdateSurveyDto extends IntersectionType(Survey) {
    _id: string;
    email?: string;
    notify?: boolean;
    ratingForID?: string
    ratingFor?: string
    courseId?: string
    externalName?: string
    questions?: UpdateQuestionDto[]
    attemptFor ?:  Types.ObjectId
    externalGender: string;
    attemptStartDate?: String;
    attemptEndDate?: String;
}

