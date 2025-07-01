import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * @schema Data
 */
export const DataSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        name: {
            type: String
        },
        type: {
            type: Schema.Types.ObjectId,
            ref: "data-types",
        },
        fields: [{
            label: {
                type: String,
            },
            type: {
                type: Schema.Types.ObjectId,
                ref: "data-fields",
            },
            data: {
                type: String
            },
            item_Id: {
                type: Schema.Types.ObjectId,
                ref: "data",
            },
            item_Field: {
                type: String
            },
        }],
        parent: {
            type: Schema.Types.ObjectId,
            ref: "data",
        },
        ous: {
            type: Schema.Types.ObjectId,
            ref: "organization-units",
        },
        active: {
            type: Boolean,
            default : true
        },
        tempInactive: {
            type: Boolean,
            default : false
        },
        signed : {
            status : {
                type : Boolean,
                default : false
            },
            user_id : {
                type : String,
                default : null
            },
            user_name : {
                type : String,
                default : null
            },
            date : {
                type: Date,
                default : Date.now()
            }
        }
    },
    { strict: false, timestamps:true }
);
