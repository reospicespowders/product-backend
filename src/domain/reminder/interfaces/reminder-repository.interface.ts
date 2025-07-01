import { UpdateWriteOpResult } from "mongoose";
import { Reminder, UpdateReminderDto } from "../dto/reminder.dto";


export interface ReminderRepository {
    create(reminder: Reminder): Promise<Reminder>;
    findById(id: string): Promise<Reminder | null>;
}