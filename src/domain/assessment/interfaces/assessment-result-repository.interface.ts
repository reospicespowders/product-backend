import { AssessmentResult, UpdateAssessmentResultDto } from "../dto/assessment-result.dto";
import { GenericResponse } from 'src/domain/dto/generic';



export interface AssessmentResultRepository {
    regenerateResults(id: string): Promise<any>;
    generateExcel(idsArray: string[]): Promise<AssessmentResult[]>;
    generateBulkUserExcel(idsArray: string[]): Promise<AssessmentResult[]>;
    generatePdf(idsArray: string[]): Promise<AssessmentResult[]>;
    generateBulkExcel(idsArray: string[]): Promise<AssessmentResult[]>;
    getAssessmentResults(id: string, page: number, size: number, external:string, searchText:string): Promise<AssessmentResult[]>;
    getAssessmentResultsByEmail(id: string, email:string): Promise<AssessmentResult[]>;
    generateResults(): Promise<AssessmentResult[]>;
    getGraphData(id: string): Promise<AssessmentResult[]>;
    update(assessmentResult: UpdateAssessmentResultDto): Promise<AssessmentResult[]>;
    findIdByEmail(assessmentId:string, email:string): Promise<any>;
    getBulkResults(ids:string[],page,size,filtering?: string): Promise<any>;
    getBulkGraph(ids:string[]): Promise<any>;
    delete(assessmentId:string, email:string): Promise<any>;
    findByAssessmentId(assessmentId:string): Promise<any>;
}