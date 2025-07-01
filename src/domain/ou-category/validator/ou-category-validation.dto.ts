
//data validation library
import * as joi from "joi";

//create ou category validation
export const createOuCategoryValidation = joi.object({
    name: joi.string().required(),
    icon: joi.string(),
    active: joi.boolean()
})


//update ou category validation
export const updateOuCategoryValidation = joi.object({
    _id: joi.string().required(),
    name: joi.string().required(),
    icon: joi.string(),
    active: joi.boolean()
})
