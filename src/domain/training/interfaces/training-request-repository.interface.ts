import { UpdateWriteOpResult } from 'mongoose';
import { TrainingRequest, UpdateTrainingRequest } from '../dto/training-request.dto';

export interface TrainingRequestRepository {
  deleteAll(courses: any[]): Promise<any>;
  //Create TrainingRequest
  create(TrainingRequest: TrainingRequest): Promise<TrainingRequest>;

  //Update TrainingRequest
  update(TrainingRequest: any): Promise<TrainingRequest>;

  //Delete TrainingRequest
  delete(_id: any): Promise<any>;

  //Get All TrainingRequest
  getAll(page: number, offset: string, filter: TrainingRequest): Promise<TrainingRequest[]>;

  updateField(trainingRequests: any): Promise<UpdateWriteOpResult>;

  //get all for new branch training
  getNewBranchTrainings(filter: any, selection: any): Promise<TrainingRequest[]>

  //Get All TrainingRequest
  getAllAggregated(page: number, offset: number, filter: TrainingRequest): Promise<TrainingRequest[]>;

  //Get All TrainingRequest
  getAllAggregatedV2(page: number, offset: number, filter: TrainingRequest): Promise<TrainingRequest[]>;

  getAllAggregatedV2Count(query: any): Promise<number>;


  //Get TrainingRequest by ID
  getOne(_id: string): Promise<TrainingRequest>;

  //get training requests for crown
  getAllForCrown(filter: any): Promise<TrainingRequest[]>

  //count documents
  countDocuments(query: any): Promise<number>;


  //get graph data
  getGraphData(data: any): Promise<any>;

  //get graph users

  getGraphDataUsers(data: any): Promise<any>;


  getTopThree(data: any): Promise<any[]>

  getTopTopics(data: any): Promise<any[]>

  getTotalAndCompleted(data: any): Promise<any[]>


  getSkillTrainingData(data: any): Promise<any[]>

  getCalendar(query): Promise<any>

  //get completed training of published status
  getCompletedTrainingsOfPublishedStatus(): Promise<any>


  generateWeelyTraining(): Promise<any>

  rejectWeekly(): Promise<any>

  getAllByCourses(courses: string[]): Promise<TrainingRequest[]>;

  getAllByCoursesAndCourses(courses: string[]): Promise<any[]>;

  getUnregisteredUsers(courseId: string): Promise<any>

  updateUnregisteredUsers(courseId, users: string[]): Promise<UpdateWriteOpResult>;

  getMangerImpactTask(id:string, filter:any): Promise<any>;
}
