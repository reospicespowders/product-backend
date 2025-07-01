import * as joi from "joi";

export const createCompanyValidation = joi.object({
    name: joi.string().required(),
    location: joi.string().required(),
    website: joi.string(),
    coordinator : joi.string(),
    trainers : joi.array().items(joi.string()),
    active : joi.boolean(),
    attachments : joi.array().items(joi.object()),
    allowed_trainings : joi.array().items(joi.string()),
   
})

export const updateCompanyValidation = joi.object({
    _id: joi.string().required(),
    name: joi.string(),
    location: joi.string(),
    website: joi.string(),
    coordinator : joi.string(),
    trainers : joi.array().items(joi.string()),
    active : joi.boolean(),
    attachments : joi.array().items(joi.object()),
    allowed_trainings : joi.array().items(joi.string()),
})