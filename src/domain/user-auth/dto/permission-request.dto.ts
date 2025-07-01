import { IntersectionType } from '@nestjs/swagger';
import { Schema } from 'mongoose';

/**
 * @export
 * @class RequestFor
 */
export class RequestFor {
    name: string;
    value: string;
}

/**
 * @export
 * @class GeneralData
 */
export class GeneralData {
    agencyOrManagement: string;
    requestFor: RequestFor;
    ou: Array<Schema.Types.ObjectId>;
}

/**
 * @export
 * @class ContactOfficer
 */
export class ContactOfficer {
    email: string;
    mobileNumber: string;
    employeeName: string;
}

/**
 * @export
 * @class QuestionMaker
 */
export class QuestionMaker {
    email: string;
    mobileNumber: string;
    employeeName: string;
}

/**
 * @export
 * @class GradingScale
 */
export class GradingScale {
    notPassed: {
        from: number;
        to: number;
    };
    good: {
        from: number;
        to: number;
    };
    veryGood: {
        from: number;
        to: number;
    };
    excellent: {
        from: number;
        to: number;
    };
}

/**
 * @export
 * @class TestEntry
 */
export class TestEntry {
    testName: string;
    testDate: string;
    startTime: string;
    endTime: string;
    surveyId?: Schema.Types.ObjectId;
    assessmentId?: Schema.Types.ObjectId;
}

/**
 * @export
 * @class PermissionRequest
 */
export class PermissionRequest {
    generalData: GeneralData;
    contactOfficer: ContactOfficer;
    questionMaker: QuestionMaker;
    testGoal: string;
    testGoalOther: string;
    goalOther: string;
    questionType: string[];
    questionLevel: string;
    numberOfEmployees: string;
    questionsPerModel: number;
    gradingScale: GradingScale;
    limitingTesters: string;
    observers: string;
    numberOfRegions: number;
    numberOfRegionsOther: string;
    examinationHalls: number;
    examinationHallsOther: string;
    totalObservers: number;
    observersNote: string;
    testEntries: TestEntry[];
    detailedReport: boolean;
    yearlyReport: boolean;
    comments:string;
    status: string;
    created_by: Schema.Types.ObjectId;
    updated_by: Schema.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
    agreement : boolean;
}

/**
 * @export
 * @class UpdatePermissionRequestDto
 */
export class UpdatePermissionRequestDto extends IntersectionType(PermissionRequest) {
    _id: string;
    
}

/**
 * @export
 * @class CreatePermissionRequestDto
 */
export class CreatePermissionRequestDto extends PermissionRequest {
    // Additional fields specific to creation if needed
}
