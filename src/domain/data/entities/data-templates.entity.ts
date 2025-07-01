import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * @schema Data Type
 */

// #253 Service card Template

export const DataTemplatesSchema = new mongoose.Schema(
    {
      name: {
        type: String,
      },
      type: {
        type: Schema.Types.ObjectId,
        ref: "Data-Type",
      },
      fields: [
          {
            type: Schema.Types.ObjectId,
            ref: "Data-Fields",
          }
      ],
      standard:{
        type : Boolean,
      },
      ou:{
        type: Schema.Types.ObjectId,
        ref: "Organizational-Unit",
      },
      active: {
        type: Boolean,
      },
    },
    { strict: false , timestamps:true}
  );