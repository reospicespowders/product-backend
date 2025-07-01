
//data validation library
import * as joi from "joi";


//create ou validation
export const createOuValidation = joi.object({
    name: joi.string(),
    parent: joi.any(),
    category: joi.string(),
    type: joi.string(),
    location: joi.string(),
    image: joi.any(),
    image_sq: joi.any(),
    isManager: joi.boolean(),
    active: joi.boolean(),
    description : joi.string(),
    id: joi.number(),
})

//update ou validation
export const updateOuValidation = joi.object({
    _id: joi.string().required(),
    name: joi.string(),
    parent: joi.any(),
    category: joi.string(),
    type: joi.string(),
    location: joi.string(),
    image: joi.any(),
    image_sq: joi.any(),
    isManager: joi.boolean(),
    managers: joi.array<String>(),
    active: joi.boolean(),
    allowSingleUser: joi.boolean(),
    id: joi.number(),
    theme:joi.object(),
    description : joi.string(),
}) 