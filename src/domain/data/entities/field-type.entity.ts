import mongoose from "mongoose";

/**
 * @schema Organizational Unit Locations
 */
export const FieldTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        arabic: {
            type: String
        },
        active: {
            type: Boolean
        }
    },
    { strict: false, timestamps:true }
);
