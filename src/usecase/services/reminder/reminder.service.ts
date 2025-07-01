import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { Reminder } from 'src/domain/reminder/dto/reminder.dto';
import { ReminderRepository } from 'src/domain/reminder/interfaces/reminder-repository.interface';

@Injectable()
export class ReminderService {

    constructor(
        @Inject('ReminderRepository') private reminderRepo: ReminderRepository,
    ) { }

    async create(reminder: Reminder): Promise<GenericResponse<Reminder>> {
        let res = await this.reminderRepo.create(reminder);

        if (res) {
            return {
                success: true,
                message: 'Reminder created successfully.',
                data: res
            }
        }
        return {
            success: false,
            message: 'Failed to create reminder.',
            data: null
        }
    }

    async findById(id: string): Promise<GenericResponse<Reminder>> {
        let res = await this.reminderRepo.findById(id);
        return {
            success: true,
            message: 'Reminder retrieved successfully.',
            data: res
        }
    }
}
