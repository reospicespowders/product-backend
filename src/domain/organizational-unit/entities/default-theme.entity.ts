import mongoose from "mongoose";
import { User } from "src/domain/user-auth/dto/user-type..dto";

const Schema = mongoose.Schema;

/**
 * @schema Organizational Unit 
 */
export const DefaultTheme = new mongoose.Schema(
    {
        theme: {
            type: Array<Object>
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    { strict: false, timestamps: true }
);