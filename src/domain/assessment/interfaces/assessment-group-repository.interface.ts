import { UpdateWriteOpResult } from "mongoose";
import { AssessmentGroup, UpdateAssessmentGroup  } from "../dto/assessment-group.dto";


/**
 *Assessment Group Repository Interface
 *
 * @export
 * @interface AssessmentGroupRepository
 */
export interface AssessmentGroupRepository {
    create(assessmentGroupDto: AssessmentGroup): Promise<AssessmentGroup>;
    
    findById(id: string): Promise<AssessmentGroup | null>;
   
    findAll(): Promise<AssessmentGroup[]>;
  
    update(id: string, assessmentGroupDto: UpdateAssessmentGroup): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
}