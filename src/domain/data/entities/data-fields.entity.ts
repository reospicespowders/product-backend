import mongoose from "mongoose";
const Schema = mongoose.Schema

/**
 * @schema Organizational Unit Locations
 */
export const DataFieldSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        priority: {
            type: Number
        },
        type:{
            type: Schema.Types.ObjectId,
            ref: "Field-Types",
        },
        icon: {
            type: String
        },
        active: {
            type: Boolean
        }
    },
    { strict: false , timestamps:true}
);
