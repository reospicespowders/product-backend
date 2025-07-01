import { IntersectionType } from "@nestjs/swagger";
import { FactorStatus } from "../../enums/approval-status.enum";


export class MSFactor {
    projectId: string
    subCriteriaId: string
    factor: string
    measuringType: string
    approvalStatus: string
    reason: string
    comments: string
    status: FactorStatus
    repeat:number

}

export class UpdateMSFactor extends IntersectionType(MSFactor) {
    _id: string;
}