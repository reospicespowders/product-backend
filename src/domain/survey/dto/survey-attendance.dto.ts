



export class SurveyAttendance {
    surveyId: string;
    attendance: Attendance[]
}


export class Attendance {
    email: string;
    status?: SurveyAttendanceStatus;
    markType?: SurveyAttendanceMarkType;
    timestamp?: Date
}

export enum SurveyAttendanceStatus {
    Pending = 'Pending',
    Marked = 'Marked'
}

export enum SurveyAttendanceMarkType {
    By_QR = 'BY_QR',
    By_PC = 'BY_PC',
    Pending = 'Pending'
}

export class MarkAttendanceDto {
    surveyId: string;
    email: string;
    markType: SurveyAttendanceMarkType
}