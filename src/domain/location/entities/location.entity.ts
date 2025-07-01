import mongoose from "mongoose";
import moment from 'moment';
import 'moment-timezone'

/**
 * @schema Organizational Unit Locations
 */
export const OuLocationSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        active: {
            type: Boolean,
            default : true
        },
    },
    { strict: false , timestamps:true}
);
