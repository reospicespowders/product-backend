
import { Body, Controller, Delete, Get, Param, Query, Post, Put, Req, ParseArrayPipe, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Assessment, UpdateAssessmentDto } from 'src/domain/assessment/dto/assessment.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { AssessmentService } from 'src/usecase/services/assessment/assessment.service';
import { getValidator } from '../data/data.validations';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';

@Controller('assessment')
@ApiTags('Assessment')
@ApiBearerAuth()
export class AssessmentController {

    constructor(private assessmentService: AssessmentService) { }

    @Get(':page/:size/:tags')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[], @Query('trainingTypeId') trainingTypeId?: string) {
        return this.assessmentService.getAll(page, size, tags, trainingTypeId);
    }
    /**
     * 
     * @param updateAssessmentDto 
     * @returns 
     */
    @Post('submit')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async submitAssessment(@Body() updateAssessmentDto: UpdateAssessmentDto): Promise<GenericResponse<null>> {
        return this.assessmentService.submitAssessment(updateAssessmentDto);
    }

    @Get('/id/:id')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public findById(@Param('id') id: string): Promise<GenericResponse<Assessment>> {
        return this.assessmentService.findById(id);
    }

    @Post('bulkdelete')
    @Secured('ASSESSMENT','d')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async bulkDelete(@Body('ids') ids: string[]): Promise<GenericResponse<null>> {
        return this.assessmentService.bulkDelete(ids);
    }

    @Get('unattempted/:email')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAllUnattempted(@Param('email') email: string, @Req() req: any): Promise<GenericResponse<Assessment[]>> {
        return this.assessmentService.getAllUnattempted(req.user.uid, email);
    }

    @Get('attempted/:email')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAllAttempted(@Param('email') email: string, @Req() req: any): Promise<GenericResponse<Assessment[]>> {
        return this.assessmentService.getAllAttempted(req.user.uid, email);
    }

    @Post('ministry/certificate/')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getCertificateData(@Body() postData: any): Promise<GenericResponse<Assessment[]>> {
        return this.assessmentService.getCertificateData(postData);
    }

    @Post('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async create(@Body() assessment: Assessment,@Req() req:any) {
        return this.assessmentService.create(assessment,req.user.uid);
    }

    @Put('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async update(@Body() assessment: UpdateAssessmentDto, @Req() req: any) {
        return this.assessmentService.update(assessment, req.user.uid);
    }

    @Delete('/:id')
    @Secured('ASSESSMENT','d')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async delete(@Param('id') _id: string) {
        return this.assessmentService.delete(_id);
    }

    @Post('/attempt/check/:email')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public CheckUserResult(@Body() body: { ids: string[] }, @Param('email') email: string): Promise<GenericResponse<any>> {
        return this.assessmentService.CheckUserResult(body.ids, email);
    }
}
