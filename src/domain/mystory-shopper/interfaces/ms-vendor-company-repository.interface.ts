import { UpdateWriteOpResult } from "mongoose";
import { MSVendorCompanyDto, UpdateMSVendorCompanyDto  } from "../dto/ms-vendor-company.dto";



export interface MSVendorCompanyRepository {
    create(msVendorCompanyDto: MSVendorCompanyDto): Promise<MSVendorCompanyDto>;
    
    findById(id: string): Promise<MSVendorCompanyDto | null>;
    
    
    findByName(name: string): Promise<MSVendorCompanyDto | null>;
   
    findAll(): Promise<MSVendorCompanyDto[]>;
  
    update(id: string, msVendorCompanyDto: UpdateMSVendorCompanyDto): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
}