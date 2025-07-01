import { FactorStatus } from "../../enums/approval-status.enum";


export class MSFactorResponsible {
    projectId: string;
    channelId: string;
    branchId: string;
    factorId: string;
    responsible: string;
    rsComments: string;
    status:FactorStatus;
    repeat:number;
    approvalStatus:string;
    approvalComments:string;
}