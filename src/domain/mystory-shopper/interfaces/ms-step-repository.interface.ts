import { UpdateWriteOpResult } from "mongoose";
import { MSStep, UpdateMSStep  } from "../dto/ms-step.dto";



/**
 *Mystery Shopper Step Repository Interface
 *
 * @export
 * @interface MSStepRepository
 */
export interface MSStepRepository {
    create(msStepDto: MSStep): Promise<MSStep>;
    
    findById(id: string): Promise<MSStep | null>;

    getByProject(id: string,type: string, vendorType:string): Promise<MSStep | null>;
    
    getByProjectSession(id: string,sessionId: string,type: string, vendorType:string): Promise<MSStep | null>;
    
    getAllByProject(id: string): Promise<MSStep[] | null>;
   
    findAll(page: number, size: number, tags: string[]): Promise<MSStep[]>;
  
    update(id: string, msStepDto: UpdateMSStep): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
}