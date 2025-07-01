// src/domain/training/dto/training-request.dto.ts

import { IntersectionType } from "@nestjs/swagger";
import mongoose from "mongoose";


export class TrainingRequest {
    topic: string
    trainingId?: mongoose.Types.ObjectId
    type: string
    createdType?: string
    ou: string
    date?: Object
    description: string
    status: string
    reason?: string
    active: boolean
    ous: Array<mongoose.Types.ObjectId>
    registrationType: string
    completedAttendees: Array<mongoose.Types.ObjectId>
    pendingAttendees: Array<mongoose.Types.ObjectId>
    attendeesRequests : Array<mongoose.Types.ObjectId>
    lastSessionPending: Array<mongoose.Types.ObjectId>
    recreatedFrom: mongoose.Types.ObjectId
    recreationCount: number
    creator: string
    startDate: any;
    endDate: any;
    trainer: any;
    master_trainer : mongoose.Types.ObjectId;
    unregisteredUsers : Array<String>
    ratingSettings:object
    impactSettings:object
    newInviation?:object
}

class TrainingRequestWithId {
    _id: mongoose.Schema.Types.ObjectId
}

export class UpdateTrainingRequest extends IntersectionType(TrainingRequest, TrainingRequestWithId) {
}



