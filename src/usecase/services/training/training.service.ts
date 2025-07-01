import { Inject, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { Course } from 'src/domain/course/dto/course.dto';
import { SessionRepository } from 'src/domain/course/interfaces/session-repository.interface';
import { CourseRepository } from 'src/domain/course/interfaces/course-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { TrainingProgram, UpdateTrainingProgram } from 'src/domain/training/dto/training.dto';
import { TrainingRepository } from 'src/domain/training/interfaces/training-repository.interface';
import { AuthRepository } from 'src/domain/user-auth/interfaces/auth-repository.interface';
import { SessionService } from '../course/session.service';
import { TrainingRequestService } from './training-request.service';
import { TrainingRequestRepository } from 'src/domain/training/interfaces/training-request-repository.interface';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TrainingProggramService {

    constructor(
        @Inject('TrainingRepository') private TrainingRepository: TrainingRepository,
        @Inject('AuthRepository') private userRepository: AuthRepository,
        @Inject('CourseRepository') private courseRepository: CourseRepository,
        @Inject('TrainingRequestRepository') private TrainingRequestRepository: TrainingRequestRepository,
        private sessionService: SessionService,
        private trainingRequestSerivce: TrainingRequestService,
        private mailService: MailService
    ) { }

    /**
     *
     *
     * @param {*} page
     * @param {*} size
     * @return {*}  {Promise<GenericResponse<any[]>>}
     * @memberof TrainingProggramService
     */
    public async getAll(page: number, size: number): Promise<GenericResponse<any[]>> {
        const res = await this.TrainingRepository.getAll(page, size);
        const response: GenericResponse<any> = {
            success: true,
            message: 'TrainingProgram fetched Successfully',
            data: res,
        };
        return response;
    }

    /**
     *
     *
     * @param {*} page
     * @param {*} size
     * @return {*}  {Promise<GenericResponse<any[]>>}
     * @memberof TrainingProggramService
     */
    public async getAggregatedTrainingPrograms(query: any, page: number, size: number): Promise<GenericResponse<any[]>> {
        const res = await this.TrainingRepository.getAggregatedTrainingPrograms(query, page, size);
        const response: GenericResponse<any> = {
            success: true,
            message: 'TrainingProgram fetched Successfully',
            data: { data: res, totalDocuments: 0 },
        };
        return response;
    }


    /**
     *
     *
     * @param {*} data
     * @return {*}  {Promise<GenericResponse<TrainingProgram>>}
     * @memberof TrainingProggramService
     */
    public async create(data: UpdateTrainingProgram, uid: string): Promise<GenericResponse<string>> {
        const newCourseArr: any[] = [];
        const removedArr: any[] = [];
        let processCourses: any[] = [];
        let isUpdate: boolean = false;

        if (!!data._id) {
            isUpdate = true;
            let old2: any = await this.TrainingRepository.getOne(data._id);
            let old: any = JSON.parse(JSON.stringify(old2))
            let oldCourses: any = await this.trainingRequestSerivce.getAllByCoursesAndCourses(old.courses.map(e => e._id))
            if (!!old) {
                old.courses = oldCourses
                // Create a Map for oldArr for faster lookups based on _id
                const oldMap = new Map(old.courses.map(course => [course.trainingId._id.toString(), course]));

                // Add new entries from newArr to newCourseArr and oldArr if not present in oldArr
                data.courses.forEach(course => {
                    if (!oldMap.has(course.trainingId._id.toString())) {
                        newCourseArr.push(course.trainingId);
                        old.courses.push(course);  // Add the new entry to oldArr
                    }
                });
                // Determine removed entries and update oldArr
                old.courses = old.courses.filter(course => {
                    const isPresentInNewArr = data.courses.some(newCourse => newCourse.trainingId._id.toString() === course.trainingId._id.toString());
                    if (!isPresentInNewArr) {
                        removedArr.push(course.trainingId);  // Add removed course to removedArr
                    }
                    return isPresentInNewArr;
                });

                processCourses = old.courses;
            }
        } else {
            processCourses = data.courses;
        }

        //Fetching user of all assigned ous
        const attendees = (await this.userRepository.getByOusAll(data.ous.map(e => new mongoose.Types.ObjectId(e)))).map(e => e._id.toString());
        data.attendees = Array.from(new Set(attendees));
        let coursesBatch: any[] = []

        let trainingProgramCourses: any[] = [];
        let recreateResponseData: { createdCourse: any, updatedTrainingRequest: any }[] = [];

        // console.log('Recreation logics execution')
        //Processing each course one by one
        for (let course of JSON.parse(JSON.stringify(processCourses))) {
            let courseCompletedUsers: string[] = (await this.courseRepository.getTrainingCompletedUsers(course.trainingId._id)).map((e: any) => e._id.toString());
            // console.log('COMPLETED USERS', courseCompletedUsers);
            // if recreate is requried
            if (course.hasOwnProperty('recreationData') && !!course.recreationData) {
                course.ous = data.ous;

                //Recreating the course with all logics and extracting the updated course and request
                trainingProgramCourses.push(course.trainingId._id);
                const recreateResponse = await this.recreateCourse(course, data.attendees, uid, courseCompletedUsers, course.conditions, data.ous)
                trainingProgramCourses.push(recreateResponse.createdCourse._id)
                recreateResponseData.push(recreateResponse)
            } else {
                if (isUpdate && course.status == 'TRAINING_CREATED') {
                    course.trainingId.attendees = data.attendees;
                    course.ous = data.ous;
                } else {
                    let unattemptedUsers = data.attendees.filter(e => !courseCompletedUsers.includes(e))
                    //If course already have attendees append with new attendees
                    if (!!course.trainingId.attendees && Array.isArray(course.trainingId.attendees)) {
                        course.trainingId.attendees = new Set([...course.trainingId.attendees, ...unattemptedUsers]);
                    } else {
                        course.trainingId.attendees = unattemptedUsers;
                    }

                    if (!!course.ous && Array.isArray(course.ous)) {
                        course.ous = Array.from(new Set([...course.ous, ...data.ous]));

                    } else {
                        course.ous = data.ous;
                    }
                }

                // console.log("course ous", course.ous)

                //Update each course with new attendees
                trainingProgramCourses.push(course.trainingId._id)

                await this.TrainingRequestRepository.updateField({ _id: course._id, ous: course.ous })

                coursesBatch.push(this.courseRepository.update({ _id: course.trainingId._id, attendees: Array.from(new Set(course.trainingId.attendees)) }))
            }
        }

        let res: any;
        if (!!data._id) {
            data.courses = Array.from(new Set([...processCourses.map(e => e.trainingId._id), ...trainingProgramCourses]));
            res = await this.TrainingRepository.update(data);
        } else {
            //Creating the program with created courses
            data.courses = trainingProgramCourses;
            res = await this.TrainingRepository.create(data)
        }
        // console.log('Proccessing Training Requests')
        //Updating the training request and adding program id in it
        let batch: any[] = [];
        if (recreateResponseData.length > 0) {
            for (let recreateResponse of recreateResponseData) {
                recreateResponse.updatedTrainingRequest.programId = res._id;

                //Creating relation of parent request with this program 
                batch.push(this.TrainingRequestRepository.updateField({ _id: recreateResponse.updatedTrainingRequest.parentId, programId: res._id }))
                batch.push(this.trainingRequestSerivce.update(recreateResponse.updatedTrainingRequest.data, uid));
            }
        }

        if (isUpdate) {
            //adding program Id and its name to course object
            if (newCourseArr && newCourseArr.length > 0) {
                for (let course of newCourseArr) {
                    let update = {
                        _id: course._id,
                        programId: { _id: res._id, title: res.title }
                    }

                    //creating relation of created course with this program
                    if (!!course.parentId) {
                        let parentUpdated = {
                            _id: course.parentId,
                            programId: { _id: res._id, title: res.title }
                        }
                        batch.push(this.courseRepository.update(parentUpdated));
                    }
                    batch.push(this.courseRepository.update(update));
                }
            }
        } else {
            //adding program Id and its name to course object
            for (let recreateResponse of recreateResponseData) {
                let update = {
                    _id: recreateResponse.createdCourse._id,
                    programId: { _id: res._id, title: res.title }
                }

                //creating parent course relation with this program
                let parentUpdate = {
                    _id: recreateResponse.createdCourse.parentId,
                    programId: { _id: res._id, title: res.title }
                }
                batch.push(this.courseRepository.update(parentUpdate))
                batch.push(this.courseRepository.update(update));
            }

            for (let trainingRequests of processCourses.filter(e => !e.hasOwnProperty('recreationData') || e.recreationData == null || e.recreationData == undefined)) {
                let update = {
                    _id: trainingRequests.trainingId._id,
                    programId: { _id: res._id, title: res.title }
                }
                batch.push(this.courseRepository.update(update));
            }

        }

        // console.log('removing course arr', removedArr)
        //removing relation from course on removing from program
        if (removedArr && removedArr.length > 0) {
            for (let course of removedArr) {
                let update = {
                    _id: course._id,
                    programId: null
                }

                //removing parent course relation with this program
                if (course.parentId) {
                    let parentUpdate = {
                        _id: course.parentId,
                        programId: null
                    }
                    batch.push(this.courseRepository.update(parentUpdate));
                }

                batch.push(this.courseRepository.update(update));
            }
        }

        // console.log('processing all batch')
        //Batch processing all trainingReuest and course DB operations
        await Promise.all([...batch, ...coursesBatch]);

        data.courses = processCourses;
        this.mailService.sendProgramMail(data);

        const response: GenericResponse<string> = {
            success: true,
            message: 'TrainingProgram added Successfully',
            data: res._id,
        };
        return response;
    }


    /**
     *
     *
     * @param {UpdateTrainingProgram} data
     * @return {*}  {Promise<GenericResponse<TrainingProgram>>}
     * @memberof TrainingProggramService
     */
    public async update(data: UpdateTrainingProgram, uid: string): Promise<GenericResponse<TrainingProgram>> {
        if (data.status == "PUBLISHED") {
            let requests = await this.trainingRequestSerivce.getAllbyCourses(data.courses);
            await this.synchronizeOUUsers(data._id);
            let batch: any[] = []
            if (requests.length > 0) {
                requests = requests.map((e: any) => {
                    e.status = "PUBLISHED";
                    e.active = true;
                    batch.push(this.trainingRequestSerivce.update(e, uid));
                    batch.push(this.courseRepository.update({ _id: e.trainingId, active: true }))
                    return e;
                })
                if (batch.length > 0) {
                    await Promise.all(batch);
                }
            }
        }




        const res = await this.TrainingRepository.update(data);

        const response: GenericResponse<TrainingProgram> = {
            success: true,
            message: 'TrainingProgram updated Successfully',
            data: res,
        };
        return response;
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof TrainingProggramService
     */
    public async delete(_id: string): Promise<GenericResponse<any>> {
        const program: UpdateTrainingProgram = await this.getProgramById(_id);

        //Deleting Program
        await this.TrainingRepository.delete(_id);

        let batch = []

        //Deleting courses
        batch.push(this.courseRepository.deleteByProgramId(_id))

        //Deleting training requests
        batch.push(this.TrainingRequestRepository.deleteAll(program.courses))

        Promise.all(batch);

        const response: GenericResponse<any> = {
            success: true,
            message: 'TrainingProgram deleted Successfully',
            data: null,
        };
        return response;
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<TrainingProgram>>}
     * @memberof TrainingProggramService
     */
    public async getOne(_id: string): Promise<GenericResponse<TrainingProgram>> {
        const res = await this.TrainingRepository.getOne(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res ? 'TrainingProgram fetched Successfully' : 'TrainingProgram not found',
            data: res,
        };

        return response;
    }

    public async getTrainingProgramAttendees(_id: string): Promise<GenericResponse<any>> {
        const res = await this.TrainingRepository.getTrainingProgramAttendees(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res ? 'TrainingProgram users fetched Successfully' : 'TrainingProgram users not found',
            data: res,
        };

        return response;
    }

    public async synchronizeOUUsers(programId: string): Promise<GenericResponse<any>> {
        const program: any = await this.getProgramById(programId);
        if (!program) {
            return {
                success: false,
                message: 'TrainingProgram not found',
                data: null,
            };
        }

        const attendeesWithDuplication = (await this.userRepository.getByOusAll(program.ous.map(e => new mongoose.Types.ObjectId(e)))).map(e => e._id.toString());


        return this.addProgramUsers(programId, attendeesWithDuplication)
    }


    public async addProgramUsers(programId: string, users: string[]) {
        try {
            const program: UpdateTrainingProgram = await this.getProgramById(programId);
            if (!program) {
                return {
                    success: false,
                    message: 'TrainingProgram not found',
                    data: null,
                };
            }

            const cleanAttendees = program.attendees.filter(e => e != null && !!e).map(e => e.toString());

            const attendees = Array.from(new Set([...cleanAttendees, ...users.filter(e => !!e)]));
            program.attendees = attendees;
            await this.TrainingRepository.update(program);

            let batch = []

            for (let course of program.courses) {
                let courseUsers = (await this.courseRepository.getCourseUsers(course)).map(e => e.attendees.map(a => a._id.toString())).flat(Infinity)
                batch.push(this.courseRepository.updateCourseUsers(course, Array.from(new Set([...courseUsers, ...attendees]))))
            }

            await Promise.all(batch);

            return {
                success: true,
                message: 'Users synchronized successfully',
                data: null,
            };
        } catch (e) {
            return {
                success: false,
                message: 'Failed to add users',
                data: e,
            };
        }
    }

    private async getProgramById(programId): Promise<UpdateTrainingProgram> {
        return await this.TrainingRepository.getOneSimple(programId);
    }


    public async recreateCourse(request: any, attendees: string[], uid: string, courseCompletedUsers: string[], conditions: any, ous: any): Promise<any> {
        /** 
         * move those attendees who have completed the course to [training request completedAttendees]
         * add the new attendees in course
         * move the attendees who have not completed the course to new course if the end date of old course id passed
         * create a copy of course with new dates and also create bi-directional relation between courses
         * return the data of new created course in response of API
         * 
        */

        let course = request.trainingId;

        //Getting users who have already completed this course

        // move those attendees who have completed the course to [training request completedAttendees]
        request.completedAttendees = courseCompletedUsers;
        request.parentId = request._id;
        // course.attendees     //This is partianl

        if (!!conditions.newOnes) {
            course.attendees = attendees;
        } else {
            //Filtering out users already completed course
            let oldAttendees: string[] = [...course.attendees].filter(e => !courseCompletedUsers.includes(e));

            //Filtering out users already completed course
            let finalAttendees: string[] = attendees.filter(e => !courseCompletedUsers.includes(e))

            if (this.datePassed(new Date(course.end_date))) {
                finalAttendees.push(...oldAttendees)
            }

            if (!(this.checkContinue(new Date(course.start_date), new Date(course.end_date)) && !!course.attendees && !!conditions.newOnly)) {
                course.attendees = finalAttendees;
            }
        }

        //Extracting recreation dates data
        let recreationData = JSON.parse(JSON.stringify(request.recreationData));

        //Cleaning course and training request data to recreate new
        course.start_date = recreationData.start_date;
        course.end_date = recreationData.end_date;



        request.start_date = recreationData.start_date;
        request.end_date = recreationData.end_date;

        //Creating sessions copy for future use
        let oldSessions = [...course.sessions]

        course.sessions = [];

        //Relation with course which is being recreated
        course.parentId = course._id;

        //Removing unnecessary data
        delete course._id
        delete course.__v
        delete course.session
        delete course.createdAt
        delete course.updatedAt
        course.active = false;

        course.title = recreationData.title
        course.description = recreationData.description



        delete request.createdAt
        delete request.updatedAt
        delete request._id
        delete request.__v
        delete request.createdAtDate
        delete request.recreationData;
        delete request.trainingId
        request.active = false;
        request.title = recreationData.title
        request.description = recreationData.description

        request.status = "TRAINING_CREATED";

        if (!!request.ous && Array.isArray(request.ous)) {
            request.ous = Array.from(new Set([...request.ous, ...ous]));

        } else {
            request.ous = ous;
        }


        //Creating new training request
        let createdTrainingRequest: any = await this.trainingRequestSerivce.create(request, uid);

        //Recreating the course with new request ID
        course.request_id = createdTrainingRequest.data._id

        if (this.checkContinue(new Date(course.start_date), new Date(course.end_date)) && !!course.attendees && !!conditions.newOnly) {
            course.attendees = attendees.filter(e => !course.attendees.includes(e));
        }

        let createdCourse: any = await this.courseRepository.create(course);



        //Adding all chilren courses ids in parent course to maintain relation in DB
        let childrenProgram: any[] = []
        if (!!course.childrenProgram && Array.isArray(course.childrenProgram)) {
            childrenProgram = course.childrenProgram;
        }

        childrenProgram.push(createdCourse._id)

        this.courseRepository.update({ _id: course._id, childrenProgram })

        //Updating the training request and adding the created course ID
        createdTrainingRequest.data.trainingId = createdCourse._id;
        let updatedTrainingRequest = await this.trainingRequestSerivce.update(createdTrainingRequest.data, uid)

        //Updating the dates and creating new sessions
        let batch: Promise<any>[] = [];
        for (let session of oldSessions) {
            //Getting updated dates session object from recreation dates data
            let updated = recreationData.sessions.find((e: any) => e._id == session._id);
            if (!!updated) {
                session = { ...session, ...updated }
            }
            session.seenby = []
            session.attendees = []
            session.attendance = []
            session.parentId = session._id;
            delete session._id;
            await this.sessionService.create(session, createdCourse._id, uid);
        }

        //Processing all batch session create operations
        if (batch.length > 0) {
            await Promise.all(batch)
        }

        //Returning the new created course and training request for further processing
        return { createdCourse, updatedTrainingRequest };
    }

    private datePassed(date: Date): boolean {
        let today = new Date();

        today.setHours(0)
        today.setMinutes(0)
        today.setMilliseconds(0)

        return date.getTime() < today.getTime()
    }

    private checkContinue(start: Date, end: Date): boolean {
        let today = new Date();

        today.setHours(0)
        today.setMinutes(0)
        today.setMilliseconds(0)

        return start.getTime() < today.getTime() && end.getTime() > today.getTime();
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
    public async getMergedTrainingProgramAndCourses(page, offset, filter): Promise<GenericResponse<any>> {
        const res: any = await this.TrainingRepository.getMergedTrainingProgramAndCourses(page, offset, filter);

        const response: GenericResponse<any[]> = {
            success: true,
            message: 'Merged Course & Training Program fetched Successfully',
            data: res,
        };
        return response;
    }

}