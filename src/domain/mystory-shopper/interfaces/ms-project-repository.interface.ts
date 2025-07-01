import { UpdateWriteOpResult } from "mongoose";
import { MSProject, UpdateMSProject  } from "../dto/ms-project.dto";



/**
 *Mystery Shopper Project Repository Interface
 *
 * @export
 * @interface MSProjectRepository
 */
export interface MSProjectRepository {
    create(questionBankDto: MSProject): Promise<MSProject>;
    
    findById(id: string): Promise<MSProject | null>;
   
    findAll(page: number, size: number, tags: string[]): Promise<MSProject[]>;
  
    update(id: string, questionBankDto: UpdateMSProject): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;

    getVendorProjects(vendorId:string,page: number, size: number):Promise<MSProject[]>;
}