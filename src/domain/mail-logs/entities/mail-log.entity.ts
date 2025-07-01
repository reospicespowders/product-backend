import { Schema } from "mongoose";
import * as moment from 'moment';
import 'moment-timezone';


export const MailLogSchema = new Schema({
    meta: {
        type: Object,
    },
    status: {
        type: String,
        enum: ["ERROR", "SUCCESS"]
    },
    timeStemp: {
        type: String,
        default: () => moment().tz("Asia/Riyadh").format()
    },
}, { strict: false, timestamps: true })