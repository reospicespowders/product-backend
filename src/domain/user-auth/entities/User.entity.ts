import mongose, { Schema, Types } from 'mongoose';
import { User } from '../dto/user-type..dto';
import * as moment from 'moment';
import 'moment-timezone'
import { boolean } from 'joi';

/**
 * @schema User
 */
export const UserSchema = new mongose.Schema<User>({
    name: {
        first: {
            type: String
        },
        middle: {
            type: String
        },
        last: {
            type: String
        }
    },
    email: {
        type: String
    },
    password: {
        type: String,
    },
    image: {
        type: String,
    },
    phone: {
        type: String
    },
    national_id: {
        type: String
    },
    gender: {
        type: String
    },
    isVendor: {
        type: Boolean,
        default: false
    },
    isInternalVendor: {
        type: Boolean,
        default: false
    },
    ou: [{
        type: Schema.Types.ObjectId,
        ref: "Organizational-Unit"
    }],
    managerOus: [{
        type: Schema.Types.ObjectId,
        ref: "Organizational-Unit",
        default: []
    }],
    location: {
        type: Schema.Types.ObjectId,
        ref: "OU-Location"
    },

    role: {
        type: Schema.Types.ObjectId,
        ref: "Role",
        default: '64c434e4b3af906a319576d3'
    },
    browsers: {
        code: {
            type: String,
            default: null,
        },
        list: [{
            type: String,
            default: null,
        }]
    },
    accessToken: {
        type: String,
        default: null
    },
    resetPassword: {
        status: {
            type: Boolean,
            default: true
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lastPasswordReset: {
            type: String,
            default: () => moment().tz("Asia/Riyadh")
        }
    },
    active: {
        status: {
            type: Boolean,
            default: false
        },
        activationCode: {
            type: String,
            default: null
        },
        reason: {
            type: String,
            default: "NEW ACCOUNT"
        },
        activationDate: {
            type: String,
            default: () => moment().tz("Asia/Riyadh").format()
        },

    },
    externalUser: {
        status: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            default: null
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            default: null
        },
        companyName: {
            type: String,
            default: null
        },
    },
    vendorCompanyId: {
        type: Schema.Types.ObjectId,
        ref: "ms-vendor-companies",
        default: null
    },
    master_trainer : {
        type : Boolean
    },
    deletedAt: {
        type: String,
        default: null
    },
    lastLogin: {
        type: String,
        default: null
    },
    permissionRequests:[{
        type : String,
        default : null
    }],
    favoriteData:[{
        type: Number,
        default: null
    }],
},
    { strict: false, timestamps: true });


