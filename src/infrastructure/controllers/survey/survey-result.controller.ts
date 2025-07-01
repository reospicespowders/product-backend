
import { Body, Controller, Get, Param, Post, Put, UsePipes, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateSurveyResultDto } from 'src/domain/survey/dto/survey-result.dto';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { SurveyResultService } from 'src/usecase/services/survey/survey-result.service';
import { getValidator } from '../data/data.validations';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { GenericResponse } from 'src/domain/dto/generic';


@Controller('survey-result')
@ApiTags('Survey Result')
@ApiBearerAuth()
export class SurveyResultController {

    constructor(private surveyResultService: SurveyResultService) { }

    @Get(':id/:page/:size/')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getSurveyResults(@Param('id') _id: string, @Param('page') page: number = 1, @Param('size') size: number = 10,
        @Query('courseId') courseId?: string,@Query('ratingFor') ratingFor?: string,@Query('ratingForID') ratingForID?: string,
        @Query('external') external?: string,@Query('searchText') searchText?: string) {
        return this.surveyResultService.getSurveyResults(_id, page, size, courseId, ratingFor, ratingForID, external, searchText);
    }

    @Put('')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async update(@Body() surveyResult: UpdateSurveyResultDto) {
        return this.surveyResultService.update(surveyResult);
    }

    @Post('generate')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async generateResults() {
        return this.surveyResultService.generateResults();
    }

    @Get('excel')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async generateExcel(@Query('ids') ids: string, @Query('courseId') courseId?: string,@Query('ratingFor') ratingFor?: string,@Query('ratingForID') ratingForID?: string) {
        const idsArray = ids.split(',');
        return this.surveyResultService.generateExcel(idsArray,courseId, ratingFor, ratingForID);
    }

    @Get('pdf')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async generatePdf(@Query('ids') ids: string) {
        const idsArray = ids.split(',');
        return this.surveyResultService.generatePdf(idsArray);
    }

    @Get('/graph/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getGraphData(@Param('id') _id: string, @Query('courseId') courseId?: string,@
        Query('ratingFor') ratingFor?: string,@Query('ratingForID') ratingForID?: string) {
        return this.surveyResultService.getGraphData(_id, courseId, ratingFor, ratingForID);
    }

    @Get('/getBulkResults')
    @Secured()
    async getBulkResults(@Query('ids') ids: string): Promise<any> {
        const idsArray = ids.split(',');
        return await this.surveyResultService.getBulkResults(idsArray);
    }

    @Post('sendEmailUsers')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async sendEmailUsers(@Body() data: any): Promise<GenericResponse<null>> {
        return this.surveyResultService.sendEmailUsers(data);
    }

    @Post('deleteUsers')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async deleteUsers(@Body() data: any): Promise<GenericResponse<null>> {
        return this.surveyResultService.deleteUsers(data);
    }
}
