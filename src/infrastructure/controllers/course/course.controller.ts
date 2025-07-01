import { Body, Controller, Delete, Get, Param, Post, Put, Req, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Course, CourseMaterialDto, UpdateCourse } from 'src/domain/course/dto/course.dto';
import { assignAttendeesValidator, createCourseValidation, updateCourseValidation } from 'src/domain/course/validation/course.validation.dto';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { CourseService } from 'src/usecase/services/course/course.service';
import { getValidator } from '../data/data.validations';
import { GenericResponse } from 'src/domain/dto/generic';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';

@Controller('course')
@ApiTags('Course')
@ApiBearerAuth()
export class CourseController {

    constructor(private courseService: CourseService) { }

    /**
     *
     *
     * @return {*} 
     * @memberof CourseController
     */
    @Get('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10) {
        return this.courseService.getAll(page, size);
    }

    /**
     *Get course attendees only
     *
     * @return {*} 
     * @memberof CourseController
     */
    @Get('attendees/:courseId')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getCourseUsers(@Param('courseId') courseId: string): Promise<GenericResponse<string[]>> {
        return this.courseService.getCourseUsers(courseId);
    }

    /**
     *Update course attendees only
     *
     * @return {*} 
     * @memberof CourseController
     */
    @Put('/attendees')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async updateCourseUsers(@Body() body: { courseId: any, users: string[] }): Promise<GenericResponse<any>> {
        return this.courseService.updateCourseUsers(body.courseId, body.users);
    }


    /**
     *
     *
     * @param {string} id
     * @return {*} 
     * @memberof CourseController
     */
    @Get('user/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getUserCourses(@Param('id') id: string) {
        return this.courseService.getUserCourses(id);
    }


    /**
     *
     *
     * @param {string} id
     * @return {*} 
     * @memberof CourseController
     */
    @Get('rating/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getRating(@Param('id') id: string) {
        return this.courseService.getRating(id);
    }

    /**
    *
    *
    * @param {string} id
    * @return {*} 
    * @memberof CourseController
    */
    @Get('trainer-rating/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getTrainerRating(@Param('id') id: string, @Req() req: any) {
        return this.courseService.getTrainerRating(id, req.user.uid);
    }

    /**
    *
    *
    * @param {string} id
    * @return {*} 
    * @memberof CourseController
    */
    @Get('completed-users/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getTrainingCompletedUsers(@Param('id') id: string) {
        return this.courseService.getTrainingCompletedUsers(id);
    }

    @Post('trainer-rating/')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async submitTrainerRating(@Body() data: any) {
        return this.courseService.submitTrainerRating(data);
    }



    /**
     *
     *
     * @param {string} _id
     * @return {*} 
     * @memberof CourseController
     */
    @Get('/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getSpecificCourse(@Param('id') _id: string) {
        return this.courseService.getSpecificCourse(_id);
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*} 
     * @memberof CourseController
     */
    @Get('get/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getSpecificCourseById(@Param('id') _id: string) {
        return this.courseService.getSpecificCourseById(_id);
    }


    /**
     *Get structured course new API
     *
     * @param {string} id
     * @return {*} 
     * @memberof CourseController
     */
    @Get('id/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getStructuredCourseById(@Param('id') id: string) {
        return this.courseService.getStructuredCourseById(id);
    }



    /**
     *Get structured course new API
     *
     * @param {string} id
     * @return {*} 
     * @memberof CourseController
     */
     @Get('impact-trainer-course/:id')
     @Secured()
     @UsePipes(new JoiValidationPipe(getValidator))
     public async getStructuredCourseWithImpactById(@Param('id') id: string, @Req() req: any,) {
         return this.courseService.getStructuredCourseWithImpactById(id, req.user.uid,);
     }

    /**
    *Get structured course new API
    *
    * @param {string} id
    * @return {*} 
    * @memberof CourseController
    */
    @Post('certificate/')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async courseCertificate(@Body() data: any) {
        return this.courseService.courseCertificate(data);
    }

    @Post('session/:courseId/:sessionId/:remove')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async addSessionToCourse(@Param('courseId') courseId: string, @Param('sessionId') sessionId: string, @Param('remove') remove: boolean): Promise<GenericResponse<null>> {
        return this.courseService.addSessionToCourse(courseId, sessionId, remove);
    }

    @Post('/material')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async addMaterialToCourse(@Body() material: CourseMaterialDto): Promise<GenericResponse<null>> {
        return this.courseService.addMaterialToCourse(material);
    }

    @Put('/material/:courseId')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async updateMaterialOrder(@Body() material: CourseMaterialDto[], @Param('courseId') courseId: string) {
        return this.courseService.updateMaterialOrder(material, courseId);
    }


    /**
     *
     *
     * @param {Course} course
     * @return {*} 
     * @memberof CourseController
     */
    @Post('')
    @Secured()
    @UsePipes(new JoiValidationPipe(createCourseValidation))
    public async create(@Body() course: Course) {
        return this.courseService.create(course);
    }

    /**
     *
     *
     * @param {UpdateCourse} course
     * @return {*} 
     * @memberof CourseController
     */
    @Put('')
    @Secured()
    @UsePipes(new JoiValidationPipe(updateCourseValidation))
    public async update(@Body() course: UpdateCourse) {
        return this.courseService.update(course);
    }


    /**
     *
     *
     * @param {*} data
     * @return {*} 
     * @memberof CourseController
     */
    @Put('assign-attendees')
    @Secured()
    @UsePipes(new JoiValidationPipe(assignAttendeesValidator))
    public async assignSkillTrainingAttendees(@Body() data: any, @Req() req: any) {
        return this.courseService.assignAttendees(data, req.user.uid);
    }

    @Post('training-calender')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getUserProfileCalender(@Body() data: any) {
        return this.courseService.getUserProfileCalender(data);
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*} 
     * @memberof CourseController
     */
    @Delete('/:id')
    @Secured()
    public async delete(@Param('id') _id: string) {
        return this.courseService.delete(_id);
    }

    @Get('checkuser/:courseId/:userId/:typeId/:type')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async checkUser(@Param('courseId') courseId: string, @Param('userId') userId: string, @Param('typeId') typeId: string, @Param('type') type: string) {
        return this.courseService.checkUser(courseId, userId, typeId, type);
    }

    @Post('get-assessment-survey')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async GetAllAssessmentSurveyByUser(@Req() req: any) {
        return this.courseService.GetAllAssessmentSurveyByUser(req.user.uid);
    }

    @Post('checkrating/')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async checkRating(@Body() data: any) {
        return this.courseService.checkRating(data);
    }

    @Post('getCourseResults/')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getCourseResults(@Body() data: any) {
        return this.courseService.getCourseResults(data);
    }

}
