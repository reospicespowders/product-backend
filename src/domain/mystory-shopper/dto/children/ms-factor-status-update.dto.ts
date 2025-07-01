import { FactorStatus } from "../../enums/approval-status.enum";



export class MSFactorStatusUpdateDto {
    factorId?:string;
    channelId?:string;
    branchId?:string;
    status?:FactorStatus;
    comments?:string;
    repeat?:number
    approvalStatus:string
}