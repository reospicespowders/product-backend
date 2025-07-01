import { UpdateWriteOpResult } from "mongoose";
import { MSCriteria, UpdateMSCriteria } from "../../dto/children/ms-criteria.dto";



export interface MSCriteriaRepository {
    create(questionBankDto: MSCriteria): Promise<MSCriteria>;

    findById(id: string): Promise<MSCriteria | null>;

    findAll(page: number, size: number, tags: string[]): Promise<MSCriteria[]>;

    update(id: string, questionBankDto: UpdateMSCriteria): Promise<UpdateWriteOpResult>;

    delete(id: string): Promise<UpdateWriteOpResult | null>;

    getByProject(id: string, page: number, size: number): Promise<MSCriteria[]>
}