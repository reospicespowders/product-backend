import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { MSChannel } from "../dto/ms-channel.dto";
import { MSChannelRepository } from "../interfaces/ms-channel-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *MSChannel Repository
 *
 * @export
 * @class MSChannelRepositoryImpl
 * @implements {MSChannelRepository}
 */
@Injectable()
export class MSChannelRepositoryImpl implements MSChannelRepository {

    /**
     * Creates an instance of MSChannelRepositoryImpl.
     * @param {Model<MSChannel>} msChannelModel
     * @memberof MSChannelRepositoryImpl
     */
    constructor(@InjectModel('ms-channel') private readonly msChannelModel: Model<MSChannel>) { }



    async createMany(msChannelDto: MSChannel[]): Promise<MSChannel[]> {
        await this.msChannelModel.deleteMany({ projectId: msChannelDto[0].projectId });
        return this.msChannelModel.create(msChannelDto);
    }

    findByProjectId(id: string): Promise<MSChannel[]> {
        return this.msChannelModel.find({ projectId: id })
    }

    async create(msChannelDto: MSChannel): Promise<MSChannel> {
        const createdMSChannel = new this.msChannelModel(msChannelDto);
        return createdMSChannel.save();
    }

    async findById(id: string): Promise<MSChannel | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msChannelModel.findById(id).exec();
    }

    async findAll(page: number, size: number, tags: string[]): Promise<any> {
        const skip = (page - 1) * size;
        return await this.msChannelModel.find().skip(skip).limit(size).exec();
    }

    async update(id: string, msChannelDto: MSChannel): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msChannelModel.updateOne({ _id: id }, { $set: msChannelDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msChannelModel.deleteOne({ _id: id });
    }

    async getChannelsWithCriterias(id: string, page: number, size: number) {
        const skip = (page - 1) * size;
        let pipe = [
            {
                '$match': {
                    'projectId': new mongoose.Types.ObjectId(id)
                }
            }, {
                '$limit': Number(size)
            }, {
                '$skip': Number(skip)
            }, {
                '$lookup': {
                    'from': 'ms-criterias',
                    'localField': '_id',
                    'foreignField': 'channel',
                    'as': 'criterias'
                }
            }
        ];
        return this.msChannelModel.aggregate(pipe);
    }

    async getVisitProjectId(id: string,sessionId:string) {

        // console.log('sessionId',sessionId)

        let pipe = [
            {
            '$match': {
                'projectId': new mongoose.Types.ObjectId(id)
            }
            }, {
            '$match': {
                'type': 'Basic'
            }
            },{
            '$addFields': {
                'sessionId': new mongoose.Types.ObjectId(sessionId)
            }
            }, {
            '$lookup': {
                'from': 'ms-sessions', 
                'localField': 'sessionId', 
                'foreignField': '_id', 
                'let': {
                'channel': '$_id', 
                'branch': '$branchId', 
                'channelName': '$name', 
                'channelType': '$type'
                }, 
                'as': 'CountofCreatedSessionforChannel', 
                'pipeline': [
                {
                    '$unwind': {
                    'path': '$visits.data'
                    }
                }, {
                    '$addFields': {
                    'channelMatch': {
                        '$eq': [
                        '$visits.data.channel', '$$channel'
                        ]
                    }, 
                    'branchMatch': {
                        '$eq': [
                        '$visits.data.branch', '$$branch'
                        ]
                    }, 
                    'channelName': '$$channelName', 
                    'channelType': '$$channelType'
                    }
                }, {
                    '$match': {
                    '$expr': {
                        '$and': [
                        '$channelMatch'
                        ]
                    }
                    }
                }, {
                    '$addFields': {
                    'visits.data.channelMatch': '$channelMatch', 
                    'visits.data.branchMatch': '$branchMatch'
                    }
                }, {
                    '$replaceRoot': {
                    'newRoot': '$visits.data'
                    }
                }
                ]
            }
        }
        ]
        return this.msChannelModel.aggregate(pipe);
    }
}