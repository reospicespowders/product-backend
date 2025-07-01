import { UpdateWriteOpResult } from "mongoose";
import { Assessment, UpdateAssessmentDto } from "../dto/assessment.dto";



export interface AssessmentRepository {
    create(assessment: Assessment,uid:string): Promise<Assessment>;
    getAll(page: number, size: number, tags: string[],trainingTypeId:string): Promise<Assessment[]>;
    update(assessment: UpdateAssessmentDto): Promise<UpdateWriteOpResult>;
    delete(_id: string): Promise<any>;
    findById(id: string): Promise<any>;
    incrementAttempt(_id: string): Promise<UpdateWriteOpResult>;
    bulkDelete(ids: string[]): Promise<any>;

    getUnAttempted(uid: string, email: string): Promise<Assessment[]>;
    getAllAttempted(uid: string, email: string): Promise<Assessment[]>;
    getCertificateData(postData:any): Promise<Assessment[]>;
    getAssessmentResults(id: string, page: number, size: number): Promise<Assessment[]>;
}