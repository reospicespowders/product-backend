import moment from "moment";
import mongoose from "mongoose";

/**
 * @schema Organizational Unit categories
 */
export const OuCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        icon: {
            type: String
        },
        active: {
            type: Boolean
        }
    },
    { strict: false, timestamps: true }
);
