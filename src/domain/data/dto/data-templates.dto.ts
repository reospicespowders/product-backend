import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";

// #253 Service card Template


export class DataTemplate {
    name : string
    type : Types.ObjectId | string
    fields : Array<Types.ObjectId>
    standard : Boolean
    ou : Types.ObjectId
    active : Boolean
}


class DataTemplateWithId {
    _id : Types.ObjectId
}

export class UpdateDataTemplate extends IntersectionType(DataTemplate, DataTemplateWithId) {
}
