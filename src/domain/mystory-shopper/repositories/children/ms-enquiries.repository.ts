import mongoose, { Model, UpdateWriteOpResult, isValidObjectId } from "mongoose";
import { MSEnquiry } from "../../dto/children/ms-enquiries.dto";
import { MSEnquiryRepository } from "../../interfaces/children/ms-enquiries-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *MSEnquiry Repository
 *
 * @export
 * @class MSEnquiryRepositoryImpl
 * @implements {MSEnquiryRepository}
 */
@Injectable()
export class MSEnquiryRepositoryImpl implements MSEnquiryRepository {

    /**
     * Creates an instance of MSEnquiryRepositoryImpl.
     * @param {Model<MSEnquiry>} msEnquiryModel
     * @memberof MSEnquiryRepositoryImpl
     */
    constructor(@InjectModel('ms-enquiry') private readonly msEnquiryModel: Model<MSEnquiry>) { }

    getByProject(page: number, size: number, projectId: string): Promise<MSEnquiry[]> {
        const skip = (page - 1) * size;
        const pipeline = [
            {
                '$match': {
                    'projectId': new mongoose.Types.ObjectId(projectId)
                }
            },
            {
                '$lookup': {
                    'from': 'ms-factors', 
                    'localField': 'factorId', 
                    'foreignField': '_id', 
                    'as': 'factorId',
                }
            },
            {
                '$unwind': {
                    'path': '$factorId',
                    'preserveNullAndEmptyArrays': false
                }
            },
            {
                '$addFields': {
                    'dataUpdated': {
                        '$convert': {
                            'input': '$serviceUrl', 
                            'to': 'int', 
                            'onError': null, 
                            'onNull': null
                        }
                    }
                }
            },
            {
                '$lookup': {
                    'from': 'data', 
                    'localField': 'dataUpdated', 
                    'foreignField': 'id', 
                    'as': 'dataUpdated', 
                    'pipeline': [
                        {
                            '$project': {
                                'updatedAt': 1
                            }
                        }
                    ]
                }
            },
            {
                '$addFields': {
                    'dataUpdated': {
                        '$first': '$dataUpdated.updatedAt'
                    }
                }
            },
            {
                '$addFields': {
                    'ChangeInService': {
                        '$gt': [
                            '$dataUpdated', '$createdAt'
                        ]
                    }
                }
            },
            {
                '$skip': Number(skip)
            },
            {
                '$limit': Number(size)
            }
            
        ];
    
        return this.msEnquiryModel.aggregate(pipeline).exec();
    }

    async create(msEnquiryDto: MSEnquiry): Promise<MSEnquiry> {
        const createdMSEnquiry = new this.msEnquiryModel(msEnquiryDto);
        return createdMSEnquiry.save();
    }

    async findById(id: string): Promise<MSEnquiry | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msEnquiryModel.findById(id).exec();
    }

    async findAll(page: number, size: number, tags: string[]): Promise<any> {
        const skip = (page - 1) * size;
        let query = {};
        if (tags.length > 0) {
            const projectIds = tags.filter(tag => isValidObjectId(tag)).map(tag => new mongoose.Types.ObjectId(tag));
            query = { 'projectId': { '$in': projectIds } };
        }
        return await this.msEnquiryModel.find(query).skip(skip).limit(size).populate('factorId').exec();
    }

    async update(id: string, msEnquiryDto: MSEnquiry): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msEnquiryModel.updateOne({ _id: id }, { $set: msEnquiryDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msEnquiryModel.deleteOne({ _id: id });
    }
}