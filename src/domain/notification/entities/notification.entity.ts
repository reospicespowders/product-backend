import mongoose from "mongoose";
import { NotificationType } from "../enums/notification-type.enum";
import { NotificationCategory } from "../enums/notification-category.enum";
import * as moment from "moment";



export const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [...Object.values(NotificationType)],
    },
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    receiver: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
    seenBy: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
    category: {
        type: String,
        enum: [...Object.values(NotificationCategory)]
    },
    createdAt: {
        type: String,
        default: () => moment().tz("Asia/Riyadh").format()
    },
    data: {
        type: Object,
    }
}, { strict: true });