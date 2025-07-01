import { SurveyResult, UpdateSurveyResultDto } from "../dto/survey-result.dto";



export interface SurveyResultRepository {
    getSurveyResults(id: string, page: number, size: number, courseId:string, ratingFor:string, ratingForID:string, external:string, searchText:string): Promise<SurveyResult[]>;
    generateResults(): Promise<SurveyResult[]>;
    getGraphData(id: string, courseId:string, ratingFor:string, ratingForID:string): Promise<SurveyResult[]>;
    generatePdf(idsArray: string[]): Promise<SurveyResult[]>;
    generateExcel(idsArray: string[],courseId:string, ratingFor:string, ratingForID:string): Promise<SurveyResult[]>;
    update(surveyResult: UpdateSurveyResultDto): Promise<SurveyResult[]>;
    findIdByEmail(surveyId:string, email:string): Promise<any>;
    getBulkResults(ids:string[]): Promise<any>;
    deleteByEmail(surveyId:string, email:string,ratingForID: string): Promise<any>;
    findTotalUsers(surveyId:string): Promise<SurveyResult[]>;
}