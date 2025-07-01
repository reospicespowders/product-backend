
//data validation library
import * as joi from "joi";

//create ou Type validation
export const createOuTypeValidation = joi.object({
    name: joi.string().required(),
    icon: joi.string(),
    tag: joi.string(),
    active: joi.boolean()
})


//update ou Type validation
export const updateOuTypeValidation = joi.object({
    _id: joi.string().required(),
    name: joi.string().required(),
    icon: joi.string(),
    tag: joi.string(),
    active: joi.boolean()
})
