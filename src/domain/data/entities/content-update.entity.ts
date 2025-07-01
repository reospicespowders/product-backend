import mongoose from "mongoose";
const Schema = mongoose.Schema

/**
 * @schema Content Update
 */
export const contentUpdate = new mongoose.Schema(
    {
        status: {
            type: String,
            default : 'PENDING'
        },
        type : {
            type : String
        },
        data_type : {
            type : String
        },
        before:{
            type: Object
        },
        after:{
            type: Object
        },
        adminChange : {
            type: Object,
            default : null
        },
        service_id : {
              type: Schema.Types.ObjectId,
              ref : "data" 
        },
        ous: {
            type: Schema.Types.ObjectId,
            ref: "Organizational-Unit",
        },
        updated_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        approved_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        reject_reason: {
            type: String,
        },
        reason: {
            type: String,
        }
    },
    { strict: false, timestamps:true }
);
