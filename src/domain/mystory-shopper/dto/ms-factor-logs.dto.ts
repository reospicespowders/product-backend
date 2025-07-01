import { IntersectionType } from "@nestjs/swagger";
import { FactorStatus } from "../enums/approval-status.enum";


export class MSFactorLogs {
    userId: string
    comments: string
    status: FactorStatus
    oldStatus: FactorStatus
    factorId: string
}

export class UpdateMSFactorLogs extends IntersectionType(MSFactorLogs) {
    _id: string;
}