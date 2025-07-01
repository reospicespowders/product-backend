import mongoose from "mongoose";



export const MSChannelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-project'
    },
    branchId: {
        type: mongoose.Types.ObjectId,
        ref: 'organization-units'
    },
    visitCount: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default : "Basic"
    },
    weight: {
        type: Number,
        default: 0
    }
}, { strict: true, timestamps: true })