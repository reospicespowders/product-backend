import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { AssessmentGroup } from "../dto/assessment-group.dto";
import { AssessmentGroupRepository } from "../interfaces/assessment-group-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *AssessmentGroup Repository
 *
 * @export
 * @class AssessmentGroupRepositoryImpl
 * @implements {AssessmentGroupRepository}
 */
@Injectable()
export class AssessmentGroupRepositoryImpl implements AssessmentGroupRepository {

    /**
     * Creates an instance of AssessmentGroupRepositoryImpl.
     * @param {Model<AssessmentGroup>} assessmentGroupModel
     * @memberof AssessmentGroupRepositoryImpl
     */
    constructor(@InjectModel('assessment-groups') private readonly assessmentGroupModel: Model<AssessmentGroup>) { }

    async create(assessmentGroupDto: AssessmentGroup): Promise<AssessmentGroup> {
        const createdAssessmentGroup = new this.assessmentGroupModel(assessmentGroupDto);
        return createdAssessmentGroup.save();
    }

    async findById(id: string): Promise<AssessmentGroup | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.assessmentGroupModel.findById(id).exec();
    }

    async findAll(): Promise<any> {
        return await this.assessmentGroupModel.find().exec();
    }   

    async update(id: string, assessmentGroupDto: AssessmentGroup): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.assessmentGroupModel.updateOne({ _id: id }, { $set: assessmentGroupDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.assessmentGroupModel.deleteOne({ _id: id });
    }
}