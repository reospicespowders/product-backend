import { AssessmentSurveyCache } from "../entities/assessment-survey-cache.entity";

export interface CacheRepository {
    save(data: AssessmentSurveyCache): Promise<AssessmentSurveyCache>;
    getCache(surveyId: string, email: string): Promise<AssessmentSurveyCache>;
    getCacheCount(_id:string): Promise<any>;
    getExcelData(_id:string): Promise<any>;
    delete(surveyId: string, email: string): Promise<any>;
}