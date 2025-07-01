import { UpdateWriteOpResult } from "mongoose";
import { MSMeasuringType, UpdateMSMeasuringType  } from "../../dto/children/ms-measuring-types.dto";



export interface MSMeasuringTypeRepository {
    create(questionBankDto: MSMeasuringType): Promise<MSMeasuringType>;
    
    findById(id: string): Promise<MSMeasuringType | null>;
   
    findAll(page: number, size: number, tags: string[]): Promise<MSMeasuringType[]>;
  
    update(id: string, questionBankDto: UpdateMSMeasuringType): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
}