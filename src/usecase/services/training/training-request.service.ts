import { Inject, Injectable } from '@nestjs/common';
import { CourseRepository } from 'src/domain/course/interfaces/course-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { OURepository } from 'src/domain/organizational-unit/interfaces/ou-repository.interface';
import {
  TrainingRequest,
  UpdateTrainingRequest,
} from 'src/domain/training/dto/training-request.dto';
import { TrainingRequestRepository } from 'src/domain/training/interfaces/training-request-repository.interface';
import { NotificationService } from '../notification/notification.service';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';
import { TrainingTypeRepository } from 'src/domain/training/interfaces/training-type-repository.interface';
import { TrainingType } from 'src/domain/training/dto/training-type.dto';
import { AuthRepository } from 'src/domain/user-auth/interfaces/auth-repository.interface';
import { Types } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { JsonService } from '../json/json.service';
import * as path from 'path';


const basePath = process.env.NODE_ENV === 'production'
    ? path.join('C:/kgate/kgateBeta/dist')
    : path.join(__dirname);


@Injectable()
export class TrainingRequestService {
  constructor(
    @Inject('TrainingRequestRepository')
    private TrainingRequestRepository: TrainingRequestRepository,
    @Inject('CourseRepository') private courseRepository: CourseRepository,
    @Inject('OURepository') private ouRepository: OURepository,
    @Inject('TrainingTypeRepository')
    private trainingTypeRepository: TrainingTypeRepository,
    @Inject('AuthRepository') private userRepository: AuthRepository,
    private notificationService: NotificationService,
    private mailService: MailService,
    private jsonService: JsonService,

  ) {}

  /**
   *
   *
   * @param {*} page
   * @param {*} offset
   * @param {*} filter
   * @return {*}  {Promise<GenericResponse<any>>}
   * @memberof TrainingRequestService
   */
  public async getAll(page, offset, filter): Promise<GenericResponse<any>> {
    const res: any = await this.TrainingRequestRepository.getAll(
      page,
      offset,
      filter,
    );
    const documentCount = await this.TrainingRequestRepository.countDocuments(
      filter,
    );
    let data: any = {
      data: res,
      totalCount: documentCount,
    };
    const response: GenericResponse<TrainingRequest[]> = {
      success: true,
      message: 'Training Request fetched Successfully',
      data: data,
    };
    return response;
  }

  /**
   *
   *
   * @param {*} page
   * @param {*} offset
   * @param {*} filter
   * @return {*}  {Promise<GenericResponse<any>>}
   * @memberof TrainingRequestService
   */
  public async getAllAggregated(
    page,
    offset,
    filter,
  ): Promise<GenericResponse<any>> {
    const res: any = await this.TrainingRequestRepository.getAllAggregated(
      page,
      offset,
      filter,
    );
    const documentCount = await this.TrainingRequestRepository.countDocuments(
      filter,
    );
    let data: any = {
      data: res,
      totalCount: documentCount,
    };
    const response: GenericResponse<TrainingRequest[]> = {
      success: true,
      message: 'Training Request fetched Successfully',
      data: data,
    };
    return response;
  }

  /**
   *
   *
   * @param {*} page
   * @param {*} offset
   * @param {*} filter
   * @return {*}  {Promise<GenericResponse<any>>}
   * @memberof TrainingRequestService
   */
  public async getAllAggregatedV2(
    page,
    offset,
    filter,
  ): Promise<GenericResponse<any>> {
    const res: any = await this.TrainingRequestRepository.getAllAggregatedV2(
      page,
      offset,
      filter,
    );
    const documentCount =
      await this.TrainingRequestRepository.getAllAggregatedV2Count(filter);
    let data: any = {
      data: res,
      totalCount: documentCount,
    };
    const response: GenericResponse<TrainingRequest[]> = {
      success: true,
      message: 'Training Request fetched Successfully',
      data: data,
    };
    return response;
  }

  /**
   *
   *
   * @param {TrainingRequest} data
   * @param {string} uid
   * @return {*}  {Promise<GenericResponse<TrainingRequest>>}
   * @memberof TrainingRequestService
   */
  public async create(
    data: TrainingRequest,
    uid: string,
  ): Promise<GenericResponse<TrainingRequest>> {
    const res = await this.TrainingRequestRepository.create(data);

    let type: TrainingType = await this.trainingTypeRepository.getOne(
      data.type,
    );
    let notification: Notification = null;
    //On Create notification to managers
    if (type.name == 'WEEKLY' || type.name == 'Unified session') {
      let ou = await this.ouRepository.getByOuId(data.ou);

      let receivers: any = ou?.managers;

      if (receivers && receivers?.length > 0) {
        notification = {
          receiver: receivers,
          seenBy: [],
          sender: uid,
          type: NotificationType.CONTINUOUS_TRAINING_CREATE,
          category: NotificationCategory.TRAINING,
          data: { data, type: type.name },
        };
      }
    } else if (type.name == 'New Branch') {
      let ou = await this.ouRepository.getByOuId(data.ou);

      let receivers: any = ou?.managers;

      if (!!receivers && receivers?.length > 0) {
        notification = {
          receiver: receivers,
          seenBy: [],
          sender: uid,
          type: NotificationType.BRANCH_TRAINING_CREATE,
          category: NotificationCategory.TRAINING,
          data: { data, type: type.name },
        };
      }
    } else {
      notification = {
        receiver: [],
        seenBy: [],
        sender: uid,
        type: NotificationType.NEW_SKILL_TRAINING_CREATE,
        category: NotificationCategory.TRAINING,
        data: { data, type: type.name },
      };
    }

    if (notification) {
      this.notificationService.create(notification);
    }

    const response: GenericResponse<TrainingRequest> = {
      success: true,
      message: 'Training Request added Successfully',
      data: res,
    };
    return response;
  }

  public getAllbyCourses(courses: string[]): Promise<TrainingRequest[]> {
    return this.TrainingRequestRepository.getAllByCourses(courses);
  }

  public getAllByCoursesAndCourses(courses: string[]): Promise<any[]> {
    return this.TrainingRequestRepository.getAllByCoursesAndCourses(courses);
  }

  public async getUnregisteredUsers(
    courseId: string,
  ): Promise<GenericResponse<string[]>> {
    let res = await this.TrainingRequestRepository.getUnregisteredUsers(
      courseId,
    );

    return res.length > 0
      ? {
          message: 'Course users fetched successfully',
          success: true,
          data: res[0]?.unregisteredUsers,
        }
      : {
          message: 'Failed to fetch course users',
          success: false,
          data: [],
        };
  }

  public async updateUnregisteredUsers(
    courseId: any,
    users: string[],
  ): Promise<GenericResponse<any>> {
    let res = await this.TrainingRequestRepository.updateUnregisteredUsers(
      courseId,
      users,
    );

    return res.modifiedCount > 0
      ? {
          message: 'Courses users updated successfully',
          success: true,
          data: null,
        }
      : {
          message: 'Failed to update course users',
          success: false,
          data: null,
        };
  }

  /**
   *
   *
   * @param {UpdateTrainingRequest} data
   * @param {string} user
   * @return {*}  {Promise<GenericResponse<TrainingRequest>>}
   * @memberof TrainingRequestService
   */
  public async update(
    data: UpdateTrainingRequest,
    user: string,
  ): Promise<GenericResponse<TrainingRequest>> {

    if(data.newInviation){
      this.handeleInvation(data.newInviation,user)
      delete data.newInviation
    }


    const res = await this.TrainingRequestRepository.update(data);
    // console.log('==>data update', data);
    let type: TrainingType = await this.trainingTypeRepository.getOne(res.type);
    data.type = res.type;
    let notification: Notification = null;
    let course: any = await this.courseRepository.getSpecificCourse(data._id);
    if (course.length > 0) {
      course = course[0];
    }
    let managers = await this.ouRepository.getOuManagersByIds(data.ous);
    //Publish Courses Case
    if (data.status == 'PUBLISHED') {
      //Weekly and monthly case
      if (type.name == 'WEEKLY' || type.name == 'Unified session') {
        //Activating course
        await this.courseRepository.activateRequested({
          _id: data._id,
          active: true,
        });

        notification = {
          receiver: course.attendees,
          seenBy: [],
          sender: user,
          type: NotificationType.CONTINUOUS_TRAINING_PUBLISH,
          category: NotificationCategory.TRAINING,
          data: { data, course },
        };
      } else if (type.name == 'New Branch') {
        await this.courseRepository.activateRequested({
          _id: data._id,
          active: true,
        });

        notification = {
          receiver: course.attendees,
          seenBy: [],
          sender: user,
          type: NotificationType.BRANCH_TRAINING_PUBLISH,
          category: NotificationCategory.TRAINING,
          data: { data, course },
        };
      } else {
        //Skill Training Cases

        //Activating course
        await this.courseRepository.activateRequested({
          _id: data._id,
          active: true,
        });

        if (data.registrationType == 'Self Registration') {
          let users = await this.userRepository.getByOus(data.ous);
          if (users.length > 0) {
            notification = {
              receiver: users.map((u) => u._id),
              seenBy: [],
              sender: user,
              type: NotificationType.NEW_SKILL_SELF,
              category: NotificationCategory.TRAINING,
              data: { data, course },
            };
          }
        } else if (data.registrationType == 'Manager Registration') {
          if (managers.length > 0) {
            notification = {
              receiver: managers.map((u) => String(u)),
              seenBy: [],
              sender: user,
              type: NotificationType.NEW_SKILL_MANAGER,
              category: NotificationCategory.TRAINING,
              data: { data, course },
            };
          }
        }
      }
    } else if (data.status == 'CANCELED') {
      //Check for cancelled status, send notification and empty the attendees of users.attendees
      if (!['WEEKLY', 'Unified session', 'New Branch'].includes(data.status)) {
        notification = {
          receiver: [...course.attendees],
          seenBy: [],
          sender: user,
          type: NotificationType.NEW_SKILL_CANCELLED,
          category: NotificationCategory.TRAINING,
          data: { data, course },
        };

        course.attendees = [];
        this.courseRepository.update(course);
      }
    } else if (data.status == 'TRAINING_CREATED' && type.name == 'New Branch') {
      let mid = data.master_trainer;
      notification = {
        receiver: [String(mid)],
        seenBy: [],
        sender: user,
        type: NotificationType.MASTER_TRAINER_ADDED,
        category: NotificationCategory.TRAINING,
        data: course,
      };
    }

    if (notification) {
      this.notificationService.create(notification);
    }

    const response: GenericResponse<TrainingRequest> = {
      success: true,
      message: 'Training Request updated Successfully',
      data: res,
    };
    return response;
  }


  async handeleInvation(data:any, trainer: any){
    // console.log("zoom;ink=",data.zoomLink , "user", data.userId, "trinrt",trainer)
    let user = await this.userRepository.findById(data.userId)
    try {
      // let messages = await this.jsonService.parseJson(path.join(basePath, 'domain/json/email-messages/email-messages.json'));
      
      // console.log("Email Path : ", user.email);
      
      this.mailService.sendMail({
          subject: "Meeting Inviation",
          template: 'impact-invitation',
          context: {
              heading: "أهلاً بك",
              text: "لقد تم اختيارك لحضور اجتماع قياس الأثر، التفاصيل موضحة أدناه:",
              link : data.zoomLink,
              date: data.date.substring(0,10),
              time : data.time.split('T')[1]
          }, email: user.email
      })
  } catch (e) {
      // console.log('EMAIL ERROR', e);
  }
  }

  /**
   *
   *
   * @param {string} _id
   * @return {*}  {Promise<GenericResponse<any>>}
   * @memberof TrainingRequestService
   */
  public async delete(_id: string): Promise<GenericResponse<any>> {
    let id = new Types.ObjectId(_id);
    const res = await this.TrainingRequestRepository.delete(id);

    const response: GenericResponse<any> = {
      success: true,
      message:
        res.deletedCount > 0
          ? 'Training Request deleted Successfully'
          : 'Training RequestId not found',
      data: res,
    };
    return response;
  }

  /**
   *
   *
   * @param {string} _id
   * @return {*}  {Promise<GenericResponse<TrainingRequest>>}
   * @memberof TrainingRequestService
   */
  public async getOne(_id: string): Promise<GenericResponse<TrainingRequest>> {
    const res = await this.TrainingRequestRepository.getOne(_id);

    const response: GenericResponse<any> = {
      success: true,
      message: res
        ? 'Training Request fetched Successfully'
        : 'Training Requestnot found',
      data: res,
    };

    return response;
  }

  /**
   *
   *
   * @param {string} type
   * @param {number} page
   * @param {number} offset
   * @return {*}  {Promise<GenericResponse<TrainingRequest>>}
   * @memberof TrainingRequestService
   */
  public async getGraphData(
    data: any,
    page: number,
    offset: number,
  ): Promise<GenericResponse<TrainingRequest>> {
    const res = await this.TrainingRequestRepository.getGraphData(data);

    const response: GenericResponse<any> = {
      success: true,
      message: res
        ? 'Training Request fetched Successfully'
        : 'Training Requestnot found',
      data: res,
    };

    return response;
  }

  /**
   *
   *
   * @param {string} type
   * @param {number} page
   * @param {number} offset
   * @return {*}  {Promise<GenericResponse<TrainingRequest>>}
   * @memberof TrainingRequestService
   */
  public async getGraphDataUsers(
    data: any,
    page: number,
    offset: number,
  ): Promise<GenericResponse<TrainingRequest>> {
    if (data.start_date && data.end_date) {
      data.start_date = data.start_date.substring(0, 10);
      data.end_date = data.end_date.substring(0, 10);
    }

    const res = await this.TrainingRequestRepository.getGraphDataUsers(data);

    const topThree = await this.TrainingRequestRepository.getTopThree(data);

    const topTopics = await this.TrainingRequestRepository.getTopTopics(data);

    const totalCount =
      await this.TrainingRequestRepository.getTotalAndCompleted(data);

    const skillTrainingData =
      await this.TrainingRequestRepository.getSkillTrainingData(data);

    let result = {
      userData: res,
      topThree: topThree,
      topTopics: topTopics,
      totalAndCompleted: totalCount,
      skillTrainingData: skillTrainingData,
    };

    const response: GenericResponse<any> = {
      success: true,
      message: res
        ? 'Training graphs fetched Successfully'
        : 'Training graphs found',
      data: result,
    };

    return response;
  }

  public async getCalendar(query: any): Promise<GenericResponse<any>> {
    const res = await this.TrainingRequestRepository.getCalendar(query);

    const response: GenericResponse<any> = {
      success: true,
      message: res
        ? 'Training calender fetched Successfully'
        : 'Training calender not found',
      data: res,
    };

    return response;
  }

  public async getMangerImpactTask(id: string, filter: any): Promise<GenericResponse<any>> {
    const res = await this.TrainingRequestRepository.getMangerImpactTask(id, filter);

    const response: GenericResponse<any> = {
      success: true,
      message: res ? 'Impact tasks send successfully' : 'No Record Found',
      data: res,
    };

    return response;
  }
}
