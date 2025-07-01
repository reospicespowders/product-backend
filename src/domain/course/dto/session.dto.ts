import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";
import { SessionContentType } from "../enums/session-type.enum";


export class Session {
    title: string;
    type: string;
    trainer: Object;
    address: Object;
    date: string;
    start_time: string;
    end_time: string;
    active: boolean;
    attendance: Array<string>;
    seenby: Array<string>;
    attendanceProof: Object;
    history: string;
    status: string;
    sessionType: SessionContentType;
    locationLink:string;
    video_mode:string;
    order:number;
    courseId:string;
}

export class UpdateSession extends IntersectionType(Session) {
    _id: Types.ObjectId;
}