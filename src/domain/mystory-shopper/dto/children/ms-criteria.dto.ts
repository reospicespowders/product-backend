import { IntersectionType } from "@nestjs/swagger";


export class MSCriteria {
    projectId: string
    channel: string
    criteria: string
    approvalStatus: string
    comments: string
}

export class UpdateMSCriteria extends IntersectionType(MSCriteria) {
    _id: string;
}