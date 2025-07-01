import { UpdateWriteOpResult } from "mongoose";
import { Survey, UpdateSurveyDto } from "../dto/survey.dto";



/**
 *Survey repository registerable interface
 *
 * @export
 * @interface SurveyRepository
 */
export interface SurveyRepository {
    getAllTagsFiltered(tags: string[],trainingTypeId:string): Promise<Survey[]>;
    incrementAttempt(_id: string): Promise<UpdateWriteOpResult>;
    create(survey: Survey,uid:string): Promise<Survey>;
    update(survey: UpdateSurveyDto): Promise<UpdateWriteOpResult>;
    delete(_id: string): Promise<any>;
    getAll(): Promise<Survey[]>;
    findById(id: string): Promise<Survey>;
    bulkDelete(ids: string[]): Promise<any>;
    deleteByType(type: string): Promise<any>;

    getUnAttempted(uid: string, email: string): Promise<Survey[]>;
    getAllAttempted(uid: string, email: string): Promise<Survey[]>;
}