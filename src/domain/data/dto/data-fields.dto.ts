import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";


export class DataField {
    name : string
    priority : number
    type : Types.ObjectId
    icon : string
    active : Boolean
}


class DataFieldWithId {
    _id : Types.ObjectId
}

export class UpdateDataField extends IntersectionType(DataField, DataFieldWithId) {
}



