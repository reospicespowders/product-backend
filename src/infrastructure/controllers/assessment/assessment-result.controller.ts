
import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateAssessmentResultDto } from 'src/domain/assessment/dto/assessment-result.dto';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { AssessmentResultService } from 'src/usecase/services/assessment/assessment-result.service';
import { getValidator } from '../data/data.validations';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { GenericResponse } from 'src/domain/dto/generic';


@Controller('assessment-result')
@ApiTags('Assessment Result')
@ApiBearerAuth()
export class AssessmentResultController {

    constructor(private assessmentResultService: AssessmentResultService) { }

    @Get('email/:assessmentId/:email')
    @UsePipes(new JoiValidationPipe(getValidator))
    @OpenRoute()
    public async findIdByEmail(@Param('assessmentId') assessmentId: string, @Param('email') email: string) {
        return this.assessmentResultService.findIdByEmail(assessmentId, email);
    }

    @Get(':id/:page/:size/')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getAssessmentResults(@Param('id') _id: string, @Param('page') page: number = 1, @Param('size') size: number = 10,
    @Query('external') external?: string,@Query('searchText') searchText?: string) {
        return this.assessmentResultService.getAssessmentResults(_id, page, size, external, searchText);
    }

    @Put('')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async update(@Body() assessmentResult: UpdateAssessmentResultDto) {
        return this.assessmentResultService.update(assessmentResult);
    }

    @Post('generate')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async generateResults() {
        return this.assessmentResultService.generateResults();
    }

    @Post('regenerate/:id')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async regenerateResults(@Param('id') id: string) {
        return this.assessmentResultService.regenerateResults(id);
    }

    @Get('excel')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async generateExcel(@Query('ids') ids: string) {
        const idsArray = ids.split(',');
        return this.assessmentResultService.generateExcel(idsArray);
    }

    @Get('pdf')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async generatePdf(@Query('ids') ids: string) {
        const idsArray = ids.split(',');
        return this.assessmentResultService.generatePdf(idsArray);
    }

    @Get('bulkExcel')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async generateBulkExcel(@Query('ids') ids: string) {
        const idsArray = ids.split(',');
        return this.assessmentResultService.generateBulkExcel(idsArray);
    }

    @Get('bulkUserExcel')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async generateBulkUserExcel(@Query('ids') ids: string) {
        const idsArray = ids.split(',');
        return this.assessmentResultService.generateBulkUserExcel(idsArray);
    }

    @Get('graph/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getGraphData(@Param('id') _id: string) {
        return this.assessmentResultService.getGraphData(_id);
    }

    @Get('getBulkResults')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    async getBulkResults(@Query('ids') ids: string,@Query('filtering') filtering: string = 'highest',@Param('page') page: number = 1, @Param('size') size: number = 10): Promise<any> {
        const idsArray = ids.split(','); // Split the query parameter 'ids' into an array of strings
        return await this.assessmentResultService.getBulkResults(idsArray,page,size, filtering);
    }

    @Get('/getBulkGraph')
    @Secured()
    async getBulkGraph1(@Query('ids') ids: string): Promise<any> {
        const idsArray = ids.split(',');
        return await this.assessmentResultService.getBulkGraph(idsArray);
    }

    @Get('email/:assessmentId/:email')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    async getBulkGraph(@Query('ids') ids: string): Promise<any> {
        const idsArray = ids.split(',');
        return await this.assessmentResultService.getBulkGraph(idsArray);
    }

    @Post('sendEmailUsers')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async sendEmailUsers(@Body() data: any): Promise<GenericResponse<null>> {
        return this.assessmentResultService.sendEmailUsers(data);
    }

    @Post('sendCertEmailUsers')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async sendCertEmailUsers(@Body() data: any): Promise<GenericResponse<null>> {
        return this.assessmentResultService.sendCertEmailUsers(data);
    }

    @Post('deleteUsers')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async deleteUsers(@Body() data: any): Promise<GenericResponse<null>> {
        return this.assessmentResultService.deleteUsers(data);
    }

}
