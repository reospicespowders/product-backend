import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";

export class SignHistory {
    data_id : Types.ObjectId
    history : Array<any>
}


class SignHistoryId {
    _id : Types.ObjectId
}

export class UpdateSignHistory extends IntersectionType(SignHistory, SignHistoryId) {
}
