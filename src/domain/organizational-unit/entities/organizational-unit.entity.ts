import mongoose from "mongoose";
import { User } from "src/domain/user-auth/dto/user-type..dto";

const Schema = mongoose.Schema;

/**
 * @schema Organizational Unit 
 */
export const OrganizationUnitsSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Organizational-Unit",
            default: null
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "OU-Category"
        },
        type: {
            type: Schema.Types.ObjectId,
            ref: "OU-Type"
        },
        location: {
            type: Schema.Types.ObjectId,
            ref: "OU-Location"
        },
        image: {
            type: String,
            require: false,
            default: ''
        },
        image_sq: {
            type: String,
            require: false,
            default: ''
        },
        isManager: {
            type: Boolean,
            default: false
        },
        managers: {
            type: Array<User>,
            ref: 'User'
        },
        active: {
            type: Boolean,
            default: true
        },
        id: {
            type: Number,
            unique: true,
        },
        allowSingleUser: {
            type: Boolean,
            default: false
        },
        description:{
            type: String,
        },
        color: {
            type: Object,
            default: false
        }
    },
    { strict: false, timestamps: true }
);