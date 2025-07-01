import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";


export class Program {
    trainer: object;
    is_online: string;
    video_url: string;
    zoom_url: string;
    address: object;
    seen : boolean
}

export class UpdateProgram extends IntersectionType(Program) {
    _id: Types.ObjectId;
}