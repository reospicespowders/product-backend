import { IntersectionType } from "@nestjs/swagger";


export class MSSubCriteria {
    projectId: string
    criteriaId: string
    criteria: string
    approvalStatus: string
    comments: string
}

export class UpdateMSSubCriteria extends IntersectionType(MSSubCriteria) {
    _id: string;
}