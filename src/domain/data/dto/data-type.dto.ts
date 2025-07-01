import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";


export class DataType {
    name : string
    arabic : string
    icon : string
    active : Boolean
}


class DataTypeWithId {
    _id : Types.ObjectId
}

export class UpdateDataType extends IntersectionType(DataType, DataTypeWithId) {
}



