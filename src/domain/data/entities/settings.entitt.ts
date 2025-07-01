import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * @schema Settings
 */
export const SettingsSchema = new mongoose.Schema(
    {
        sign_duration : {
            type : Number,
            default : 3
        }
    },
    { strict: false, timestamps:true }
);
