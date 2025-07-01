import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { MSEvaluation } from "../dto/ms-evaluation.dto";
import { MSEvaluationRepository } from "../interfaces/ms-evaluation-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *MSEvaluation Repository
 *
 * @export
 * @class MSEvaluationRepositoryImpl
 * @implements {MSEvaluationRepository}
 */
@Injectable()
export class MSEvaluationRepositoryImpl implements MSEvaluationRepository {

  /**
   * Creates an instance of MSEvaluationRepositoryImpl.
   * @param {Model<MSEvaluation>} msEvaluationModel
   * @memberof MSEvaluationRepositoryImpl
   */
  constructor(@InjectModel('ms-evaluation') private readonly msEvaluationModel: Model<MSEvaluation>) { }

  getFactorView(projectId: string, uid: string): Promise<any[]> {
    let uidMatch = {};
    if (uid) {
      uidMatch = {
        "factorResponsible.responsible": new mongoose.Types.ObjectId(uid),
      }
    }
    let pipe =[
        {
          '$match': {
            'projectId': new mongoose.Types.ObjectId(projectId)
          }
        }, {
          '$unwind': {
            'path': '$factors'
          }
        }, {
          '$group': {
            '_id': {
              '_id': '$factors._id', 
              'channel': '$channel', 
              'branch': '$branch', 
              'projectId': '$projectId'
            }, 
            'factor_details': {
              '$push': '$factors'
            }, 
            'visitTime': {
              '$push': '$visitTime'
            }
          }
        }, {
          '$project': {
            '_id': '$_id._id', 
            'factors': {
              'grade': '$factor_details.grade', 
              'percentage': '$factor_details.percentage', 
              'msComments': '$factor_details.msComments'
            }, 
            'channel': '$_id.channel', 
            'projectId': '$_id.projectId', 
            'branch': '$_id.branch', 
            'visitTime': '$visitTime'
          }
        }, {
          '$lookup': {
            'from': 'ms-factors', 
            'localField': '_id', 
            'foreignField': '_id', 
            'as': 'factor_details'
          }
        }, {
          '$lookup': {
            'from': 'ms-channels', 
            'localField': 'channel', 
            'foreignField': '_id', 
            'as': 'channel_details'
          }
        }, {
          '$lookup': {
            'from': 'ms-channels', 
            'localField': 'branch', 
            'foreignField': '_id', 
            'as': 'branch_details'
          }
        }, {
          '$addFields': {
            'factor_details': {
              '$first': '$factor_details'
            }, 
            'channel_details': {
              '$first': '$channel_details'
            }, 
            'branch_details': {
              '$first': '$branch_details'
            }
          }
        }, {
          '$lookup': {
            'from': 'ms-factor-responsibles', 
            'let': {
              'factorId': '$_id', 
              'channelId': '$channel', 
              'projectId': '$projectId', 
              'branchId': '$branch'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$and': [
                      {
                        '$eq': [
                          '$factorId', '$$factorId'
                        ]
                      }, {
                        '$eq': [
                          '$channelId', '$$channelId'
                        ]
                      }, {
                        '$eq': [
                          '$projectId', '$$projectId'
                        ]
                      }, {
                        '$eq': [
                          '$branchId', '$$branchId'
                        ]
                      }
                    ]
                  }
                }
              }
            ], 
            'as': 'factorResponsible'
          }
        }, {
          '$addFields': {
            'factorResponsible': {
              '$first': '$factorResponsible'
            }
          }
        }, {
          '$lookup': {
            'from': 'ms-projects', 
            'localField': 'projectId', 
            'foreignField': '_id', 
            'as': 'factor_cutoff', 
            'pipeline': [
              {
                '$project': {
                  'factorCutOffPercentage': 1
                }
              }
            ]
          }
        }, {
          '$addFields': {
            'factor_cutoff': {
              '$first': '$factor_cutoff.factorCutOffPercentage'
            }
          }
        },
      {
        $match: uidMatch
      },
    ];

    return this.msEvaluationModel.aggregate(pipe);
  }

  getByProject(projectId: string): Promise<MSEvaluation[]> {
    return this.msEvaluationModel.find({ projectId }).populate(['branch', 'channel']);
  }

  async create(msEvaluationDto: MSEvaluation): Promise<MSEvaluation> {
    const createdMSEvaluation = new this.msEvaluationModel(msEvaluationDto);
    return createdMSEvaluation.save();
  }

  async findById(id: string): Promise<MSEvaluation | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return this.msEvaluationModel.findById(id).exec();
  }

  async findAll(page: number, size: number, tags: string[]): Promise<any> {
    const skip = (page - 1) * size;
    let query = {};
    // console.log(tags)
    // if (tags.length > 0) {
    //     const projectIds = tags.filter(tag => isValidObjectId(tag)).map(tag => new mongoose.Types.ObjectId(tag));
    //     query = { 'projectId': { '$in': projectIds } };
    //     // console.log('query')
    // }
    return await this.msEvaluationModel.find(query).skip(skip).limit(size).populate(['branch', 'channel']).exec();
  }

  async update(id: string, msEvaluationDto: MSEvaluation): Promise<UpdateWriteOpResult> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return this.msEvaluationModel.updateOne({ _id: id }, { $set: msEvaluationDto });
  }

  async delete(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return this.msEvaluationModel.deleteOne({ _id: id });
  }
}