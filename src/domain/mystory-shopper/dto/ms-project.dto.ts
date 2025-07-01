import { IntersectionType } from "@nestjs/swagger";
import { Schema } from 'mongoose';


export class MSProject {
    name: string
    description: string
    goal: string[]
    vendor: string[]
    startDate: string;
    endDate: string;
    internalPm: string
    responsibles: any[]
    factorCutOffPercentage: number
    vendorCompanyId: Schema.Types.ObjectId
    internalPMEmail: string
}

export class UpdateMSProject extends IntersectionType(MSProject) {
    _id: string;
}