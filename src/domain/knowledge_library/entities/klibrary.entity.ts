import { Schema } from "mongoose";

export const KLibrarySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    categoryname: {
        type: String,
        required: true,
    },
    categoryicon: {
        type: String,
        required: true,
    },
    link: {
        type: Array,
        default: [],
    },
    ou: {
        type: Schema.Types.ObjectId,
        ref: "Organizational-Unit",
    },
    downloadcount: {
        type: Number,
        default: 0,
    },
},
    { strict: false, timestamps: true }
)