import { Inject, Injectable } from '@nestjs/common';
import { Course, CourseMaterialDto, UpdateCourse } from 'src/domain/course/dto/course.dto';
import { ProgramRepository } from 'src/domain/course/interfaces/program-repository.interface';
import { SessionRepository } from 'src/domain/course/interfaces/session-repository.interface';
import { CourseRepository } from 'src/domain/course/interfaces/course-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { OURepository } from 'src/domain/organizational-unit/interfaces/ou-repository.interface';
import { TrainingRequestRepository } from 'src/domain/training/interfaces/training-request-repository.interface';
import { AuthRepository } from 'src/domain/user-auth/interfaces/auth-repository.interface';
import { NotificationService } from '../notification/notification.service';
import { SurveyResultRepository } from 'src/domain/survey/interfaces/survey-result-repository.interface';
import { AssessmentResultRepository } from 'src/domain/assessment/interfaces/assessment-result-repository.interface';
import { TrainingRepository } from 'src/domain/training/interfaces/training-repository.interface';

@Injectable()
export class CourseService {
    constructor(
        @Inject('TrainingRepository') private TrainingRepository: TrainingRepository,
        @Inject('TrainingRequestRepository') private TrainingRequestRepository: TrainingRequestRepository,
        @Inject('CourseRepository') private courseRepository: CourseRepository,
        @Inject('SessionRepository') private SessionRepository: SessionRepository,
        @Inject('ProgramRepository') private ProgramRepository: ProgramRepository,
        @Inject('OURepository') private ouRepository: OURepository,
        @Inject('AuthRepository') private userRepository: AuthRepository,
        @Inject('SurveyResultRepository') private surveyResultRepository: SurveyResultRepository,
        @Inject('AssessmentResultRepository') private assessmentResultRepository: AssessmentResultRepository,
        private notificationService: NotificationService
    ) { }

    /**
     *
     *
     * @param {Course} course
     * @return {*}  {Promise<GenericResponse<Course>>}
     * @memberof CourseService
     */
    public async create(course: Course): Promise<GenericResponse<Course>> {

        let res = await this.courseRepository.create(course);

        return {
            message: "Course Created successfully",
            success: true,
            data: res,
        }
    }
    /**
     *
     *
     * @param {number} page
     * @param {number} size
     * @return {*}  {Promise<GenericResponse<Course[]>>}
     * @memberof CourseService
     */
    public async getAll(page: number, size: number): Promise<GenericResponse<Course[]>> {
        let res = await this.courseRepository.getAll(page, size);
        return {
            message: "Courses fetched successfully",
            success: true,
            data: res,
        }
    }


    public async addSessionToCourse(courseId: string, sessionId: string, remove: boolean, type?: string): Promise<GenericResponse<null>> {
        this.courseRepository.addSessionToCourse(courseId, sessionId, remove, type);
        return {
            message: `Session ${remove ? 'removed' : 'added'} successfully`,
            success: true,
            data: null,
        }
    }

    public async updateMaterialOrder(material: CourseMaterialDto[], courseId: string): Promise<GenericResponse<null>> {
        let res = await this.courseRepository.updateMaterialOrder(material, courseId);
        return res.modifiedCount > 0 ? {
            message: `Material updated successfully`,
            success: true,
            data: null,
        } : {
            message: `Material failed to update`,
            success: false,
            data: null,
        }
    }

    public async addMaterialToCourse(material: CourseMaterialDto): Promise<GenericResponse<null>> {
        this.courseRepository.addMaterialToCourse(material);
        return {
            message: `Material ${material.remove ? 'Removed' : 'Added'} successfully`,
            success: true,
            data: null,
        }
    }

    /**
     *
     *
     * @param {*} id
     * @return {*}  {Promise<GenericResponse<Course[]>>}
     * @memberof CourseService
     */
    public async getSpecificCourse(id): Promise<GenericResponse<Course[]>> {
        let res = await this.courseRepository.getSpecificCourse(id);
        return {
            message: "Courses fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get course data new API
     *
     * @param {string} id
     * @return {*}  {Promise<Course[]>}
     * @memberof CourseService 
     */
    public async getStructuredCourseById(id: string): Promise<GenericResponse<any[]>> {
        let res = await this.courseRepository.getStructuredCourseById(id);
        return {
            message: "Courses fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
    *Get course data new API
    *
    * @param {string} id
    * @return {*}  {Promise<Course[]>}
    * @memberof CourseService 
    */
    public async getStructuredCourseWithImpactById(id: string, trainer: string): Promise<GenericResponse<any[]>> {
        let res = await this.courseRepository.getStructuredCourseWithImpactById(id, trainer);
        return {
            message: "Courses fetched successfully",
            success: true,
            data: res,
        }
    }

    public async courseCertificate(data: any): Promise<GenericResponse<Course[]>> {
        // console.log("test 2")
        let res = await this.courseRepository.courseCertificate(data);
        return {
            message: "Courses fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     *
     *
     * @param {*} id
     * @return {*}  {Promise<GenericResponse<Course[]>>}
     * @memberof CourseService
     */
    public async getUserCourses(id): Promise<GenericResponse<Course[]>> {
        let res = await this.courseRepository.getUserCourse(id);
        return {
            message: "Courses fetched successfully",
            success: true,
            data: res,
        }
    }

    public async getCourseUsers(courseId: string): Promise<GenericResponse<string[]>> {
        let res = await this.courseRepository.getCourseUsers(courseId);

        return res.length > 0 ? {
            message: "Course users fetched successfully",
            success: true,
            data: res[0]?.attendees,
        } : {
            message: "Failed to fetch course users",
            success: false,
            data: [],
        }
    }

    public async updateCourseUsers(courseId: any, users: string[]): Promise<GenericResponse<any>> {
        let res = await this.courseRepository.updateCourseUsers(courseId, users);

        return res.modifiedCount > 0 ? {
            message: "Courses users updated successfully",
            success: true,
            data: null,
        } : {
            message: "Failed to update course users",
            success: false,
            data: null,
        }
    }


    /**
     *
     *
     * @param {*} id
     * @return {*}  {Promise<GenericResponse<Course[]>>}
     * @memberof CourseService
     */
    public async getRating(id): Promise<GenericResponse<Course[]>> {
        let course: any = await this.courseRepository.getCourseByID(id);

        let attendees = course.attendees

        const updatedRatings = [...course.userRating];

        // Check each attendee
        attendees.forEach(attendee => {
            const attendeeId = attendee._id.toString();;
            const isAlreadyRated = updatedRatings.some(rating => rating._id.toString() === attendeeId);

            if (!isAlreadyRated) {
                const flattenedName = [attendee.name.first, attendee.name.middle, attendee.name.last].filter(Boolean).join(' ');

                updatedRatings.push({
                    name: flattenedName,
                    score: 0,
                    _id: attendee._id,
                    email: attendee.email
                });
            }
        });


        await this.courseRepository.update({ _id: id, userRating: updatedRatings })

        // console.log("--updatedRatings-", updatedRatings)

        return {
            message: "Courses Rating fetched successfully",
            success: true,
            data: updatedRatings,
        }
    }



    /**
     *
     *
     * @param {*} id
     * @return {*}  {Promise<GenericResponse<Course[]>>}
     * @memberof CourseService
     */
    public async getTrainerRating(id, uid): Promise<GenericResponse<any>> {
        let attendees: any = await this.courseRepository.getCourseUserByID(id)
        let trainers: any = await this.SessionRepository.getSessionTrainers(id);
        return {
            message: "Trainers & Users fetched successfully",
            success: true,
            data: {
                _id: uid,
                users: attendees,
                trainers: trainers
            },
        }
    }

    /**
     *
     *
     * @param {*} id
     * @return {*}  {Promise<GenericResponse<Course[]>>}
     * @memberof CourseService
     */
    public async getTrainingCompletedUsers(id: any): Promise<GenericResponse<any>> {
        let attendees: any = await this.courseRepository.getTrainingCompletedUsers(id)
        return {
            message: "Training completed users",
            success: true,
            data: attendees
        }
    }

    /**
     *
     *
     * @param {*} id
     * @return {*}  {Promise<GenericResponse<Course[]>>}
     * @memberof CourseService
     */
    public async submitTrainerRating(data): Promise<GenericResponse<any>> {

        let course: any = await this.courseRepository.getCourseByID(data._id)

        // Find the index of the object with the matching _id
        const index = course?.trainerRating.findIndex(rating => rating._id === data?.trainerRating?._id);

        if (index !== -1) {
            // If found, replace the object
            course.trainerRating[index] = data.trainerRating;
        } else {
            // If not found, push the new object to the array
            course.trainerRating.push(data.trainerRating);
        }

        await this.courseRepository.update({ _id: data._id, trainerRating: course.trainerRating })

        return {
            message: "Trainers Rating Submitted successfully!",
            success: true,
            data: []
        }
    }

    public async checkRating(data): Promise<GenericResponse<any>> {
        let struCourse = await this.courseRepository.getStructuredCourseById(data.courseId);
        let trainers = struCourse[0]?.training_request?.ratingSettings?.Trainer || [];
        let master_trainer = struCourse[0]?.training_request?.master_trainer?.toString() || '';
        let users = struCourse[0]?.attendees.map(userId => userId.toString()) || [];
        let hasPermission = false;
        if (data.isMainTrainer) {
            hasPermission = (data.uid == master_trainer) ? true : false
        }
        else {
            hasPermission = data.ratingFor === 'User' ? trainers.includes(data.uid) : users.includes(data.uid);
        }

        return {
            message: "Trainers Rating Submitted successfully!",
            success: true,
            data: hasPermission
        }
    }

    public async getCourseResults(data): Promise<GenericResponse<any>> {
        let struCourse = await this.courseRepository.getStructuredCourseById(data.courseId);
        let Course = struCourse[0];
        let Users: any = await this.courseRepository.getCourseUserByID(data.courseId)
        let Surveys = Course.session.filter((e: any) => e.sessionType == 'Survey')
        let Assessments = Course.session.filter((e: any) => e.sessionType == 'Assessment')
        if (Surveys.length > 0) {
            Surveys = await Promise.all(Surveys.map(async (item: any) => {
                item.totalUsers = await this.surveyResultRepository.findTotalUsers(item.surveyId);
                item.graphData = await this.surveyResultRepository.getGraphData(item.surveyId, null, null, null);
                return item;
            }));
        }

        if (Users && Assessments.length > 0) {
            Users = await Promise.all(Users.map(async (user: any) => {
                user.assessments = await Promise.all(Assessments.map(async (assessment: any) => {
                    return {
                        assessmentId: assessment.assessmentId,
                        result: await this.assessmentResultRepository.getAssessmentResultsByEmail(assessment.assessmentId, user.email),
                    };
                }));
                return user;
            }));
        }

        let CourseResults = await this.courseRepository.getCourseResults(data.courseId);

        let res = {
            "Surveys": Surveys,
            "Users": Users,
            "Assessments": Assessments,
            "CourseResults": CourseResults
        }
        return {
            message: "Trainers Results Fetched successfully!",
            success: true,
            data: res
        }
    }

    /**
     *
     *
     * @param {*} id
     * @return {*}  {   }
     * @memberof CourseService
     */
    public async getSpecificCourseById(id): Promise<GenericResponse<Course[]>> {
        let res = await this.courseRepository.getSpecificCourseById(id);
        return {
            message: "Courses fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     *
     *
     * @param {UpdateCourse} course
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof CourseService
     */
    public async update(course: UpdateCourse): Promise<GenericResponse<null>> {
        let res = await this.courseRepository.update(course);
        if (res.modifiedCount > 0) {
            return {
                message: "Course updated successfully",
                success: true,
                data: null,
            }
        }
        return {
            message: "Failed to updated course",
            success: true,
            data: null,
        }
    }

    /**
     *
     *
     * @param {*} data
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof CourseService
     */
    public async assignAttendees(data: any, uid: string): Promise<GenericResponse<null>> {



        let request: any = await this.TrainingRequestRepository.getOne(data._id);

        if (data.flag && data.flag == 'User Request') {

            let managers = await this.ouRepository.getOuManagersByIds(request.ous);

            // console.log('MANAGERS:: ', managers);

            if (!!managers) {
                let user: any = await this.userRepository.findByIdWithoutOu(uid);
                let userManagers = await this.ouRepository.getOuManagersByIds(user.ou);
                // console.log('USER:: ', user);
                let ou = CourseService.getComman(managers, userManagers);
                let receivers = await this.ouRepository.getOuManagersByIds([ou])
                // console.log('OU:: ', ou)
                // console.log('Receivers:: ', receivers);
                if (ou) {
                    let notification = {
                        receiver: receivers,
                        seenBy: [],
                        sender: uid,
                        type: NotificationType.COURSE_ADD_REQUEST,
                        category: NotificationCategory.TRAINING,
                        data: { data: request, type: request.type }
                    }

                    this.notificationService.create(notification);
                }
            }

            let netRequestedAttendees = [...request?.attendeesRequests, ...data?.attendees]
            await this.TrainingRequestRepository.update({ _id: data._id, attendeesRequests: netRequestedAttendees })
            return {
                message: "Assigned Successfully",
                success: true,
                data: null,
            }
        }

        if (data.assignAll) {
            let addUser = await this.courseRepository.update({ _id: request.trainingId, attendees: data.attendees })
            return {
                message: addUser.modifiedCount > 0 ? "Assigned Successfully" : "Users Not Assigned",
                success: true,
                data: null,
            }
        }

        let training: any = await this.courseRepository.getSpecificCourseById(request.trainingId);


        //calculations

        // Ensure attendees array doesn't contain duplicates
        // const uniqueAttendees = [...new Set(attendees.map(att => att.id))];

        // Calculate how many more attendees can be added
        const remainingAttendeesCount = request.numberOfAttendees - training[0].attendees.length;

        // If there are more available attendees than allowed, add all of them
        const addedAttendees = data.attendees.slice(0, Math.min(remainingAttendeesCount, data.attendees.length));

        // Combine existing attendees and added attendees (without duplicates)
        const newAttendees = [...training[0].attendees, ...addedAttendees];

        // Identify remaining available attendees
        const remainingAvailableAttendees = data.attendees.slice(remainingAttendeesCount);

        //combining remaining attendees with pervious remaining attendees
        let netRemainingAttendees = [...request.pendingAttendees, ...remainingAvailableAttendees]

        netRemainingAttendees = netRemainingAttendees.map(item => item.toString())

        let uniqueNetRemainingAttendees: any[] = Array.from(new Set(netRemainingAttendees));

        let updateRequest = await this.TrainingRequestRepository.update({ _id: data._id, pendingAttendees: uniqueNetRemainingAttendees })

        let updateTraining = await this.courseRepository.update({ _id: request.trainingId, attendees: newAttendees })

        return {
            message: remainingAttendeesCount > 0 ? "Assigned Successfully" : "Users added to pending list",
            success: true,
            data: null,
        }
    }

    public static getComman(arr1: any[], arr2: any[]) {
        const set = new Set(arr1);

        // Iterate through the second array
        for (const element of arr2) {
            // Check if the element exists in the set
            if (set.has(element)) {
                // Return the first common element found
                return element;
            }
        }
    }

    public async getUserProfileCalender(query: any): Promise<GenericResponse<any>> {

        const res = await this.courseRepository.getUserProfileCalender(query);

        const response: GenericResponse<any> = {
            success: true,
            message: res ? 'Training calender fetched Successfully' : 'Training calender not found',
            data: res,
        };

        return response;
    }



    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof CourseService
     */
    public async delete(_id: string): Promise<GenericResponse<null>> {

        if (!_id) {
            throw new Error("_id is null")
        }

        let courseData: any = await this.courseRepository.getCourseByID(_id)
        let promises = [
            this.TrainingRequestRepository.delete(courseData.request_id),
            this.courseRepository.delete(_id),
        ]

        if (!!courseData.programId && !!courseData.programId._id) {
            promises.push(this.TrainingRepository.removeCourseFromProgram(_id, courseData.programId._id))
        }
        let res: any[] = await Promise.all(promises)
        if (res[1].deletedCount > 0) {
            return {
                message: "Course deleted successfully",
                success: true,
                data: null,
            }
        }
        return {
            message: "Failed to delete course",
            success: true,
            data: null,
        }
    }

    public async checkUser(courseId: string, userId: string, typeId: string, type: string): Promise<GenericResponse<Course[]>> {
        let res = await this.courseRepository.checkUser(courseId, userId, typeId, type);
        return {
            message: "Courses Data fetched successfully",
            success: true,
            data: res,
        }
    }

    async GetAllAssessmentSurveyByUser(uid: any): Promise<GenericResponse<any>> {
        let res = await this.courseRepository.GetAllAssessmentSurveyByUser(uid)
        return {
            message: "Assessments and Survey fetched successfully",
            success: true,
            data: res
        }
    }
}
