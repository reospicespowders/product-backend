import { UpdateWriteOpResult } from "mongoose";
import { MSSession, MSSessionVisitDate, UpdateMSSession  } from "../dto/ms-sessions.dto";



/**
 *Mystery Shopper Session Repository Interface
 *
 * @export
 * @interface MSSessionRepository
 */
export interface MSSessionRepository {
    getByProject(page: number, size: number, projectId: string): Promise<any>;
    create(questionBankDto: MSSession): Promise<MSSession>;
    
    findById(id: string): Promise<MSSession | null>;
   
    findAll(page: number, size: number, tags: string[]): Promise<MSSession[]>;

    getCalender(id : string): Promise<MSSession[]>;

    insertSession(id: string, questionBankDto: MSSessionVisitDate) : Promise<UpdateWriteOpResult>;
  
    update(id: string, questionBankDto: UpdateMSSession): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
    
    deleteVisit(sessionId: string, visitId: string): Promise<UpdateWriteOpResult | null>;

    getVisitDates(projectId:string):Promise<any>;
}