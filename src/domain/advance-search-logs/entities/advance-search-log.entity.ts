import mongoose from "mongoose";



export const AdvanceSearchLogSchema = new mongoose.Schema({
    uid: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    query: {
        type: Object,
        require: true
    }
}, { strict: true, timestamps: true });