import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";


export class DataDraft {
    user : Object
    object : Object
}

class DataDraftWithId {
    _id : Types.ObjectId
}

export class UpdateDataDraft extends IntersectionType(DataDraft, DataDraftWithId) {
}



