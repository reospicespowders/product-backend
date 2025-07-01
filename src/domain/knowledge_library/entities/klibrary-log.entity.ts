
import { Schema } from "mongoose";


export const KLibraryLogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    data : {
        type: Object,
        required : true
    },
    status : {
        type : String,
        enum : ['PENDING','APPROVED','REJECTED'],
        default : 'PENDING'
    },
    reason : {
        type : String, 
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { strict: true, timestamps: true }

)