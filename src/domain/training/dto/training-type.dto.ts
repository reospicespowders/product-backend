//Database
import { IntersectionType } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class TrainingType {
  name : string;
  arabic : string
  icon : string
  active : boolean
  permissions : Object
  number_of_sessions : number
  allowed_ou : string[]
}

class TrainingTypeWithId {
  _id: Types.ObjectId;
}

class permissions {
  online_session : boolean;
  onside_session : boolean;
  video_session : boolean;
  add_assessment : boolean;
  add_survey : boolean;
}

export class UpdateTrainingType extends IntersectionType(TrainingType,TrainingTypeWithId,) {}
