import * as Joi from 'joi'

//Data Validators
export const createData = Joi.object({
  id: Joi.number(),
  name: Joi.string().required(),
  type: Joi.string(),
  fields: Joi.array(),
  parent: Joi.string(),
  ous: Joi.string(),
  signed : Joi.object()
});

export const updateDataValidator = Joi.object({
  _id: Joi.string().required(),
  id: Joi.number(),
  name: Joi.string(),
  type: Joi.string(),
  fields: Joi.array(),
  parent: Joi.string(),
  ous: Joi.string(),
  signed : Joi.object(),
  tempInactive : Joi.boolean()
});

export const signDataValidator = Joi.object({
  data : Joi.array().items(Joi.object()).required()
});

export const activeInactiveValidator = Joi.object({
  status : Joi.boolean().required(),
  data : Joi.array().items().required()
});


//Data Field Validators
export const createDataFiledValidator = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string().required(),
  priority: Joi.number(),
  type: Joi.string(),
  active: Joi.boolean()
});


export const updateDataFieldValidator = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string(),
  priority: Joi.number(),
  type: Joi.string(),
  icon: Joi.string(),
  active: Joi.boolean()
});


//Data Type Validator
export const createDataTypeValidator = Joi.object({
  name: Joi.string().required(),
  arabic: Joi.string().required(),
  icon: Joi.string().required(),
  active: Joi.boolean()
});


export const updateDataTypeValidator = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  arabic: Joi.string().required(),
  icon: Joi.string().required(),
  active: Joi.boolean()
});

//Data Template Validators
export const createDateTemplateValidator = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  fields: Joi.array().required(),
  standard: Joi.boolean(),
  ou: Joi.any(),
  active: Joi.boolean().required()
});

export const dateTemplateFilterValidator = Joi.object({
  name: Joi.string(),
  type: Joi.string(),
  active: Joi.boolean()
});


export const updateDataTemplateValidator = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string(),
  type: Joi.string(),
  fields: Joi.array(),
  standard: Joi.boolean(),
  ou: Joi.any(),
  active: Joi.boolean()
});


//Data Field Validator
export const createDataFieldTypeValidator = Joi.object({
  name: Joi.string().required(),
  arabic: Joi.string().required(),
  active: Joi.boolean()
});


export const updateDataFieldTypeValidator = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string(),
  arabic: Joi.string(),
  active: Joi.boolean()
});


// Content Update validators

export const contentUpdateValidator = Joi.object({
  status: Joi.string(),
  type: Joi.string().required(),
  before: Joi.object(),
  data_type: Joi.string(),
  after: Joi.object(),
  ous: Joi.string(),
  service_id: Joi.string(),
  approved_by: Joi.string(),
  reason : Joi.string(),
});

export const updateContentUpdateValidator = Joi.object({
  _id: Joi.string().required(),
  status: Joi.string(),
  data_type: Joi.string(),
  type: Joi.string(),
  before: Joi.object(),
  after: Joi.object(),
  ous: Joi.string(),
  service_id: Joi.string(),
  updated_by: Joi.string(),
  approved_by: Joi.string(),
  reject_reason: Joi.string(),
  adminChange : Joi.string(),
  reason : Joi.string(),
});


// Data Draft Creation Validator

export const createDataDraftValidator = Joi.object({
  user: Joi.object().required(),
  object: Joi.object().required()
})

export const updateDataDraftValidator = Joi.object({
  _id: Joi.object().required(),
  user: Joi.string(),
  object: Joi.object()
})

// Data State creation Validator

export const createStatesValidator = Joi.object({
  user: Joi.object(),
  service_id : Joi.string().required(),
  keyword : Joi.string(),
  category_id : Joi.number()
})

export const updateStatesValidator = Joi.object({
  _id:Joi.string().required(),
  user: Joi.object(),
  service_id : Joi.string(),
  keyword : Joi.string(),
  category_id : Joi.number()
})

export const getValidator = Joi.any()
