import { Injectable, Inject } from '@nestjs/common';
import { UpdateWriteOpResult } from 'mongoose';
import { GenericResponse } from 'src/domain/dto/generic';
import { Attendance, MarkAttendanceDto, SurveyAttendance, SurveyAttendanceStatus } from 'src/domain/survey/dto/survey-attendance.dto';
import { SurveyAttendanceRepository } from 'src/domain/survey/interfaces/survey-attendance-repository.interface';

@Injectable()
export class SurveyAttendanceService {

    constructor(@Inject('SurveyAttendanceRepository') private surveyAttendanceRepository: SurveyAttendanceRepository) { }


    async getBySurveyId(id: string): Promise<GenericResponse<SurveyAttendance>> {
        let res = await this.surveyAttendanceRepository.getBySurveyId(id);
        return {
            message: res != undefined ? 'Survey Attendance fetched successfully' : 'Failed to fetch survey attendance',
            success: res != undefined,
            data: res
        }
    }

    async create(surveyAttendance: SurveyAttendance): Promise<boolean> {
        let res = await this.surveyAttendanceRepository.create(surveyAttendance);
        return res != undefined && res != null;
    }

    async getByEmailAndId(id: string, email: string): Promise<GenericResponse<SurveyAttendance>> {
        let res = await this.surveyAttendanceRepository.getByEmailAndId(id, email);
        return {
            message: res != undefined ? 'Survey Attendance fetched successfully' : 'Failed to fetch survey attendance',
            success: res != undefined,
            data: res
        }
    }

    async createBlankEntries(attendance: Attendance[], surveyId: string): Promise<UpdateWriteOpResult> {
        let surveyAttendance = await this.surveyAttendanceRepository.getBySurveyId(surveyId);
        let distinctAttendance: Attendance[] = attendance;
        if (surveyAttendance && surveyAttendance.attendance) {
            distinctAttendance = attendance.filter(
                att => !surveyAttendance.attendance.some(existingAtt => existingAtt.email === att.email)
            );
        }
        return this.surveyAttendanceRepository.createBlankEntries(distinctAttendance, surveyId);
    }

    async markAttendance(markData: MarkAttendanceDto): Promise<GenericResponse<null>> {

        let surveyAttendance = await this.surveyAttendanceRepository.getBySurveyId(markData.surveyId);
        if (!surveyAttendance) {
            return {
                message: "Survey does not exist",
                success: false,
                data: null
            }
        }


        let attendance = surveyAttendance.attendance.find(a => a.email == markData.email);
        if (!attendance) {
            return {
                message: "Attendance data not found",
                success: false,
                data: null
            }
        }


        attendance.status = SurveyAttendanceStatus.Marked;
        attendance.timestamp = new Date();
        attendance.markType = markData.markType;
        let res = await this.surveyAttendanceRepository.markAttendance(attendance, surveyAttendance.surveyId);
        let updated: boolean = res.modifiedCount > 0;
        return {
            message: updated ? 'Attendance marked successfully' : 'Failed to mark attendance',
            success: updated,
            data: null
        }
    }
}
