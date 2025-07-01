import { Inject, Injectable } from '@nestjs/common';
import { Session, UpdateSession } from 'src/domain/course/dto/session.dto';
import { SessionRepository } from 'src/domain/course/interfaces/session-repository.interface';
import { CourseRepository } from 'src/domain/course/interfaces/course-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { NotificationService } from '../notification/notification.service';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';

@Injectable()
export class SessionService {
    constructor(
        @Inject('SessionRepository') private SessionRepository: SessionRepository,
        @Inject('CourseRepository') private courseRepository: CourseRepository,
        private notificaitonService: NotificationService,
    ) { }

    /**
     *
     *
     * @param {Session} Session
     * @return {*}  {Promise<GenericResponse<Session>>}
     * @memberof SessionService
     */
    public async create(session: Session, courseId: string, uid: string): Promise<GenericResponse<Session>> {
        let res: any = await this.SessionRepository.create(session);

        if (!!session?.trainer) {
            let { name, user_id, email }: any = (session.trainer as any);
            let course = await this.courseRepository.getSimpleCourse(courseId);
            // console.log(course);
            const notification: Notification = {
                receiver: [user_id],
                seenBy: [],
                sender: uid,
                type: NotificationType.TRAINER_ADDED,
                category: NotificationCategory.TRAINING,
                data: course
            }
            await this.notificaitonService.create(notification);
        }

        await this.courseRepository.addSessionToCourse(courseId, res._id, false, session.sessionType);

        return {
            message: "Session Created successfully",
            success: true,
            data: res,
        }
    }

    public async checkTrainerAvailability(query: any): Promise<GenericResponse<Session>> {
        let res: any = await this.SessionRepository.checkTrainerAvailability(query);

        return {
            message: "Session Created successfully",
            success: true,
            data: res,
        }
    }
    /**
     *
     *
     * @return {*}  {Promise<GenericResponse<Session[]>>}
     * @memberof SessionService
     */
    public async getAll(): Promise<GenericResponse<Session[]>> {
        let res = await this.SessionRepository.getAll();
        return {
            message: "Sessions fetched successfully",
            success: true,
            data: res,
        }
    }
    /**
     *
     *
     * @param {UpdateSession} Session
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof SessionService
     */
    public async update(Session: UpdateSession): Promise<GenericResponse<null>> {
        let res = await this.SessionRepository.update(Session);
        if (res.modifiedCount > 0) {
            return {
                message: "Session updated successfully",
                success: true,
                data: null,
            }
        }
        return {
            message: "Failed to updated Session",
            success: true,
            data: null,
        }
    }


    async updateSessionOrder(data: any[]) {
        await this.SessionRepository.updateSessionOrder(data);
        return {
            message: "Sessions Order Updated successfully",
            success: true,
            data: null,
        }
    }


    /**
    *
    *
    * @param {UpdateSession} Session
    * @return {*}  {Promise<GenericResponse<null>>}
    * @memberof SessionService
    */
    public async addSeenBy(Session: any): Promise<GenericResponse<null>> {
        let res: any = await this.SessionRepository.addSeenBy(Session);
        if (res?.modifiedCount > 0) {
            return {
                message: "User successfully seen",
                success: true,
                data: null,
            }
        }
        return {
            message: "Record not updated",
            success: true,
            data: null,
        }
    }
    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof SessionService
     */
    public async delete(_id: string): Promise<GenericResponse<null>> {
        let res = await this.SessionRepository.delete(_id);
        if (res.deletedCount > 0) {
            return {
                message: "Session deleted successfully",
                success: true,
                data: null,
            }
        }
        return {
            message: "Failed to delete Session",
            success: true,
            data: null,
        }
    }
}
