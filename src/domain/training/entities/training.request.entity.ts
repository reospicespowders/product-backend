// src/domain/training/entities/training.request.entity.ts

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/**
 * @schema TrainingRequest
 */
export const TrainingRequestSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
    },
    trainingId: {
      type: Schema.Types.ObjectId,
      ref : 'course'
    },
    createdType: {
      type: String,
      enum: ['TRAINING','COURSE']
    },
    type: {
      type: Schema.Types.ObjectId,
      ref: 'Training_Type',
    },
    numberOfAttendees:{
      type: Number,
      default : 100
    },
    ou:{
      type: Schema.Types.ObjectId,
      ref: 'Organizational-Unit',
    },
    ous:[{
      type: Schema.Types.ObjectId,
      ref: 'Organizational-Unit',
    }],
    completedAttendees:[{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    pendingAttendees:[{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    lastSessionPending:[{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    attendeesRequests: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    registrationType : {
      type : String,
      default : null
    },
    date:{
      type: Object,
    },
    label: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING','TRAINING_CREATED','APPROVED', 'REJECTED', 'REVISION',],
      default : 'PENDING'
    },
    reason: {
      type: String,
    },
    recreatedFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    recreationCount: {
      type: Number,
      default : 0
    },
    active: {
      type: Boolean,
      default: true,
    },
    master_trainer : {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    ratingSettings: {
      type: Object,
    },
    impactSettings: {
      type: Object,
    },
    unregisteredUsers : [
      {
        type : String
      }
    ]
  },
  { strict: false, timestamps: true },
);
