import mongoose, { Schema, Types } from 'mongoose';
import { PermissionRequest } from '../dto/permission-request.dto';
import * as moment from 'moment';
import 'moment-timezone';
import { bool } from 'joi';

/**
 * @schema PermissionRequest
 */
export const PermissionRequestSchema = new mongoose.Schema<PermissionRequest>({
    generalData: {
        agencyOrManagement: {
            type: String,
            required: true
        },
        requestFor: {
            name: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        },
        ou: [{
            type: Schema.Types.ObjectId,
            ref: "Organizational-Unit",
            required: true
        }]
    },
    contactOfficer: {
        email: {
            type: String,
            required: true
        },
        mobileNumber: {
            type: String,
            required: true
        },
        employeeName: {
            type: String,
            required: true
        }
    },
    questionMaker: {
        email: {
            type: String,
            required: true
        },
        mobileNumber: {
            type: String,
            required: true
        },
        employeeName: {
            type: String,
            required: true
        }
    },
    testGoal: {
        type: String,
        required: true
    },
    testGoalOther: {
        type: String,
        default: ''
    },
    goalOther: {
        type: String,
        default: ''
    },
    questionType: [{
        type: String,
        required: true
    }],
    questionLevel: {
        type: String,
        required: true
    },
    numberOfEmployees: {
        type: String,
        required: true
    },
    questionsPerModel: {
        type: Number,
        required: true
    },
    gradingScale: {
        notPassed: {
            from: {
                type: Number,
                required: true
            },
            to: {
                type: Number,
                required: true
            }
        },
        good: {
            from: {
                type: Number,
                required: true
            },
            to: {
                type: Number,
                required: true
            }
        },
        veryGood: {
            from: {
                type: Number,
                required: true
            },
            to: {
                type: Number,
                required: true
            }
        },
        excellent: {
            from: {
                type: Number,
                required: true
            },
            to: {
                type: Number,
                required: true
            }
        }
    },
    limitingTesters: {
        type: String,
        default: ''
    },
    observers: {
        type: String,
        default: ''
    },
    numberOfRegions: {
        type: Number,
        required: true
    },
    numberOfRegionsOther: {
        type: String,
        default: ''
    },
    examinationHalls: {
        type: Number,
        required: true
    },
    examinationHallsOther: {
        type: String,
        default: ''
    },
    totalObservers: {
        type: Number,
        required: true
    },
    observersNote: {
        type: String,
        default: ''
    },
    testEntries: [{
        testName: {
            type: String,
            required: true
        },
        testDate: {
            type: String,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        surveyId: {
            type: Schema.Types.ObjectId,
            ref: 'Survey',
            default: null
        },
        assessmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Assessment',
            default: null
        }
    }],
    detailedReport: {
        type: Boolean,
        default: false
    },
    yearlyReport: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: () => moment().tz("Asia/Riyadh").toDate()
    },
    updated_at: {
        type: Date,
        default: () => moment().tz("Asia/Riyadh").toDate()
    },
    comments : {
        type :String
       
    },
    agreement:{
        type : Boolean,
        default : false
    }
}, { 
    strict: false, 
    timestamps: true 
});
