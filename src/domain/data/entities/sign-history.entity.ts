import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

/**
 * @schema SignHistory
 */
export const SignHistorySchema = new mongoose.Schema(
    {
        data_id : {
            type: Schema.Types.ObjectId,
            ref: "data",
        },
        history : [
            {
                type : Object
            }
        ]
    },
    { strict: false, timestamps:true }
);
