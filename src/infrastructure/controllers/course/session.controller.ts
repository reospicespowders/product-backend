import { Body, Controller, Delete, Get, Param, Post, Put, Req, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {  UpdateSession } from 'src/domain/course/dto/session.dto';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { SessionService } from 'src/usecase/services/course/session.service';
import { getValidator } from '../data/data.validations';
import { CourseService } from 'src/usecase/services/course/course.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';

@Controller('session')
@ApiTags('Session')
@ApiBearerAuth()
export class SessionController {

    constructor(
        private SessionService: SessionService,
        private courseService: CourseService
    ) { }

    /**
     *
     *
     * @param {number} [page=1]
     * @param {number} [size=100]
     * @return {*} 
     * @memberof SessionController
     */
    @Get('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 100) {
        return this.SessionService.getAll();
    }

    /**
     *
     *
     * @param {Session} Session
     * @return {*} 
     * @memberof SessionController
     */
    @Post('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async create(@Body() session: any,@Req() req:any) {
        const courseId = session.courseId
        return this.SessionService.create(session, courseId,req.user.uid);
    }

    /**
     *
     *
     * @param {Session} Session
     * @return {*} 
     * @memberof SessionController
     */
    @Post('/check-trainer-availability')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async checkTrainerAvailability(@Body() query: any) {
        return this.SessionService.checkTrainerAvailability(query);
    }

    /**
     *
     *
     * @param {UpdateSession} Session
     * @return {*} 
     * @memberof SessionController
     */
    @Put('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async update(@Body() Session: UpdateSession) {
        return this.SessionService.update(Session);
    }

    @Put('/reorder')
    @Secured()
    public async updateSessionOrder(@Body() data: any) {
        return this.SessionService.updateSessionOrder(data);
    }

    /**
     *
     *
     * @param {UpdateSession} Session
     * @return {*} 
     * @memberof SessionController
     */
    @Put('/add-seen-by')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async addSeenBy(@Body() Session: any) {
        return this.SessionService.addSeenBy(Session);
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*} 
     * @memberof SessionController
     */
    @Delete('/:id/:courseId')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async delete(@Param('id') _id: string, @Param('courseId') courseId: string) {
        await this.courseService.addSessionToCourse(courseId, _id, true)
        return this.SessionService.delete(_id);
    }
}
