import Joi, * as joi from "joi";

//create course validator
export const createCourseValidation = joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    type: joi.string(),
    image : joi.string().allow(null).allow(''),
    start_date : joi.string(),
    end_date : joi.string(),
    session : joi.array().items(joi.object()),
    active : joi.boolean(),
    attendees:joi.array().items(joi.string()),
    courseMaterial : joi.array().items(joi.object()),
    status: joi.string(),
    request_id: joi.any(),
})

//update course validation
export const updateCourseValidation = joi.object({
    _id: joi.string().required(),
    title: joi.string(),
    description: joi.string(),
    type: joi.string(),
    image : joi.string().allow(null).allow(''),
    start_date : joi.string(),
    end_date : joi.string(),
    session : joi.array(),
    active : joi.boolean(),
    courseMaterial : joi.array().items(joi.object()),
    status: joi.string(),
    request_id: joi.any(),
    attendees:joi.array().items(joi.string()),
    certificate : joi.object(),
    certifiedUsers : joi.array().items(joi.string()),
    userRating : joi.array(),
    trainerRating : joi.any()
})

//assign attendess validator
export const assignAttendeesValidator = joi.object({
    _id: joi.string().required(),
    attendees:joi.array().items(joi.string()),
    assignAll : joi.boolean(), 
    flag : joi.string()
})