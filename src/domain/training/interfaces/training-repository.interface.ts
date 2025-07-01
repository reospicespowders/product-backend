import { TrainingProgram, UpdateTrainingProgram } from "../dto/training.dto";


export interface TrainingRepository {
  removeCourseFromProgram(_id: string, programId: string): Promise<any>;
  //Create Training
  create(Training: TrainingProgram): Promise<TrainingProgram>;

  //Update Training
  update(Training: UpdateTrainingProgram): Promise<TrainingProgram>;

  //Delete Training
  delete(_id: string): Promise<any>;

  //Get All Training
  getAll(page: number, offset: number): Promise<TrainingProgram[]>;

  //Get All Training Aggregated
  getAggregatedTrainingPrograms(query: any, page: number, offset: number): Promise<TrainingProgram[]>;

  //Get Training by ID
  getOne(_id: string): Promise<TrainingProgram>;

  //get merged Courses & Training Program
  getMergedTrainingProgramAndCourses(page: number, offset: number, filter: any): Promise<any>;

  //Get Training by ID without any field populated
  getOneSimple(_id: string): Promise<any>

  getTrainingProgramAttendees(_id: string): Promise<any>

}
