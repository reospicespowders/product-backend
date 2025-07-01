import { AssessmentAttempt } from "../dto/assessment-attempt.dto";


export interface AssessmentAttemptRepository {
    checkIfAttempted(email: string, surveyId: string, isRedoAllow: boolean): Promise<boolean>;
    save(assessmentAttempt: AssessmentAttempt): Promise<AssessmentAttempt>;
    update(assessmentId: string,email: string,questions: any): Promise<any>;
    totalCount(): Promise<number>;
    getById(id: string, email: string): Promise<AssessmentAttempt>;
    getMultipleById(id: string, email: string): Promise<AssessmentAttempt>;
    generateNewAttempt(id: string): Promise<any[]>;
    allowRedoByEmailAndAssessmentId(assessmentId: string,email: string, isRedoAllow: boolean): Promise<any>;
    delete(attemptId): Promise<any>;
    deleteByEmail(assessmentId : string, email: string): Promise<any>;
}