import mongoose from "mongoose";




export const MSMeasuringTypeSchema = new mongoose.Schema({
    type: {
        type: String,
    },
}, { strict: true, timestamps: true })