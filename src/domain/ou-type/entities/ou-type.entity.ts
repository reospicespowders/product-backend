
import mongoose from "mongoose";

/**
 * @schema Organizational Unit Type
 */
export const OuTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        icon: {
            type: String
        },
        tag: {
            type: String,
        },
        active: {
            type: Boolean
        }
    },
    { strict: false, timestamps: true }
);
