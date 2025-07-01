import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";

export class Announcement {
    name: string;
    description: string;
    image?: string;
    ous?: string[];
    targetUsers?: string[];
    active: boolean;
    seenBy: seenBy[];
    startDate: string;
    endDate: string;
    createdBy:string;
    assessmentId?: Types.ObjectId
    questionBankId?: Types.ObjectId
    ignoredBy?: Types.ObjectId[]
    ignoreLimit: number
}

export class seenBy {
    user: Types.ObjectId;
    seenAt: string;
}

export class UpdateAnnouncement extends IntersectionType(Announcement) {
    _id: string;
}