import { UpdateWriteOpResult } from "mongoose";
import { MSFactorLogs, UpdateMSFactorLogs  } from "../dto/ms-factor-logs.dto";



/**
 *Mystery Shopper Factor Logs Repository Interface
 *
 * @export
 * @interface MSFactorLogsRepository
 */
export interface MSFactorLogsRepository {
    create(questionBankDto: MSFactorLogs): Promise<MSFactorLogs>;
    
    findById(id: string): Promise<MSFactorLogs | null>;
    
    getByFactor(id: string): Promise<MSFactorLogs[] | null>;
   
    findAll(page: number, size: number, tags: string[]): Promise<MSFactorLogs[]>;
  
    update(id: string, questionBankDto: UpdateMSFactorLogs): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
}