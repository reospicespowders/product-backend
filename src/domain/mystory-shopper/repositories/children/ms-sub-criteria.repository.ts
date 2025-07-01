import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { MSSubCriteria } from "../../dto/children/ms-sub-criteria.dto";
import { MSSubCriteriaRepository } from "../../interfaces/children/ms-sub-criteria-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *MSSubCriteria Repository
 *
 * @export
 * @class MSSubCriteriaRepositoryImpl
 * @implements {MSSubCriteriaRepository}
 */
@Injectable()
export class MSSubCriteriaRepositoryImpl implements MSSubCriteriaRepository {

    /**
     * Creates an instance of MSSubCriteriaRepositoryImpl.
     * @param {Model<MSSubCriteria>} msSubCriteriaModel
     * @memberof MSSubCriteriaRepositoryImpl
     */
    constructor(@InjectModel('ms-sub-criteria') private readonly msSubCriteriaModel: Model<MSSubCriteria>) { }

    async create(msSubCriteriaDto: MSSubCriteria): Promise<MSSubCriteria> {
        const createdMSSubCriteria = new this.msSubCriteriaModel(msSubCriteriaDto);
        return createdMSSubCriteria.save();
    }

    async findById(id: string): Promise<MSSubCriteria | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msSubCriteriaModel.findById(id).exec();
    }

    async findAll(page: number, size: number, tags: string[]): Promise<any> {
        const skip = (page - 1) * size;
        return await this.msSubCriteriaModel.find().skip(skip).limit(size).exec();
    }   

    async update(id: string, msSubCriteriaDto: MSSubCriteria): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msSubCriteriaModel.updateOne({ _id: id }, { $set: msSubCriteriaDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msSubCriteriaModel.deleteOne({ _id: id });
    }
}