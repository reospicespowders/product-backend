import { IntersectionType } from "@nestjs/swagger";


export class MSChannel {
    name: string;
    projectId:string;
    branchId:string;
    visitCount: number;
    weight: number;
    type : string
}

export class UpdateMSChannel extends IntersectionType(MSChannel) {
    _id: string;
}