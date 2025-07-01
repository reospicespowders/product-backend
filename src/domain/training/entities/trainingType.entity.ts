//Database
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/**
 * @schema TrainingType
 */
export const TrainingTypeSchema = new mongoose.Schema(
  {
    name : {
      type: String,
    },
    arabic : {
        type : String
    },
    icon : {
        type : String
    },
    permissions : {
      type : Object
    },
    allowed_ou:[
      {
        type: Schema.Types.ObjectId,
        ref: 'Organizational-Unit',
      }
    ],
    number_of_sessions : {
      type : Number
    },
    active : {
        type : Boolean,
        default : true
    }
  },
  { strict: false, timestamps: true },
);
