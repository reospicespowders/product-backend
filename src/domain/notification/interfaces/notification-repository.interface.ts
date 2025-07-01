import { UpdateWriteOpResult } from "mongoose";
import { Notification } from "../dto/notification.dto";


export interface NotificationRepository {
    create(notification:Notification):Promise<Notification>;
    addToSeen(userId:string,notificationId:string):Promise<UpdateWriteOpResult>;
    getByUser(userId:string):Promise<Notification[]>;
    getByUserWithOwn(userId:string):Promise<Notification[]>;
}