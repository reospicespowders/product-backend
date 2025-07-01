import mongoose from "mongoose";
import { Schema } from 'mongoose';


export const MSProjectSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String
    },
    goal: {
        type: Array<String>,
        default: []
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    //External PM
    vendor: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    internalPm: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    responsibles: [{
        type: {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            },
            isSenior: {
                type: Boolean,
                default: false
            }
        }
    }],
    factorCutOffPercentage: {
        type: Number,
        default: 0
    },
    vendorCompanyId: {
        type: Schema.Types.ObjectId,
        ref: "ms-vendor-companies",
    },
    internalPMEmail: {
        type: String
    },
    tag: {
        type: mongoose.Types.ObjectId,
        ref: 'survey-tags'
    },
}, { strict: true, timestamps: true })