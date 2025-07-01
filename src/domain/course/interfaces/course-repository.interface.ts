import { UpdateWriteOpResult } from "mongoose";
import { Course, CourseMaterialDto } from "../dto/course.dto";
import { User } from "src/domain/user-auth/dto/user-type..dto";


/**
 *
 *
 * @export
 * @interface CourseRepository
 */
export interface CourseRepository {
    create(assessment: Course): Promise<Course>;
    getAll(page: number, size: number): Promise<Course[]>;
    getCourseByID(id: string): Promise<Course>;
    getCourseUserByID(id: string): Promise<Course>;
    update(assessment: any): Promise<UpdateWriteOpResult>;
    addNewBranchUser(course: any): Promise<UpdateWriteOpResult>
    delete(_id: string): Promise<any>;
    activateRequested(course: any): Promise<UpdateWriteOpResult>
    getSpecificCourse(id: string | any): Promise<Course[]>;
    getSpecificCourseById(id: string): Promise<Course[]>;
    getUserCourse(id: string): Promise<Course[]>;
    getStructuredCourseById(id: string): Promise<Course[]>;
    getStructuredCourseWithImpactById(id: string, trainer : string): Promise<Course[]>;
    getTrainingCompletedUsers(id: any)
    getCourseResults(id: string): Promise<any>;
    courseCertificate(data: any): Promise<any>;
    addSessionToCourse(courseId: string, sessionId: string, remove: boolean, type?: string): Promise<void>;
    addMaterialToCourse(material: CourseMaterialDto): Promise<void>
    updateMaterialOrder(material: CourseMaterialDto[], courseId: string): Promise<UpdateWriteOpResult>;
    getUserProfileCalender(query): Promise<any>
    checkUser(courseId: string, userId: string, typeId: string, type: string): Promise<Course[]>;
    GetAllAssessmentSurveyByUser(uid: string): Promise<any>;
    getSimpleCourse(_id: string): Promise<Course>;
    getCourseUsers(courseId: string): Promise<any[]>
    updateCourseUsers(courseId, users: string[]): Promise<UpdateWriteOpResult>;
    deleteByProgramId(programId):Promise<any>
}