import { UpdateWriteOpResult } from "mongoose";
import { MSSubCriteria, UpdateMSSubCriteria  } from "../../dto/children/ms-sub-criteria.dto";



export interface MSSubCriteriaRepository {
    create(questionBankDto: MSSubCriteria): Promise<MSSubCriteria>;
    
    findById(id: string): Promise<MSSubCriteria | null>;
   
    findAll(page: number, size: number, tags: string[]): Promise<MSSubCriteria[]>;
  
    update(id: string, questionBankDto: UpdateMSSubCriteria): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
}