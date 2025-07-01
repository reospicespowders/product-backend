import mongoose from "mongoose";
const Schema = mongoose.Schema

export const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    location: {
        type: String,
    },
    website: {
        type: String,
    },
    coordinator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    trainers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    attachments: [{
        type: Object
    }],
    allowed_trainings : [
        {
            type: Schema.Types.ObjectId,
            ref: 'Training_Type'
        }
    ],
    active: {
        type: Boolean,
        default: true
    },
   
}, { strict: false, timestamps: true })