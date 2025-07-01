import { UpdateWriteOpResult } from "mongoose";
import { MSEvaluation, UpdateMSEvaluation } from "../dto/ms-evaluation.dto";



/**
 *Mystery Shopper Evaluation Repository Interface
 *
 * @export
 * @interface MSEvaluationRepository
 */
export interface MSEvaluationRepository {
    create(questionBankDto: MSEvaluation): Promise<MSEvaluation>;

    findById(id: string): Promise<MSEvaluation | null>;

    findAll(page: number, size: number, tags: string[]): Promise<MSEvaluation[]>;

    update(id: string, questionBankDto: UpdateMSEvaluation): Promise<UpdateWriteOpResult>;

    delete(id: string): Promise<UpdateWriteOpResult | null>;

    getByProject(projectId: string): Promise<MSEvaluation[]>;

    getFactorView(projectId: string, uid: string): Promise<any[]>;
}