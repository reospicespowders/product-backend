
import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";




export class KLibraryLog {
    title : string
    data : string
    status : string
    reason : string
    createdBy :  Types.ObjectId
    approvedBy : Types.ObjectId
}

export class UpdateKLibraryLog extends IntersectionType(KLibraryLog) {
    _id: string;
}