import { IntersectionType } from "@nestjs/swagger";
import { ObjectId, Types } from "mongoose";


export class Course {
    title: string;
    description: string;
    type: string;
    image: string;
    start_date: string;
    end_date: string;
    session: Array<Types.ObjectId>
    active: boolean
    courseMaterial: Array<Object>
    status: string;
    attendees: Array<Types.ObjectId>;
    request_id: Types.ObjectId;
    certificate : object
    certifiedUsers : Array<Types.ObjectId>
    userRating : Array<UserRating>
    trainerRating : Array<TrainersRating>
    training_request: any;
    // certificate : Certificate
}

export class UpdateCourse extends IntersectionType(Course) {
    _id: Types.ObjectId;
}

export class CourseMaterialDto {
    title: string;
    courseId: string;
    url: string;
    remove:boolean
    order:number
}

export class Certificate {
    description : string
    sessions : [
        {
            visible : false
            id : Types.ObjectId
        }
    ]
}

export class UserRating {
    score : number
    _id : Types.ObjectId
    name : string
    email : string
}

export class TrainersRating {
    user_id : Types.ObjectId
    ratings : Array<UserRating>
}