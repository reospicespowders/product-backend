import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { SurveyTag, UpdateSurveyTagDto } from 'src/domain/survey/dto/survey-type.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { SurveyTypeService } from 'src/usecase/services/survey/survey-type.service';

@Controller('survey-tags')
@ApiTags('Survey Attempt')
@ApiBearerAuth()
export class SurveyTagsController {

    constructor(
        private surveyTypeService: SurveyTypeService
    ) { }

    @Get('/:type')
    @Secured()
    public async getAllTags(@Param('type') type: string): Promise<GenericResponse<SurveyTag[]>> {
        return this.surveyTypeService.getAllTags(type);
    }

    @Put()
    @Secured()
    public async updateSurveyTag(@Body() updateSurveyTagDto: UpdateSurveyTagDto): Promise<GenericResponse<null>> {
        return this.surveyTypeService.updateSurveyTag(updateSurveyTagDto)
    }

    @Delete('/:id')
    @Secured()
    public async deleteSurveyTag(@Param('id') id: string): Promise<GenericResponse<null>> {
        return this.surveyTypeService.deleteSurveyTag(id);
    }

    @Post()
    @Secured()
    public async createSurveyTag(@Body() tag: SurveyTag): Promise<GenericResponse<SurveyTag>> {
        return this.surveyTypeService.createSurveyTag(tag);
    }
}
