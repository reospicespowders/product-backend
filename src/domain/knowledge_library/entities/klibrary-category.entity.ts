import { Schema } from "mongoose";



export const KLibraryCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
}, { strict: false, timestamp: true }

)