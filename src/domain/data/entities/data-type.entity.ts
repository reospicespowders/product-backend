import mongoose from "mongoose";


/**
 * @schema Data Type
 */
export const DataTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        arabic:{
            type: String
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