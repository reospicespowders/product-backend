import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { MSCriteria } from "../../dto/children/ms-criteria.dto";
import { MSCriteriaRepository } from "../../interfaces/children/ms-criteria-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *MSCriteria Repository
 *
 * @export
 * @class MSCriteriaRepositoryImpl
 * @implements {MSCriteriaRepository}
 */
@Injectable()
export class MSCriteriaRepositoryImpl implements MSCriteriaRepository {

    /**
     * Creates an instance of MSCriteriaRepositoryImpl.
     * @param {Model<MSCriteria>} msCriteriaModel
     * @memberof MSCriteriaRepositoryImpl
     */
    constructor(@InjectModel('ms-criteria') private readonly msCriteriaModel: Model<MSCriteria>) { }


    async getByProject(id: string, page: number, size: number): Promise<any> {
        const skip = (page - 1) * size;
        let pipe= [
            {
              '$match': {
                'projectId': new mongoose.Types.ObjectId(id)
              }
            }, {
              '$lookup': {
                'from': 'ms-channels', 
                'localField': 'channel', 
                'foreignField': '_id', 
                'as': 'channel'
              }
            }, {
              '$unwind': {
                'path': '$channel'
              }
            }, {
              '$lookup': {
                'from': 'ms-sub-criterias', 
                'localField': '_id', 
                'foreignField': 'criteriaId', 
                'as': 'sub-criterias', 
                'pipeline': [
                  {
                    '$lookup': {
                      'from': 'ms-factors', 
                      'localField': '_id', 
                      'foreignField': 'subCriteriaId', 
                      'as': 'factors'
                    }
                  }
                ]
              }
            }
          ]
        let data = await this.msCriteriaModel.aggregate(pipe);
        let totalCount = await this.msCriteriaModel.countDocuments({ projectId: id });
        return { data, totalCount };
    }

    async create(msCriteriaDto: MSCriteria): Promise<MSCriteria> {
        const createdMSCriteria = new this.msCriteriaModel(msCriteriaDto);
        return createdMSCriteria.save();
    }

    async findById(id: string): Promise<MSCriteria | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msCriteriaModel.findById(id).exec();
    }

    async findAll(page: number, size: number, tags: string[]): Promise<any> {
        const skip = (page - 1) * size;
        let data = await this.msCriteriaModel.find().skip(skip).limit(size).exec();
        let totalCount = await this.msCriteriaModel.countDocuments();
        return { data, totalCount };
    }

    async update(id: string, msCriteriaDto: MSCriteria): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msCriteriaModel.updateOne({ _id: id }, { $set: msCriteriaDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msCriteriaModel.deleteOne({ _id: id });
    }
}