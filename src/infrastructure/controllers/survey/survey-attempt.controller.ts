import { Controller, Param, Get, Body, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { SurveyAttempt, UpdateSurveyAttempt } from 'src/domain/survey/dto/survey-attempt.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { SurveyAttemptService } from 'src/usecase/services/survey/survey-attempt.service';

@Controller('survey-attempt')
@ApiTags('Survey Attempt')
@ApiBearerAuth()
export class SurveyAttemptController {

    constructor(private surveyAttemptService: SurveyAttemptService) { }

    @Put('')
    @Secured()
    public async updateAttempt(@Body() data: UpdateSurveyAttempt): Promise<GenericResponse<UpdateSurveyAttempt>> {
        // console.log("data",data);
        return this.surveyAttemptService.updateAttempt(data);
    }

    @Post('/getAvgRating')
    @Secured()
    public async getAvgRating(@Body() data: any): Promise<GenericResponse<any>> {
        return this.surveyAttemptService.getAvgRating(data);
    }

    @Get('/:id/:email')
    @Secured()
    public async getByEmailAndId(@Param('id') id: string, @Param('email') email: string): Promise<GenericResponse<SurveyAttempt>> {
        return this.surveyAttemptService.getByEmailAndId(id, email);
    }

    @Secured()
    @Post('/:id')
    public async generateNewAttempt(@Param('id') id: string): Promise<GenericResponse<any[]>> {
        return this.surveyAttemptService.generateNewAttempt(id);
    }

    @Get('/check/:email/:surveyId')
    @OpenRoute()
    checkIfAttempted(@Param('email') email: string, @Param('surveyId') surveyId: string): Promise<GenericResponse<boolean>> {
        return this.surveyAttemptService.checkIfAttempted(email, surveyId);
    }

    @Post('/session/check/:email')
    @OpenRoute()
    checkIfAttemptedForSession(@Param('email') email: string, @Body() body: { ids: string[] }): Promise<GenericResponse<any>> {
        return this.surveyAttemptService.checkIfAttemptedForSession(email, body.ids);
    }

    @Secured()
    @Post('/:surveyId/:email')
    public async allowRedoByEmailAndAssessmentId(@Param('surveyId') surveyId: string,@Param('email') email: string) {
        return this.surveyAttemptService.allowRedoByEmailAndAssessmentId(surveyId, email);
    }
}