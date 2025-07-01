import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";


export class States {
    user: User
    service_id: Types.ObjectId
    keyword?: string
    category_id: number
}

class StatesWithId {
    _id: Types.ObjectId
}

class User {
    _id: Types.ObjectId
    name: String
}


export class UpdateStates extends IntersectionType(States, StatesWithId) {
}



