import { MailLog } from "../dto/mail-log.dto";


export interface MailLogRepository {
    create(mailLog: MailLog): void;
}