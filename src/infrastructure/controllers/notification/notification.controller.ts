import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { NotificationService } from 'src/usecase/services/notification/notification.service';

@Controller('notification')
@ApiBearerAuth()
@ApiTags('Notification')
export class NotificationController {

    /**
     * Creates an instance of NotificationController.
     * @param {NotificationService} notificationService
     * @memberof NotificationController
     */
    constructor(private notificationService: NotificationService) { }

    /**
     *Get all user specific notifications
     *
     * @param {*} request
     * @return {*}  {Promise<GenericResponse<Notification[]>>}
     * @memberof NotificationController
     */
    @Get('')
    @Secured()
    public getByUser(@Req() request: any): Promise<GenericResponse<Notification[]>> {
        return this.notificationService.getByUser(request.user.uid);
    }

    /**
     *Get all user specific notifications
     *
     * @param {*} request
     * @return {*}  {Promise<GenericResponse<Notification[]>>}
     * @memberof NotificationController
     */
    @Get('own')
    @Secured()
    public getByUserWithOwn(@Req() request: any): Promise<GenericResponse<Notification[]>> {
        return this.notificationService.getByUserWithOwn(request.user.uid);
    }

    /**
     *Mark notification as seen
     *
     * @param {string} id
     * @param {*} request
     * @return {*} 
     * @memberof NotificationController
     */
    @Put('/:notificationId')
    @Secured()
    public markSeen(@Param('notificationId') id: string, @Req() request: any): Promise<GenericResponse<null>> {
        return this.notificationService.addToSeen(request.user.uid, id);
    }

    @Post('/training/:trainingId')
    @Secured()
    public sendNotification(@Body() body: { message: string }, @Param('trainingId') trainingId: string, @Req() request: any) {
        return this.notificationService.sendTrainingNotification(trainingId, body.message, request.user.uid);
    }
}
