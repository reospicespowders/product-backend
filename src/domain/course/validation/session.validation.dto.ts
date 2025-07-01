import * as joi from "joi";

//create session validation
export const createSessionValidation = joi.object({
    title: joi.string().required(),
    type: joi.string(),
    typeId : joi.string().required(),
    start_time : joi.string(),
    end_time : joi.string(),
    active : joi.boolean(),
    status: joi.string(),
    attendance : joi.array(),
    attendanceProof : joi.object(),
    history : joi.object()
})

// update session validation
export const updateSessionValidation = joi.object({
    _id: joi.string().required(),
    title: joi.string().required(),
    type: joi.string(),
    typeId : joi.string().required(),
    start_time : joi.string(),
    end_time : joi.string(),
    active : joi.boolean(),
    status: joi.string(),
    attendance : joi.array(),
    attendanceProof : joi.object(),
    history : joi.object()
})