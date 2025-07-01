import mongoose from "mongoose";




export const MSSessionSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Types.ObjectId,
        ref: 'ms-project'
    },
    name:{
        type:String
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    visits: {
        data: [{
            channel: {
                type: mongoose.Types.ObjectId,
                ref: 'ms-channel'
            },
            branch: {
                type: mongoose.Types.ObjectId,
                ref: 'ms-channel',
                required: false
            },
            date: {
                type: Date,
                required: true
            },
            time: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ['Pending', 'In-Progress', 'Done'],
                default: 'Pending'
            }
        }]
    },
}, { strict: true, timestamps: true })