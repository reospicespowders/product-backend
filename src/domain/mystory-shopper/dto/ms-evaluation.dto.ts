import { IntersectionType } from "@nestjs/swagger";


export class MSEvaluation {
    projectId:string
    factors: MSEvaluationFactor[]
    enquiries: MSEvaluationEnquiry[]
    vendorComments: string
    internalPMComments: string
    channel: string
    branch: string
    visitTime: string
}

export class MSEvaluationFactor {
    factorId: string
    grade: number
    percentage: number
    msComments: string
}

export class MSEvaluationEnquiry {
    enquiryId: string
    employeeAnswer: string
    msComments: string
}

export class UpdateMSEvaluation extends IntersectionType(MSEvaluation) {
    _id: string;
}