import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";


export class Data {
    id : number
    name : string
    type :Types.ObjectId
    fields : Array<fields>
    parent : Types.ObjectId
    ous : Types.ObjectId
    active : Boolean
    tempInactive: Boolean
    signed : signature
}

export class fields {
    label : string
    type : Types.ObjectId
    data :  string
    item_Id ?: Types.ObjectId
    item_Field ?: string
}

export class signature {
    user_id : Types.ObjectId
    status : Boolean
    user_name : string
    date :  string
}

class DataWithId {
    _id : Types.ObjectId
}

export class UpdateData extends IntersectionType(Data, DataWithId) {
}



