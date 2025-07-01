import * as mongoose from 'mongoose';

export const ContentUpdateReportsSchema = new mongoose.Schema(
    {
        ou: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organizational-units'
        },
        days: {
            type: Number,
            default: 30
        },
        time: {
            type: String
        },
        status: {
            type: String,
            default: 'PENDING'
        },
        comment: {
            type: String
        },
        agreement: {
            type: Boolean,
            default: false
        },
        confirmation: {
            type: Boolean,
            default: false
        },
        manager: {
            _id: {
                type: String
            },
            name: {
                type: String
            },
            email: {
                type: String
            }
        },
        sendingDate: {
            type: String
        },
        isRegenerated: {
            type: Boolean,
            default: false
        },
        states: [{
            type: Object
        }],
        reportForm: {
            type: String
        },
        reportTo: {
            type: String
        }
    },
    {
        timestamps: true
    }
);
