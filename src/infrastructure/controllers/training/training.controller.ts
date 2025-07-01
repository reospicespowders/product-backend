import { Controller, Get, Put, Post, Delete, Query, Body, UsePipes, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { TrainingProggramService } from 'src/usecase/services/training/training.service';
import { createTrainingValidator, updateTrainingValidator } from './training.validator';
import { TrainingProgram, UpdateTrainingProgram } from 'src/domain/training/dto/training.dto';
import { getValidator } from '../data/data.validations';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';

@Controller('training-program')
@ApiTags('Training Program')
@ApiBearerAuth()
export class TrainingProgramController {

    constructor(private TrainingProggramService: TrainingProggramService) { }

    /**
     *Create a new TrainingProgram 
     *
     * @param {TrainingProgram} TrainingProgram
     * @return {*}  {Promise<GenericResponse<TrainingProgram>>}
     * @memberof TrainingController
     */
    @Post('')
    @UsePipes(new JoiValidationPipe(createTrainingValidator))
    @Secured()
    public async create(@Body() TrainingProgram: UpdateTrainingProgram, @Req() req: any): Promise<GenericResponse<string>> {
        return this.TrainingProggramService.create(TrainingProgram, req.user.uid);
    }


    /**
     *Get all available Training Programs
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<TrainingProgram[]>>}
     * @memberof TrainingController
     */
    @Post('/get')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getAll(@Query('size') size: number, @Query('page') page: number): Promise<GenericResponse<any>> {
        return this.TrainingProggramService.getAll(page, size);
    }


    /**
     *Get all available Training Programs
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<TrainingProgram[]>>}
     * @memberof TrainingController
     */
    @Post('/get-aggrigated')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getAggregatedTrainingPrograms(@Body() query: any, @Query('size') size: number, @Query('page') page: number): Promise<GenericResponse<any>> {
        return this.TrainingProggramService.getAggregatedTrainingPrograms(query, page, size);
    }

    /**
     *Get specific Training Program  by id
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<TrainingProgram>>}
     * @memberof TrainingController
     */
    @Get('/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getOne(@Param('id') _id: string): Promise<GenericResponse<TrainingProgram>> {
        return this.TrainingProggramService.getOne(_id);
    }


    /**
     *Get specific Training Program  by id
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<TrainingProgram>>}
     * @memberof TrainingController
     */
     @Get('/get-training-program-attendees/:id')
     @UsePipes(new JoiValidationPipe(getValidator))
     @Secured()
     public async getTrainingProgramAttendees(@Param('id') _id: string): Promise<GenericResponse<any>> {
         return this.TrainingProggramService.getTrainingProgramAttendees(_id);
     }


    /**
     *Update an existing TrainingProgram 
     *
     * @param {UpdateTraining} updateTraining
     * @return {*}  {Promise<GenericResponse<TrainingProgram>>}
     * @memberof TrainingController
     */
    @Put('')
    @UsePipes(new JoiValidationPipe(updateTrainingValidator))
    @Secured()
    public async update(@Body() updateTraining: UpdateTrainingProgram, @Req() req: any): Promise<GenericResponse<TrainingProgram>> {
        return this.TrainingProggramService.update(updateTraining, req.user.uid);
    }


    /**
     *Delete an existing TrainingProgram 
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof TrainingController
     */
    @Delete('/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.TrainingProggramService.delete(id);
    }

    /**
    *Get merged Training Progrm and courses
    *
    * @param {number} offset
    * @param {number} page
    * @return {*}  {Promise<GenericResponse<TrainingRequest[]>>}
    * @memberof TrainingRequestController
    */
    @Post('/get-merged-training-program-courses')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator)) //validating the object
    public async getMergedTrainingProgramAndCourses(@Query('offset') offset: number, @Query('page') page: number, @Body() filter: any): Promise<GenericResponse<any>> {
        return this.TrainingProggramService.getMergedTrainingProgramAndCourses(page, offset, filter);
    }


    /**
    *Synchronize OU users with program and all included courses
    *
    * @param {number} offset
    * @param {number} page
    * @return {*}  {Promise<GenericResponse<TrainingRequest[]>>}
    * @memberof TrainingRequestController
    */
    @Put('synchronize/:programId')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator)) //validating the object
    public async synchronizeOUUsers(@Param("programId") programId: string): Promise<GenericResponse<any>> {
        return this.TrainingProggramService.synchronizeOUUsers(programId);
    }

    /**
    *Add new users to program and its courses
    *
    * @param {number} offset
    * @param {number} page
    * @return {*}  {Promise<GenericResponse<TrainingRequest[]>>}
    * @memberof TrainingRequestController
    */
    @Put('user/new')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator)) //validating the object
    public async addProgramUsers(@Body() data: { programId: string, users: string[] }): Promise<GenericResponse<any>> {
        return this.TrainingProggramService.addProgramUsers(data.programId, data.users);
    }

}
