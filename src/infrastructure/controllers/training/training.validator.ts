import * as Joi from 'joi';

//create training request Validators
export const createTrainingRequestValidator = Joi.object({
  topic: Joi.string().required(),
  trainingId: Joi.string(),
  type: Joi.string(),
  createdType: Joi.string(),
  date: Joi.object(),
  ou: Joi.string(),
  ous: Joi.array(),
  registrationType: Joi.string(),
  numberOfAttendees: Joi.number(),
  numberOfAttendeesOfOu: Joi.number(),
  pendingAttendees: Joi.array(),
  description: Joi.string(),
  status: Joi.string(),
  active: Joi.boolean(),
  recreatedFrom: Joi.string(),
  recreationCount: Joi.number(),
  reason: Joi.any(),
  creator: Joi.string(),
  master_trainer: Joi.string(),
  unregisteredUsers: Joi.array(),
  ratingSettings: Joi.object(),
  impactSettings: Joi.object()
});

//update training request Validators
export const updateTrainingRequestValidator = Joi.object({
  _id: Joi.string().required(),
  topic: Joi.string(),
  trainingId: Joi.string(),
  createdType: Joi.string(),
  type: Joi.string(),
  date: Joi.object(),
  ou: Joi.string(),
  ous: Joi.array().items(Joi.string()),
  numberOfAttendees: Joi.number(),
  numberOfAttendeesOfOu: Joi.number(),
  pendingAttendees: Joi.array(),
  lastSessionPending: Joi.array(),
  registrationType: Joi.string(),
  recreatedFrom: Joi.string(),
  recreationCount: Joi.number(),
  description: Joi.string(),
  status: Joi.string(),
  active: Joi.boolean(),
  reason: Joi.any(),
  creator: Joi.string(),
  master_trainer: Joi.string(),
  unregisteredUsers: Joi.array(),
  ratingSettings: Joi.object(),
  impactSettings: Joi.object(),
  newInviation : Joi.object(),
});

//create training Validators
export const createTrainingValidator = Joi.any();

//update training Validators
export const updateTrainingValidator = Joi.any();

//update training type Validators
export const createTrainingTypeValidator = Joi.any();

//update training type Validators
export const updateTrainingTypeValidator = Joi.any();
