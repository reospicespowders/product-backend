import { UpdateWriteOpResult } from "mongoose";
import { Attendance, SurveyAttendance } from "../dto/survey-attendance.dto";




export interface SurveyAttendanceRepository {
    getBySurveyId(id: string): Promise<SurveyAttendance>;
    create(surveyAttendance: SurveyAttendance): Promise<SurveyAttendance>;
    getByEmailAndId(id: string, email: string): Promise<SurveyAttendance>;
    update(surveyAttendance: SurveyAttendance): Promise<UpdateWriteOpResult>;
    markAttendance(attendance: Attendance, surveyId: string): Promise<UpdateWriteOpResult>
    createBlankEntries(attendances:Attendance[],surveyId:string):Promise<UpdateWriteOpResult>;
}