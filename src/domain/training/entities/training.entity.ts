//Database
import mongoose from 'mongoose';

/**
 * @schema Training Program
 */
export const TrainingProgramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    courses: [{
      type: mongoose.Types.ObjectId,
      ref: 'course'
    }],
    description: {
      type: String,
    },
    type: {
      type: mongoose.Types.ObjectId,
    },
    status: {
      type: String,
      default:'PENDING'
    },
    ous: [{
      type: mongoose.Types.ObjectId,
      ref: 'Organizational-Unit',
    }],
    attendees: [{
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }]
  },
  { strict: false, timestamps: true },
);
