import { IntersectionType } from "@nestjs/swagger";

export class Reminder {
    surveyId: string;
    assessmentId: string;
    trainingId: string;
    type: string;
    date: Date;
    daysBefore: number;
    createdBy: string;
}

export class UpdateReminderDto extends IntersectionType(Reminder) {
    _id: string;
}