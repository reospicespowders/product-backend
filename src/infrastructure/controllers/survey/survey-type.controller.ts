import { Body, Controller, Delete, Get, Param, Post, Put, Req, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { SurveyType, UpdateSurveyTypeDto } from 'src/domain/survey/dto/survey-type.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { SurveyTypeService } from 'src/usecase/services/survey/survey-type.service';

@Controller('survey-type')
@ApiBearerAuth()
@ApiTags('Survey Type')
export class SurveyTypeController {

    /**
     * Creates an instance of SurveyTypeController.
     * @param {SurveyTypeService} surveyTypeService
     * @memberof SurveyTypeController
     */
    constructor(private surveyTypeService: SurveyTypeService) { }

    @Get('/categorized/:tags')
    @Secured()
    public async getAllCategorized(@Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]): Promise<GenericResponse<any>> {
        return this.surveyTypeService.getAllCategorized(tags);
    }

    /**
     *Get all survey types
     *
     * @return {*}  {Promise<GenericResponse<SurveyType[]>>}
     * @memberof SurveyController
     */
    @Get('/:tags')
    @Secured()
    public async getAll(@Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]): Promise<GenericResponse<SurveyType[]>> {
        if (tags.includes('MASTER_TAG')) {
            return this.surveyTypeService.getAll()
        } else {
            return this.surveyTypeService.getAllTagged(tags);
        }
    }


    /**
     *Create a new survey type
     *
     * @param {SurveyType} survey
     * @return {*}  {Promise<GenericResponse<SurveyType>>}
     * @memberof SurveyController
     */
    @Post('')
    @Secured()
    public async create(@Body() survey: SurveyType,@Req() req:any): Promise<GenericResponse<SurveyType>> {
        return this.surveyTypeService.create(survey, req.user.uid);
    }


    /**
     *Update an existing survey type
     *
     * @param {UpdateSurveyTypeDto} survey
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof SurveyController
     */
    @Put('')
    @Secured()
    public async update(@Body() survey: UpdateSurveyTypeDto): Promise<GenericResponse<null>> {
        return this.surveyTypeService.update(survey);
    }


    /**
     *Delete an existing survey type
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof SurveyController
     */
    @Delete('/:id')
    @Secured()
    public async delete(@Param('id') _id: string): Promise<GenericResponse<null>> {
        return this.surveyTypeService.delete(_id);
    }
}
