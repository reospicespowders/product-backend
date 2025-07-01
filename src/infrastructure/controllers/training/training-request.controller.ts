import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Query,
  Body,
  UsePipes,
  Param,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import {
  TrainingRequest,
  UpdateTrainingRequest,
} from 'src/domain/training/dto/training-request.dto';
import {
  createTrainingRequestValidator,
  updateTrainingRequestValidator,
} from './training.validator';
import { TrainingRequestService } from 'src/usecase/services/training/training-request.service';
import { getValidator } from '../data/data.validations';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';

@Controller('training-req')
@ApiTags('Training Request')
@ApiBearerAuth()
export class TrainingRequestController {
  constructor(private TrainingRequestService: TrainingRequestService) {}

  /**
   *Create a new TrainingRequest
   *
   * @param {TrainingRequest} TrainingRequest
   * @return {*}  {Promise<GenericResponse<TrainingRequest>>}
   * @memberof TrainingRequestController
   */
  @Post('')
  @Secured()
  @UsePipes(new JoiValidationPipe(createTrainingRequestValidator)) //validating the object
  public async create(
    @Body() TrainingRequest: TrainingRequest,
    @Req() req: any,
  ): Promise<GenericResponse<TrainingRequest>> {
    return this.TrainingRequestService.create(TrainingRequest, req.user.uid);
  }

  /**
   *Get all available TrainingRequests
   *
   * @param {number} offset
   * @param {number} page
   * @return {*}  {Promise<GenericResponse<TrainingRequest[]>>}
   * @memberof TrainingRequestController
   */
  @Post('/get')
  @Secured()
  @UsePipes(new JoiValidationPipe(getValidator)) //validating the object
  public async getAll(
    @Query('offset') offset: number,
    @Query('page') page: number,
    @Body() filter: TrainingRequest,
  ): Promise<GenericResponse<any>> {
    return this.TrainingRequestService.getAll(page, offset, filter);
  }

  /**
   *Get all available TrainingRequests
   *
   * @param {number} offset
   * @param {number} page
   * @return {*}  {Promise<GenericResponse<TrainingRequest[]>>}
   * @memberof TrainingRequestController
   */
  @Post('/get-aggregated')
  @Secured()
  @UsePipes(new JoiValidationPipe(getValidator)) //validating the object
  public async getAllAggregated(
    @Query('offset') offset: number,
    @Query('page') page: number,
    @Body() filter: TrainingRequest,
  ): Promise<GenericResponse<any>> {
    return this.TrainingRequestService.getAllAggregated(page, offset, filter);
  }

  /**
   *Get all available TrainingRequests
   *
   * @param {number} offset
   * @param {number} page
   * @return {*}  {Promise<GenericResponse<TrainingRequest[]>>}
   * @memberof TrainingRequestController
   */
  @Post('/get-aggregated-v2')
  @Secured()
  @UsePipes(new JoiValidationPipe(getValidator)) //validating the object
  public async getAllAggregatedV2(
    @Query('offset') offset: number,
    @Query('page') page: number,
    @Body() filter: TrainingRequest,
  ): Promise<GenericResponse<any>> {
    return this.TrainingRequestService.getAllAggregatedV2(page, offset, filter);
  }

  /**
   *Get course attendees only
   *
   * @return {*}
   * @memberof CourseController
   */
  @Get('unregistered/attendees/:courseId')
  @Secured()
  @UsePipes(new JoiValidationPipe(getValidator))
  public async getCourseUsers(
    @Param('courseId') courseId: string,
  ): Promise<GenericResponse<string[]>> {
    return this.TrainingRequestService.getUnregisteredUsers(courseId);
  }

  /**
   *Update course attendees only
   *
   * @return {*}
   * @memberof CourseController
   */
  @Put('unregistered/attendees')
  @Secured()
  @UsePipes(new JoiValidationPipe(getValidator))
  public async updateCourseUsers(
    @Body() body: { courseId: any; users: string[] },
  ): Promise<GenericResponse<any>> {
    return this.TrainingRequestService.updateUnregisteredUsers(
      body.courseId,
      body.users,
    );
  }

  /**
   *Get specific TrainingRequest  by id
   *
   * @param {string} _id
   * @return {*}  {Promise<GenericResponse<TrainingRequest>>}
   * @memberof TrainingRequestController
   */
  @Get('/:id')
  @Secured()
  @UsePipes(new JoiValidationPipe(getValidator)) //validating the object
  public async getOne(
    @Param('id') _id: string,
  ): Promise<GenericResponse<TrainingRequest>> {
    return this.TrainingRequestService.getOne(_id);
  }

  /**
   *Update an existing TrainingRequest
   *
   * @param {UpdateTrainingRequest} updateTrainingRequest
   * @return {*}  {Promise<GenericResponse<TrainingRequest>>}
   * @memberof TrainingRequestController
   */
  @Put('')
  @UsePipes(new JoiValidationPipe(updateTrainingRequestValidator))
  @Secured()
  public async update(
    @Body() updateTrainingRequest: UpdateTrainingRequest,
    @Req() req: any,
  ): Promise<GenericResponse<TrainingRequest>> {
    return this.TrainingRequestService.update(
      updateTrainingRequest,
      req.user.uid,
    );
  }

  /**
   *Delete an existing TrainingRequest
   *
   * @param {string} id
   * @return {*}  {Promise<GenericResponse<any>>}
   * @memberof TrainingRequestController
   */
  @Delete('/:id')
  @UsePipes(new JoiValidationPipe(getValidator))
  @Secured()
  public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
    return this.TrainingRequestService.delete(id);
  }

  /**
   *Delete an existing TrainingRequest
   *
   * @param {string} id
   * @return {*}  {Promise<GenericResponse<any>>}
   * @memberof TrainingRequestController
   */
  /**
   *
   *
   * @param {string} type
   * @param {number} offset
   * @param {number} page
   * @return {*}  {Promise<GenericResponse<any>>}
   * @memberof TrainingRequestController
   */
  @Post('/get/graphs-data')
  @UsePipes(new JoiValidationPipe(getValidator))
  @Secured()
  public async getGraphData(
    @Body() data: string,
    @Query('offset') offset: number,
    @Query('page') page: number,
  ): Promise<GenericResponse<any>> {
    return this.TrainingRequestService.getGraphData(data, page, offset);
  }

  /**
   *
   *
   * @param {string} type
   * @param {number} offset
   * @param {number} page
   * @return {*}  {Promise<GenericResponse<any>>}
   * @memberof TrainingRequestController
   */
  @Post('/get/graphs-data-users')
  @UsePipes(new JoiValidationPipe(getValidator))
  @Secured()
  public async getGraphDataUsers(
    @Body() type: any,
    @Query('offset') offset: number,
    @Query('page') page: number,
  ): Promise<GenericResponse<any>> {
    return this.TrainingRequestService.getGraphDataUsers(type, page, offset);
  }

  @Post('/get/calender')
  @UsePipes(new JoiValidationPipe(getValidator))
  @Secured()
  public async getCalendar(
    @Body() query: string,
  ): Promise<GenericResponse<any>> {
    return this.TrainingRequestService.getCalendar(query);
  }

  /**
   *get impact tasks for manager
   *
   * @param {string} id
   * @return {*}  {Promise<GenericResponse<any>>}
   * @memberof TrainingRequestController
   */
  @Post('/get-manager-impact-task/:id')
  @UsePipes(new JoiValidationPipe(getValidator))
  @Secured()
  public async getMangerImpactTask(
    @Param('id') id: string, @Body() filter : any
  ): Promise<GenericResponse<any>> {
    return this.TrainingRequestService.getMangerImpactTask(id, filter);
  }
}
