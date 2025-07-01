import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";


export class ContentUpdate {
    
    status : string
    type : string
    data_type : Types.ObjectId
    before : any
    after : any
    adminChange : any
    service_id : Types.ObjectId
    ous : Types.ObjectId
    updated_by : Types.ObjectId
    approved_by : Types.ObjectId
    reject_reason : string
   reason: string
}


class ContentUpdateWithId {
    _id : Types.ObjectId
}

export class UpdateContentUpdate extends IntersectionType(ContentUpdate, ContentUpdateWithId) {
}



