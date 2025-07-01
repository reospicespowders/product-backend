//Database
import { IntersectionType } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class TrainingProgram {
  title: string;
  courses: any[];
  description: string;
  status: string;
  type: Types.ObjectId;
  ous: string[];
  start_date : string;
  end_date :string;
  attendees: string[];
  conditions:any;
}

export class UpdateTrainingProgram extends IntersectionType(TrainingProgram) {
  _id: string;
}
