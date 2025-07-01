import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";


export class Company {
   name : string
   locations : string
   website : string
   coordinator : Types.ObjectId
   attachments : Array<Object>
   trainers : Array <Types.ObjectId>
   active : boolean
   allowed_trainings : Array<Types.ObjectId>
}

export class UpdateCompany extends IntersectionType(Company) {
    _id:Types.ObjectId;
}