import mongoose, { Types, Model, UpdateWriteOpResult } from "mongoose";
import { MSVendorCompanyDto } from "../dto/ms-vendor-company.dto";
import { MSVendorCompanyRepository } from "../interfaces/ms-vendor-company-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *Assessment Repository
 *
 * @export
 * @class MSVendorCompanyRepositoryImpl
 * @implements {MSVendorCompanyRepository}
 */
@Injectable()
export class MSVendorCompanyRepositoryImpl implements MSVendorCompanyRepository {

    /**
     * Creates an instance of MSVendorCompanyRepositoryImpl.
     * @param {Model<MSVendorCompany>} msVendorCompanyModel
     * @memberof MSVendorCompanyRepositoryImpl
     */
    constructor(@InjectModel('ms-vendor-company') private readonly msVendorCompanyModel: Model<MSVendorCompanyDto>) { }

    async create(msVendorCompanyDto: MSVendorCompanyDto): Promise<MSVendorCompanyDto> {
        const createdQuestionBank = new this.msVendorCompanyModel(msVendorCompanyDto);
        return createdQuestionBank.save();
    }

    async findById(id: string): Promise<MSVendorCompanyDto | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msVendorCompanyModel.findById(id).populate('vendors').exec();
    }

    async findByName(name: string): Promise<MSVendorCompanyDto | null> {
        return this.msVendorCompanyModel.findOne({ name }).populate('vendors').exec();
    }

    async findAll(): Promise<MSVendorCompanyDto[]> {
        return this.msVendorCompanyModel.find().populate('vendors').exec();
    }

    async update(id: string, msVendorCompanyDto: MSVendorCompanyDto): Promise<UpdateWriteOpResult> {
        return this.msVendorCompanyModel.updateOne({ _id: id }, { $set: msVendorCompanyDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msVendorCompanyModel.deleteOne({ _id : id });
    }
}