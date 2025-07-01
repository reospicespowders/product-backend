import { Model } from "mongoose";
import { Reminder, UpdateReminderDto } from "../dto/reminder.dto";
import { ReminderRepository } from "../interfaces/reminder-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ReminderRepositoryImpl implements ReminderRepository {

    constructor(
        @InjectModel('reminder') private readonly reminderModel: Model<Reminder>,
    ) { }

    create(reminder: UpdateReminderDto): Promise<Reminder> {
        const { surveyId, assessmentId, trainingId, _id } = reminder;

        return this.reminderModel.findOneAndUpdate(
            {
                $or: [{ surveyId }, { assessmentId }, { trainingId }, { _id }]
            },
            { $set: reminder },
            { new: true, upsert: true }
        ).exec();
    }

    findById(id: string): Promise<Reminder | null> {
        return this.reminderModel.findOne({ $or: [{ surveyId: id }, { assessmentId: id }, { trainingId: id }] })
    }

}