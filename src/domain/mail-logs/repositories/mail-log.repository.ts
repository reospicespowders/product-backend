import { Injectable } from "@nestjs/common";
import { MailLog } from "../dto/mail-log.dto";
import { MailLogRepository } from "../interfaces/mail-log-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class MailLogRepositoryImpl implements MailLogRepository {

    constructor(@InjectModel('mail_logs') private readonly mailLogModel: Model<MailLog>) { }

    async create(mailLog: MailLog) {
        this.mailLogModel.create(mailLog);
    }
}