import mongoose from "mongoose";

export const MSVendorCompanySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    classification: {
        type: String,
        enum: ['internal', 'external'],
        default: 'internal'
    },
    vendors: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
}, { strict: true, timestamps: true })