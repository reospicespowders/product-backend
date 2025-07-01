import mongoose from "mongoose";
const Schema = mongoose.Schema

export const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
    },
    image: {
        type: String,
    },
    start_Date: {
        type: String
    },
    end_date: {
        type: String
    },
    session: [{
        type: Schema.Types.ObjectId,
        ref: "Session",
    }],
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    active: {
        type: Boolean,
        default: true
    },
    courseMaterial: [{
        type: Object
    }],
    status: {
        type: String
    },
    request_id: {
        type: Schema.Types.ObjectId,
    },
    certificate : {
        description : { type: String , default : null },
        session : [
           {
            _id: { type: Schema.Types.ObjectId, auto: false }, 
            visible : { type : Boolean },
            id : {
                type: Schema.Types.ObjectId,
                ref: 'Session'
            }
           } 
        ]
    },
    certifiedUsers : [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default : []
    }],
    userRating : [
        {
            type : Object
        }
    ],
    trainerRating : [
        {
            type : Object
        }
    ]
}, { strict: false, timestamps: true })