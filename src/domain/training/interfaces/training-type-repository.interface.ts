import { TrainingType } from "../dto/training-type.dto";


export interface TrainingTypeRepository {
  //Create TrainingType
  create(TrainingType: TrainingType): Promise<TrainingType>;

  //Update TrainingType
  update(TrainingType: TrainingType): Promise<TrainingType>;

  //Delete TrainingType
  delete(_id: string): Promise<any>;

  //Get All TrainingType
  getAll(page: number, offset: number): Promise<TrainingType[]>;

  //Get TrainingType by ID
  getOne(_id: string): Promise<TrainingType>;

}
