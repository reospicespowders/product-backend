import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";


export class FieldType {
    name : string
    arabic : string
    active : Boolean
}


class FieldTypeWithId {
    _id : Types.ObjectId
}

export class UpdateFieldType extends IntersectionType(FieldType, FieldTypeWithId) {
}



