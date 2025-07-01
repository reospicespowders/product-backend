import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { MSMeasuringType } from "../../dto/children/ms-measuring-types.dto";
import { MSMeasuringTypeRepository } from "../../interfaces/children/ms-measuring-type-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *MSMeasuringType Repository
 *
 * @export
 * @class MSMeasuringTypeRepositoryImpl
 * @implements {MSMeasuringTypeRepository}
 */
@Injectable()
export class MSMeasuringTypeRepositoryImpl implements MSMeasuringTypeRepository {

    /**
     * Creates an instance of MSMeasuringTypeRepositoryImpl.
     * @param {Model<MSMeasuringType>} msMeasuringTypeModel
     * @memberof MSMeasuringTypeRepositoryImpl
     */
    constructor(@InjectModel('ms-criteria') private readonly msMeasuringTypeModel: Model<MSMeasuringType>) { }

    async create(msMeasuringTypeDto: MSMeasuringType): Promise<MSMeasuringType> {
        const createdMSMeasuringType = new this.msMeasuringTypeModel(msMeasuringTypeDto);
        return createdMSMeasuringType.save();
    }

    async findById(id: string): Promise<MSMeasuringType | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msMeasuringTypeModel.findById(id).exec();
    }

    async findAll(page: number, size: number, tags: string[]): Promise<any> {
        const skip = (page - 1) * size;
        return await this.msMeasuringTypeModel.find().skip(skip).limit(size).exec();
    }   

    async update(id: string, msMeasuringTypeDto: MSMeasuringType): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msMeasuringTypeModel.updateOne({ _id: id }, { $set: msMeasuringTypeDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msMeasuringTypeModel.deleteOne({ _id: id });
    }
}