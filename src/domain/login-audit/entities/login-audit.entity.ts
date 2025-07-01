import mongoose from "mongoose";



export const LoginAuditSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    },
    createdTimestamp: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});