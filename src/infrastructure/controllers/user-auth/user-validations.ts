import * as Joi from 'joi'
import { Comment } from 'src/domain/comments/dto/comment.dto';

//User signup validator
export const userSignup = Joi.object({
    name: Joi.object(),
    email: Joi.string().email().required(),
    phone: Joi.string(),
    gender: Joi.string().required(),
    city: Joi.string(),
    national_id:Joi.string(),
    active: Joi.object(),
    location : Joi.string(),
    ou : Joi.array().items(Joi.string()),
    externalUser : Joi.object(),
    permissionRequests : Joi.array(),
  });

// User register validator
export const registerUser = Joi.object({
    name: Joi.object(),
    email: Joi.string().email().required(),
    phone: Joi.string(),
    role: Joi.string(),
    gender: Joi.string().required(),
    city: Joi.string(),
    national_id:Joi.string(),
    active: Joi.object(),
    location : Joi.string(),
    ou : Joi.array().items(Joi.string()),
    image: Joi.string(),
    externalUser : Joi.object(),
    isVendor: Joi.boolean().optional(),
    vendorCompanyId: Joi.string().optional(),
    permissionRequests : Joi.array(),
})

// User login validator
export const validateLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    otp : Joi.string()
})

export const createPermissionRequestValidator = Joi.object({
    generalData: Joi.object({
        agencyOrManagement: Joi.string().required(),
        requestFor: Joi.object({
            name: Joi.string().required(),
            value: Joi.string().required()
        }).required(),
        ou: Joi.array().items(Joi.string()).required()
    }).required(),
    contactOfficer: Joi.object({
        email: Joi.string().email().required(),
        mobileNumber: Joi.string().required(),
        employeeName: Joi.string().required()
    }).required(),
    questionMaker: Joi.object({
        email: Joi.string().email().required(),
        mobileNumber: Joi.string().required(),
        employeeName: Joi.string().required()
    }).required(),
    testGoal: Joi.string().required(),
    questionType: Joi.array().items(Joi.string()).required(),
    questionLevel: Joi.string().required(),
    numberOfEmployees: Joi.string().required(),
    questionsPerModel: Joi.number().required(),
    gradingScale: Joi.object({
        notPassed: Joi.object({ from: Joi.number().required(), to: Joi.number().required() }).required(),
        good: Joi.object({ from: Joi.number().required(), to: Joi.number().required() }).required(),
        veryGood: Joi.object({ from: Joi.number().required(), to: Joi.number().required() }).required(),
        excellent: Joi.object({ from: Joi.number().required(), to: Joi.number().required() }).required()
    }).required(),
    numberOfRegions: Joi.number().required(),
    examinationHalls: Joi.any().required(),
    testGoalOther : Joi.any(),
    examinationHallsOther : Joi.any(),
    observersNote : Joi.any(),
    numberOfRegionsOther : Joi.any(),
    totalObservers: Joi.number().required(),
    testEntries: Joi.array().items(Joi.object({
        testName: Joi.string().required(),
        testDate: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        attemptTime : Joi.number()
    })).required(),
    detailedReport:Joi.boolean(),
    yearlyReport : Joi.boolean()
});


export const updatePermissionRequestValidator = Joi.object({
    _id: Joi.string().required(),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED'),
    agreement: Joi.boolean(),
    comments: Joi.string(),

    generalData: Joi.object({
        agencyOrManagement: Joi.string().required(),
        requestFor: Joi.object({
            name: Joi.string().required(),
            value: Joi.string().required()
        }).required(),
        ou: Joi.array().items(Joi.string()).required()
    }).required(),
    contactOfficer: Joi.object({
        email: Joi.string().email().required(),
        mobileNumber: Joi.string().required(),
        employeeName: Joi.string().required()
    }).required(),
    questionMaker: Joi.object({
        email: Joi.string().email().required(),
        mobileNumber: Joi.string().required(),
        employeeName: Joi.string().required()
    }).required(),
    testGoal: Joi.string().required(),
    questionType: Joi.array().items(Joi.string()).required(),
    questionLevel: Joi.string().required(),
    numberOfEmployees: Joi.string().required(),
    questionsPerModel: Joi.number().required(),
    gradingScale: Joi.object({
        notPassed: Joi.object({ from: Joi.number().required(), to: Joi.number().required() }).required(),
        good: Joi.object({ from: Joi.number().required(), to: Joi.number().required() }).required(),
        veryGood: Joi.object({ from: Joi.number().required(), to: Joi.number().required() }).required(),
        excellent: Joi.object({ from: Joi.number().required(), to: Joi.number().required() }).required()
    }).required(),
    numberOfRegions: Joi.number().required(),
    examinationHalls: Joi.any().required(),
    testGoalOther : Joi.any(),
    examinationHallsOther : Joi.any(),
    observersNote : Joi.any(),
    numberOfRegionsOther : Joi.any(),
    totalObservers: Joi.number().required(),
    testEntries: Joi.array().items(Joi.object({
        testName: Joi.string().required(),
        testDate: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required()
    })).required(),
    detailedReport:Joi.boolean(),
    yearlyReport : Joi.boolean()

});

export const rejectPermissionRequestValidator = Joi.object({
    _id: Joi.string().required(),
    agreement : Joi.boolean(),
    comments : Joi.string(),
    
});
