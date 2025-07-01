import { Body, Controller, Delete, Get, Param, Query, Post, Put, Req, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { Survey, UpdateSurveyDto } from 'src/domain/survey/dto/survey.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { SurveyService } from 'src/usecase/services/survey/survey.service';



/**
 *Survey Request Handlers/Controllers
 *
 * @export
 * @class SurveyController
 */
@Controller('survey')
@ApiBearerAuth()
@ApiTags('Survey')
export class SurveyController {


    /**
     * Creates an instance of SurveyController.
     * @param {SurveyService} surveyService
     * @memberof SurveyController
     */
    constructor(private surveyService: SurveyService) { }


    @Post('submit')
    @OpenRoute()
    public async submitSurvey(@Body() updateSurveyDto: UpdateSurveyDto): Promise<GenericResponse<null>> {
        return this.surveyService.submitSurvey(updateSurveyDto);
    }

    @Post('bulkdelete')
    @Secured()
    public async bulkDelete(@Body('ids') ids: string[]): Promise<GenericResponse<null>> {
        return this.surveyService.bulkDelete(ids);
    }

    @Get('unattempted/:email')
    @Secured()
    public async getAllUnattempted(@Param('email') email: string, @Req() req: any): Promise<GenericResponse<Survey[]>> {
        return this.surveyService.getAllUnattempted(req.user.uid,email);
    }

    @Get('attempted/:email')
    @Secured()
    public async getAllAttempted(@Param('email') email: string, @Req() req: any): Promise<GenericResponse<Survey[]>> {
        return this.surveyService.getAllAttempted(req.user.uid,email);
    }

    /**
     *Get all surveys
     *
     * @return {*}  {Promise<GenericResponse<Survey[]>>}
     * @memberof SurveyController
     */
    @Get('')
    @Secured()
    public async getAll(): Promise<GenericResponse<Survey[]>> {
        return this.surveyService.getAll();
    }

    /**
     *Get all surveys w.r.t tags
     *
     * @return {*}  {Promise<GenericResponse<Survey[]>>}
     * @memberof SurveyController
     */
    @Get(':tags')
    @Secured()
    public async getAllTagsFiltered(@Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[], @Query('trainingTypeId') trainingTypeId?: string): Promise<GenericResponse<Survey[]>> {
        if (tags.includes('MASTER_TAG')) {
            return this.surveyService.getAll();
        } else {
            return this.surveyService.getAllTagsFiltered(tags, trainingTypeId);
        }
    }

    @Get('/id/:id')
    @OpenRoute()
    public findById(@Param('id') id: string): Promise<GenericResponse<Survey>> {
        return this.surveyService.findById(id);
    }


    /**
     *Create a new survey
     *
     * @param {Survey} survey
     * @return {*}  {Promise<GenericResponse<Survey>>}
     * @memberof SurveyController
     */
    @Post('')
    @Secured()
    public async create(@Body() survey: Survey,@Req() req:any): Promise<GenericResponse<Survey>> {
        return this.surveyService.create(survey,req.user.uid);
    }


    /**
     *Update an existing survey
     *
     * @param {UpdateSurveyDto} survey
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof SurveyController
     */
    @Put('')
    @Secured()
    public async update(@Body() survey: UpdateSurveyDto, @Req() req:any): Promise<GenericResponse<null>> {
        return this.surveyService.update(survey, req.user.uid);
    }


    /**
     *Delete an existing survey
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof SurveyController
     */
    @Delete('/:id')
    @Secured()
    public async delete(@Param('id') _id: string): Promise<GenericResponse<null>> {
        return this.surveyService.delete(_id);
    }
}
