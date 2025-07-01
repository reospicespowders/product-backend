import mongoose from "mongoose";
import { IntersectionType } from "@nestjs/swagger";

export class MSVendorCompanyDto {
    name: string
    classification: 'internal' | 'external';
    vendors:string[];
}

export class UpdateMSVendorCompanyDto extends IntersectionType(MSVendorCompanyDto) {
    _id: string;
}