import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { MSProject } from "../dto/ms-project.dto";
import { MSProjectRepository } from "../interfaces/ms-project-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";
import { MSChannel } from "../dto/ms-channel.dto";


/**
 *MSProject Repository
 *
 * @export
 * @class MSProjectRepositoryImpl
 * @implements {MSProjectRepository}
 */
@Injectable()
export class MSProjectRepositoryImpl implements MSProjectRepository {

    /**
     * Creates an instance of MSProjectRepositoryImpl.
     * @param {Model<MSProject>} msProjectModel
     * @memberof MSProjectRepositoryImpl  
     */
    constructor(
        @InjectModel('ms-project') private readonly msProjectModel: Model<MSProject>,
        @InjectModel('ms-channel') private readonly msChannelModel: Model<MSChannel>,
    ) { }

    async getVendorProjects(vendorId: string, page: number, size: number): Promise<any> {
        const skip = (page - 1) * size;
        const data = await this.msProjectModel.aggregate([
            { $match: { $or: [{ vendor: { $in: [new mongoose.Types.ObjectId(vendorId)] } },  { internalPm: new mongoose.Types.ObjectId(vendorId) }] }},
            {
              '$sort': {
                'createdAt': -1
              }
            }, {
              '$skip': Number(skip)
            }, {
              '$limit': Number(size)
            }, {
              '$lookup': {
                'from': 'ms-steps', 
                'localField': '_id', 
                'foreignField': 'projectId', 
                'as': 'steps', 
                'pipeline': [
                  {
                    '$sort': {
                      'createdAt': -1
                    }
                  }, {
                    '$group': {
                      '_id': '$step', 
                      'latestItem': {
                        '$first': '$$ROOT'
                      }
                    }
                  }, {
                    '$replaceRoot': {
                      'newRoot': '$latestItem'
                    }
                  }
                ]
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'vendor', 
                'foreignField': '_id', 
                'as': 'vendor'
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'internalPm', 
                'foreignField': '_id', 
                'as': 'internalPm'
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'responsibles.user', 
                'foreignField': '_id', 
                'as': 'responsibles_user', 
                'pipeline': [
                  {
                    '$unset': [
                      'password', 'browsers', 'accessToken', 'resetPassword', 'active'
                    ]
                  }
                ]
              }
            }, {
              '$addFields': {
                'responsibles': {
                  '$map': {
                    'input': '$responsibles_user', 
                    'as': 'user', 
                    'in': {
                      '$mergeObjects': [
                        '$$user', {
                          '$arrayElemAt': [
                            {
                              '$filter': {
                                'input': '$responsibles', 
                                'cond': {
                                  '$eq': [
                                    '$$this.user', '$$user._id'
                                  ]
                                }
                              }
                            }, 0
                          ]
                        }
                      ]
                    }
                  }
                }
              }
            }, {
              '$unset': 'responsibles_user'
            }
          ]);
        let totalCount = await this.msProjectModel.countDocuments({ $or: [{ vendor: { $in: [new mongoose.Types.ObjectId(vendorId)] }} , { internalPm: new mongoose.Types.ObjectId(vendorId) }] });
        return { data, totalCount };
    }

    async create(msProjectDto: MSProject): Promise<MSProject> {
        const createdMSProject = new this.msProjectModel(msProjectDto);
        return createdMSProject.save();
    }

    async findById(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        let data = await this.msProjectModel.findOne({ _id: id }).populate(["vendor", "internalPm", "responsibles.user"]).exec();
        let channels = await this.msChannelModel.find({ projectId: id });
        return { data, channels };
    }

    async findAll(page: number, size: number, tags: string[]): Promise<any> {
        let match:any = {};
        if (!tags.includes('MASTER_TAG')) {
            match['tag_details.tag'] = { '$in': tags };
        }
        const skip = (page - 1) * size;
        const data = await this.msProjectModel.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$skip': Number(skip)
          }, {
            '$limit': Number(size)
          }, {
            '$lookup': {
              'from': 'survey-tags', 
              'localField': 'tag', 
              'foreignField': '_id', 
              'as': 'tag_details'
            }
          }, {
            '$match': match
          }, {
            '$lookup': {
              'from': 'ms-steps', 
              'localField': '_id', 
              'foreignField': 'projectId', 
              'as': 'steps', 
              'pipeline': [
                {
                  '$sort': {
                    'createdAt': -1
                  }
                }, {
                  '$group': {
                    '_id': '$step', 
                    'latestItem': {
                      '$first': '$$ROOT'
                    }
                  }
                }, {
                  '$replaceRoot': {
                    'newRoot': '$latestItem'
                  }
                }
              ]
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'vendor', 
              'foreignField': '_id', 
              'as': 'vendor'
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'internalPm', 
              'foreignField': '_id', 
              'as': 'internalPm'
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'responsibles.user', 
              'foreignField': '_id', 
              'as': 'responsibles_user', 
              'pipeline': [
                {
                  '$unset': [
                    'password', 'browsers', 'accessToken', 'resetPassword', 'active'
                  ]
                }
              ]
            }
          }, {
            '$addFields': {
              'responsibles': {
                '$map': {
                  'input': '$responsibles_user', 
                  'as': 'user', 
                  'in': {
                    '$mergeObjects': [
                      '$$user', {
                        '$arrayElemAt': [
                          {
                            '$filter': {
                              'input': '$responsibles', 
                              'cond': {
                                '$eq': [
                                  '$$this.user', '$$user._id'
                                ]
                              }
                            }
                          }, 0
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }, {
            '$unset': 'responsibles_user'
          }
        ]);

        let totalCount = await this.msProjectModel.countDocuments();
        return { data, totalCount };
    }

    async update(id: string, msProjectDto: MSProject): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msProjectModel.updateOne({ _id: id }, { $set: msProjectDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msProjectModel.deleteOne({ _id: id });
    }
}