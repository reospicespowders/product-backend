import { IntersectionType } from "@nestjs/swagger";


export class MSEnquiry {
    projectId: string
    factorId: string
    enquiry: string
    correctAnswer: string
    serviceUrl: string
    approvalStatus: string
    comments: string
}

export class UpdateMSEnquiry extends IntersectionType(MSEnquiry) {
    _id: string;
}