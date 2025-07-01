import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { MarkAttendanceDto, SurveyAttendance } from 'src/domain/survey/dto/survey-attendance.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { SurveyAttendanceService } from 'src/usecase/services/survey/survey-attendance.service';

@Controller('survey-attendance')
@ApiTags('Survey Attendance')
@ApiBearerAuth()
export class SurveyAttendanceController {

    constructor(private surveyAttendanceService: SurveyAttendanceService) { }

    @Get('/:id/:email')
    @Secured()
    async getByEmailAndId(@Param('id') id: string, @Param('email') email: string): Promise<GenericResponse<SurveyAttendance>> {
        return this.surveyAttendanceService.getByEmailAndId(id, email);
    }


    @Get('/:id')
    @Secured()
    async getBySurveyId(@Param('id') id: string): Promise<GenericResponse<SurveyAttendance>> {
        return this.surveyAttendanceService.getBySurveyId(id);
    }

    @Post('/mark')
    @Secured()
    async markAttendance(@Body() surveyAttendance: MarkAttendanceDto): Promise<GenericResponse<null>> {
        return this.surveyAttendanceService.markAttendance(surveyAttendance);
    }
}
