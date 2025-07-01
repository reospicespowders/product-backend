import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { Reminder } from 'src/domain/reminder/dto/reminder.dto';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { ReminderService } from 'src/usecase/services/reminder/reminder.service';
import { CronService } from 'src/usecase/services/schedule-service/cron/cron.service';

@Controller('reminder')
@ApiTags('Reminder Controller')
@ApiBearerAuth()
export class ReminderController {

    constructor(
        private readonly reminderService: ReminderService,
        private readonly cron:CronService
    ) { }


    @Post()
    create(@Body() reminder: Reminder, @Req() req:any): Promise<GenericResponse<Reminder>> {
        reminder.createdBy = req.user.uid;
        return this.reminderService.create(reminder)
    }

    @Get(":id")
    findById(@Param("id") id: string): Promise<GenericResponse<Reminder>> {
        return this.reminderService.findById(id)
    }

    @Get("cron/call")
    @OpenRoute()
    callCron(): Promise<void> {
        return this.cron.sendReminderMail();
    }
}
