import mongoose from "mongoose";
const Schema = mongoose.Schema

export const ProgramSchema = new mongoose.Schema({
    trainer: {
        type: Object,
    },
    is_online: {
        type: String,
    },
    video_url: {
        type: String
    },
    zoom_url: {
        type: String
    },
    address: {
        type: Object
    },
    seen: {
        type: Boolean
    },
},
    { strict: false, timestamps: true }
)