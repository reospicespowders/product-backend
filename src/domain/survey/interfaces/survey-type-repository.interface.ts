import { UpdateWriteOpResult } from "mongoose";
import { SurveyTag, SurveyType, UpdateSurveyTagDto, UpdateSurveyTypeDto } from "../dto/survey-type.dto";



/**
 *Survey Type repository registerable interface
 *
 * @export
 * @interface SurveyTypeRepository
 */
export interface SurveyTypeRepository {
    create(survey: SurveyType, uid: string): Promise<SurveyType>;
    update(survey: UpdateSurveyTypeDto): Promise<UpdateWriteOpResult>;
    delete(_id: string): Promise<any>;
    getAllTagged(tags: string[]): Promise<SurveyType[]>;
    getAll(): Promise<SurveyType[]>;
    getAllCategorized(tags: string[]): Promise<any>;
    getById(_id: string): Promise<SurveyType>;
    getSurveyTags(type: string): Promise<SurveyTag[]>;
    updateSurveyTag(updateTagDto: UpdateSurveyTagDto): Promise<UpdateWriteOpResult>;
    createSurveyTag(tag: SurveyTag): Promise<SurveyTag>
    deleteSurveyTag(id: string): Promise<any>;
}