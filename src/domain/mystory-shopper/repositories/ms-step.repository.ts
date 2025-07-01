import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { MSStep } from "../dto/ms-step.dto";
import { MSStepRepository } from "../interfaces/ms-step-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *MSStep Repository
 *
 * @export
 * @class MSStepRepositoryImpl
 * @implements {MSStepRepository}
 */
@Injectable()
export class MSStepRepositoryImpl implements MSStepRepository {

    /**
     * Creates an instance of MSStepRepositoryImpl.
     * @param {Model<MSStep>} msStepModel
     * @memberof MSStepRepositoryImpl
     */
    constructor(@InjectModel('ms-step') private readonly msStepModel: Model<MSStep>) { }

    async create(msStepDto: MSStep): Promise<MSStep> {
        const createdMSStep = new this.msStepModel(msStepDto);
        return createdMSStep.save();
    }

    async findById(id: string): Promise<MSStep | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msStepModel.findById(id).exec();
    }

    async getByProject(id: string, type: string,vendorType: string): Promise<MSStep | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        if (vendorType == 'internal')
        {
            await this.msStepModel.updateMany({ projectId: id, step: type }, { isViewedInternal: true }).exec();
        }
        else{
            await this.msStepModel.updateMany({ projectId: id, step: type }, { isViewedExternal: true }).exec();
        }
        
        let results = await this.msStepModel.findOne({ projectId: id, step: type }).sort({ createdAt: -1 }).exec();
        return results;
    }

    async getByProjectSession(id: string,sessionId: string ,type: string,vendorType: string): Promise<MSStep | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        if (vendorType == 'internal')
        {
            await this.msStepModel.updateMany({ projectId: id, sessionId: sessionId, step: type }, { isViewedInternal: true }).exec();
        }
        else{
            await this.msStepModel.updateMany({ projectId: id, sessionId: sessionId, step: type }, { isViewedExternal: true }).exec();
        }
        
        let results = await this.msStepModel.findOne({ projectId: id, sessionId: sessionId, step: type }).sort({ createdAt: -1 }).exec();
        return results;
    }

    async getAllByProject(id: string): Promise<any[] | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
    
        const result = await this.msStepModel.aggregate([
            { $match: { projectId: new mongoose.Types.ObjectId(id) } },
            { $sort: { "createdAt": -1 } },
            {
                $group: {
                    _id: "$step",
                    approvalStatus: { $first: "$approvalStatus" },
                }
            },
        ]).exec();
        
        return result;
    }
    
    

    async findAll(page: number, size: number, tags: string[]): Promise<any> {
        const skip = (page - 1) * size;
        return await this.msStepModel.find().skip(skip).limit(size).exec();
    }   

    async update(id: string, msStepDto: MSStep): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msStepModel.updateOne({ _id: id }, { $set: msStepDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msStepModel.deleteOne({ _id: id });
    }
}