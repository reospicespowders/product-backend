import { UpdateWriteOpResult } from "mongoose";
import { Company, UpdateCompany } from "../dto/company.dto";



export interface CompanyRepository {
    create(assessment: Company): Promise<Company>;
    getAll(page:number,size:number): Promise<Company[]>;
    update(assessment: UpdateCompany): Promise<UpdateWriteOpResult>;
    delete(_id: string): Promise<any>;
    activateRequested(Company: any): Promise<UpdateWriteOpResult>
    // getSpecificCompany(id:string):Promise<Company[]>;  
    // getSpecificCompanyById(id:string):Promise<Company[]>;  
    getUserCompany(id:string):Promise<Company[]>; 
    insertTrainer(_id : string , userId : string)
}