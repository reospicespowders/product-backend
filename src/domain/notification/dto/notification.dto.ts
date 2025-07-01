import { User } from "src/domain/user-auth/dto/user-type..dto";
import { NotificationType } from "../enums/notification-type.enum";


export class Notification {
    type: NotificationType;
    sender: string | User;
    receiver: string[];
    seenBy: string[];
    category:string;
    data?:any;
}