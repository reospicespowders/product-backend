import { SurveyAttempt, UpdateSurveyAttempt } from "../dto/survey-attempt.dto";


export interface SurveyAttemptRepository {
    checkIfAttempted(email: string, surveyId: string, isRedoAllow: boolean): Promise<boolean>;
    checkIfRated(email: string, surveyId: string, ratingForID: string): Promise<boolean>;
    save(surveyAttempt: SurveyAttempt): Promise<SurveyAttempt>;
    totalCount(): Promise<number>;
    getById(id: string, email: string): Promise<SurveyAttempt>;
    getMultipleById(id: string, email: string): Promise<SurveyAttempt>;
    generateNewAttempt(id: string): Promise<any[]>;
    updateAttempt(data: any): Promise<UpdateSurveyAttempt>;
    getAvgRating(data: any): Promise<any>;
    deleteByEmail(surveyId:string, email:string,ratingForID: string): Promise<any>;
    allowRedoByEmailAndAssessmentId(assessmentId: string,email: string, isRedoAllow: boolean): Promise<any>;
}