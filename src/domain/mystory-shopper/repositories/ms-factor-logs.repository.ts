import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { MSFactorLogs } from "../dto/ms-factor-logs.dto";
import { MSFactorLogsRepository } from "../interfaces/ms-factor-logs-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *MSFactorLogs Repository
 *
 * @export
 * @class MSFactorLogsRepositoryImpl
 * @implements {MSFactorLogsRepository}
 */
@Injectable()
export class MSFactorLogsRepositoryImpl implements MSFactorLogsRepository {

    /**
     * Creates an instance of MSFactorLogsRepositoryImpl.
     * @param {Model<MSFactorLogs>} msFactorLogsModel
     * @memberof MSFactorLogsRepositoryImpl
     */
    constructor(@InjectModel('ms-factor-logs') private readonly msFactorLogsModel: Model<MSFactorLogs>) { }

    async create(msFactorLogsDto: MSFactorLogs): Promise<MSFactorLogs> {
        const createdMSFactorLogs = new this.msFactorLogsModel(msFactorLogsDto);
        return createdMSFactorLogs.save();
    }

    async findById(id: string): Promise<MSFactorLogs | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msFactorLogsModel.findById(id).exec();
    }

    async getByFactor(id: string): Promise<MSFactorLogs[] | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msFactorLogsModel.find({ factorId: id }).populate(["userId"]).exec();
    }

    async findAll(page: number, size: number, tags: string[]): Promise<any> {
        const skip = (page - 1) * size;
        return await this.msFactorLogsModel.find().skip(skip).limit(size).exec();
    }   

    async update(id: string, msFactorLogsDto: MSFactorLogs): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msFactorLogsModel.updateOne({ _id: id }, { $set: msFactorLogsDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msFactorLogsModel.deleteOne({ _id: id });
    }
}