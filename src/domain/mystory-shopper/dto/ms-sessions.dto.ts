import mongoose from "mongoose";
import { IntersectionType } from "@nestjs/swagger";
import { ApprovalStatus } from "../enums/approval-status.enum";



export class MSSession {
    projectId: string
    startDate: string
    endDate: string
    name: string
    visits: MSSessionVisit
}

export class MSSessionVisit {
    data: MSSessionVisitDate[]
}

export class MSSessionVisitDate {
    channel: string
    branch?:string
    date: string
    status: string
    time : string
}

export class UpdateMSSession extends IntersectionType(MSSession) {
    _id: string;
}