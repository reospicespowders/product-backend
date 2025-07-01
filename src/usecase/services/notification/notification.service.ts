import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseRepository } from 'src/domain/course/interfaces/course-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationRepository } from 'src/domain/notification/interfaces/notification-repository.interface';
import { ActiveUserSocketGateway } from 'src/infrastructure/gateway/active-user-socket.gateway';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationService {

    /**
     * Creates an instance of NotificationService.
     * @param {NotificationRepository} notificationRepository
     * @memberof NotificationService
     */
    constructor(
        @Inject('NotificationRepository') private notificationRepository: NotificationRepository,
        private socketGateway: ActiveUserSocketGateway,
        @Inject('CourseRepository') private courseRepository: CourseRepository,
        @InjectModel('notification') private readonly notificationModel: Model<Notification>,
        private mailService: MailService
    ) { }

    /**
     *Create a new notification
     *
     * @param {Notification} notification
     * @return {*}  {Promise<Notification>}
     * @memberof NotificationService
     */
    async create(notification: Notification,sendMail:boolean = true): Promise<void> {

        notification.receiver = notification.receiver.filter(e => e != undefined && e != null && e != 'undefined')
        let notificationWithId = await this.notificationRepository.create(notification);

        //Populating mail meta data
        let notificationDocument = new this.notificationModel(notification);
        notification = await notificationDocument.populate('sender sender.ou receiver')

        //send mail on each notification
        //this method will setup basic fields for notification
        notification = this.setupNotification(notification)
        if (sendMail) {
            this.mailService.sendNotificationMail(notification);
        }

        this.socketGateway.sendNotification(notificationWithId);
    }

    /**
     *Send a notification to all training users
     *
     * @memberof NotificationService
     */
    public async sendTrainingNotification(trainingId: string, message: string, userId: string) {

        let course = await this.courseRepository.getSpecificCourseById(trainingId);

        if (course.length > 0) {
            let notification: Notification = {
                category: NotificationCategory.CUSTOM,
                receiver: course[0].attendees.filter(e => e != undefined && e != null).map(e => String(e)),
                seenBy: [],
                sender: userId,
                type: NotificationType.CUSTOM_NOTIFICATION,
                data: { course: course[0], message }
            }
            let res = await this.create(notification);
            return {
                data: res,
                success: true,
                message: "Alert sent successfully"
            }
        }
        return {
            data: null,
            success: false,
            message: "Failed to send alert, course not found"
        }
    }

    /**
     *Mark notification as seen
     *
     * @param {string} userId
     * @param {string} notificationId
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof NotificationService
     */
    async addToSeen(userId: string, notificationId: string): Promise<GenericResponse<null>> {
        let res = await this.notificationRepository.addToSeen(userId, notificationId);
        if (res.modifiedCount > 0) {
            return {
                data: null,
                success: true,
                message: "Notifications marked seen"
            }
        }
        return {
            data: null,
            success: false,
            message: "Failed to mark seen the notification"
        }
    }

    /**
     *Get notifications user specific
     *
     * @param {string} userId
     * @return {*}  {Promise<Notification[]>}
     * @memberof NotificationService
     */
    async getByUser(userId: string): Promise<GenericResponse<Notification[]>> {
        let res = await this.notificationRepository.getByUser(userId);
        return {
            data: res,
            success: true,
            message: "Notifications fetched successfully"
        }
    }

    /**
     *Get notifications user specific including own
     *
     * @param {string} userId
     * @return {*}  {Promise<Notification[]>}
     * @memberof NotificationService
     */
    async getByUserWithOwn(userId: string): Promise<GenericResponse<Notification[]>> {
        let res = await this.notificationRepository.getByUserWithOwn(userId);
        return {
            data: res,
            success: true,
            message: "Notifications fetched successfully"
        }
    }

    public setupNotification(notification: any) {
        let ous: any[] = notification?.sender?.ou;
        if (Array.isArray(ous) && ous.length > 0) {
            notification.name = ous[0]?.name
        }

        if (notification.type == NotificationType.COMMENT_REPLY) {
            notification.link = "/admin/comments";
            notification.title = notification?.data?.ou?.name;
            notification.image = notification?.data?.ou?.image;
        } else if (notification.type == NotificationType.CONTENT_RECEIVED_FOR_APPROVAL) {
            notification.link = "/update";
            notification.title = notification?.data?.ou?.name;
            notification.image = notification?.data?.ou?.image;
        } else if (notification.type == NotificationType.DATA_UPDATE) {
            notification.title = notification?.data?.ou?.name;
            notification.image = notification?.data?.ou?.image;
            let name = notification?.data.updated_by.name;
            notification.name = name?.first + ' ' + name?.middle + ' ' + name?.last;
            notification.link = `/data/${notification?.data?.before?.dataview?.id}`
        } else if (notification.type == NotificationType.KLIBRARY_NOTIFICATION) {
            notification.link = "/knowledge-library"
            notification.title = notification.data?.name;
            notification.image = notification.data?.image;
        } else if (notification.type == NotificationType.NEW_COMMENT) {
            notification.link = "/admin/comments";
            notification.title = notification?.data?.ou?.name;
            notification.image = notification?.data?.ou?.image;
        } else if (notification.type == NotificationType.USER_REGISTER) {
            notification.link = "/admin/users"
            notification.image = notification?.sender?.image;
        } else if (notification.type == NotificationType.SURVEY) {
            notification.link = "/sa/survey/attempt/" + notification?.data?._id
            notification.image = notification?.data?.headerImage;
            notification.title = notification?.data?.name;
        } else if (notification.type == NotificationType.ASSESSMENT) {
            notification.link = "/sa/assessment/attempt/" + notification?.data?._id
            notification.image = notification?.data?.headerImage;
            notification.title = notification?.data?.name;
            //Training cases
        } else if (notification.type == NotificationType.NEW_SKILL_TRAINING_CREATE) {
            notification.link = `training/skill-training/${notification?.data?.data?.type}`;
            notification.image = "/public/training/fdafdajdsklafdfaf.png"
            notification.title = notification?.data?.data?.topic;
        } else if (notification.type == NotificationType.NEW_SKILL_SELF) {
            notification.link = "/user-profile";
            notification.image = notification?.data?.course?.image;
            notification.title = notification?.data?.course.title;
        } else if (notification.type == NotificationType.NEW_SKILL_MANAGER) {
            notification.link = `/training/skill-training/${notification?.data?.data?.type}`;
            notification.image = notification?.data?.course?.image;
            notification.title = notification?.data?.course.title;
        } else if (notification.type == NotificationType.NEW_SKILL_CANCELLED) {
            notification.link = "";
            notification.image = notification?.data?.course?.image;
            notification.title = notification?.data?.data?.topic;
        } else if (notification.type == NotificationType.CONTINUOUS_TRAINING_CREATE) {
            notification.link = "/training/task-view";
            notification.image = "/public/training/fdafdajdsklafdfaf.png"
            notification.title = notification?.data?.data?.topic;
        } else if (notification.type == NotificationType.CONTINUOUS_TRAINING_PUBLISH) {
            notification.link = `/training/training-page/${notification?.data?.course._id}`;
            notification.image = notification?.data?.course?.image;
            notification.title = notification?.data?.data?.topic;
            notification.trainingDate = `(${notification?.data?.course?.start_date.split('T')[0]}) - (${notification?.data?.course?.end_date.split('T')[0]})`
        } else if (notification.type == NotificationType.BRANCH_TRAINING_CREATE) {
            notification.link = "/training/new-branch";
            notification.image = "/public/training/fdafdajdsklafdfaf.png"
            notification.title = notification?.data?.data?.topic;
        } else if (notification.type == NotificationType.BRANCH_TRAINING_PUBLISH) {
            notification.link = `/training/training-page/${notification?.data?.course._id}`;
            notification.image = notification?.data?.course?.image;
            notification.title = notification?.data?.data?.topic;
            notification.trainingDate = `(${notification?.data?.course?.start_date.split('T')[0]}) - (${notification?.data?.course?.end_date.split('T')[0]})`
        } else if (notification.type == NotificationType.CUSTOM_NOTIFICATION) {
            notification.link = `/training/training-page/${notification?.data?.course._id}`;
            notification.image = notification?.data?.course?.image;
            notification.title = notification?.data?.course?.title;
            notification.message = notification?.data?.message;
        } else if (notification.type == NotificationType.COURSE_ADD_REQUEST) {
            notification.link = `/training/skill-training/${notification?.data?.type}`;
            notification.title = notification?.data?.data?.topic;
        } else if (notification.type == NotificationType.TRAINER_ADDED) {
            notification.link = `/training/training-page/${notification?.data?._id}`;
            notification.image = notification?.data?.image;
            notification.title = notification?.data?.title;
            notification.trainingDate = `(${notification?.data?.start_date.split('T')[0]}) - (${notification?.data?.end_date.split('T')[0]})`
        } else if (notification.type == NotificationType.MASTER_TRAINER_ADDED) {
            notification.link = `/training/training-page/${notification?.data?._id}`;
            notification.image = notification?.data?.image;
            notification.title = notification?.data?.title;
            notification.trainingDate = `(${notification?.data?.start_date.split('T')[0]}) - (${notification?.data?.end_date.split('T')[0]})`
        }
        return notification;
    }
}
