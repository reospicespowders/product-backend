import { UpdateWriteOpResult } from "mongoose";
import { MSEnquiry, UpdateMSEnquiry  } from "../../dto/children/ms-enquiries.dto";



export interface MSEnquiryRepository {
    getByProject(page: number, size: number, projectId: string): Promise<MSEnquiry[]>;
    
    create(questionBankDto: MSEnquiry): Promise<MSEnquiry>;
    
    findById(id: string): Promise<MSEnquiry | null>;
   
    findAll(page: number, size: number, tags: string[]): Promise<MSEnquiry[]>;
  
    update(id: string, questionBankDto: UpdateMSEnquiry): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
}