import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { MSFactor } from "../../dto/children/ms-factors.dto";
import { MSFactorRepository } from "../../interfaces/children/ms-factors-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";
import { MSFactorResponsible } from "../../dto/children/ms-factor-responsible.dto";
import { MSFactorLogs } from "../../dto/ms-factor-logs.dto";
import { MSFactorStatusUpdateDto } from "../../dto/children/ms-factor-status-update.dto";


/**
 *MSFactor Repository
 *
 * @export
 * @class MSFactorRepositoryImpl
 * @implements {MSFactorRepository}
 */
@Injectable()
export class MSFactorRepositoryImpl implements MSFactorRepository {

    /**
     * Creates an instance of MSFactorRepositoryImpl.
     * @param {Model<MSFactor>} msFactorModel
     * @memberof MSFactorRepositoryImpl
     */
    constructor(
        @InjectModel('ms-factor') private readonly msFactorModel: Model<MSFactor>,
        @InjectModel('ms-factor-responsible') private readonly msFactorResponsibleModel: Model<MSFactorResponsible>,
        @InjectModel('ms-factor-logs') private readonly msFactorLogsModel: Model<MSFactorLogs>
    ) { }


    async updateResponsible(dto: MSFactorResponsible): Promise<void> {
        let oldData: any;
        if (dto.branchId) {
            oldData = await this.msFactorResponsibleModel.findOne({ factorId: dto.factorId, branchId: dto.branchId, channelId: dto.channelId })
        } else {
            oldData = await this.msFactorResponsibleModel.findOne({ factorId: dto.factorId, channelId: dto.channelId })
        }
        if (oldData) {
            await this.msFactorResponsibleModel.updateOne({ _id: oldData._id }, { $set: { responsible: dto.responsible } })
        } else {
            await this.msFactorResponsibleModel.create(dto);
        }
    }


    public async assignResponsible(dtos: MSFactorResponsible[]): Promise<void> {
        for (let dto of dtos) {
            this.updateResponsible(dto);
        }
    }

    public async updateFactorStatus(factorStatusData: MSFactorStatusUpdateDto[], userId: string): Promise<void> {
        for (let factorStatus of factorStatusData) {
            let oldFactor: any;
            if (factorStatus.branchId) {
                oldFactor = await this.msFactorResponsibleModel.findOne({ factorId: factorStatus.factorId, branchId: factorStatus.branchId, channelId: factorStatus.channelId })
            } else {
                oldFactor = await this.msFactorResponsibleModel.findOne({ factorId: factorStatus.factorId, channelId: factorStatus.channelId })
            }
            if (oldFactor.status != factorStatus.status) {
                let factorLog: MSFactorLogs = {
                    comments: factorStatus.comments,
                    status: factorStatus.status,
                    factorId: factorStatus.factorId,
                    userId: userId,
                    oldStatus: oldFactor.status
                }
                await this.msFactorLogsModel.create(factorLog);
            }
            if (factorStatus.branchId) {
                await this.msFactorResponsibleModel.updateOne({ factorId: factorStatus.factorId, branchId: factorStatus.branchId, channelId: factorStatus.channelId }, { $set: { status: factorStatus.status, rsComments: factorStatus.comments } })
            } else {
                await this.msFactorResponsibleModel.updateOne({ factorId: factorStatus.factorId, channelId: factorStatus.channelId }, { $set: { status: factorStatus.status, rsComments: factorStatus.comments } })
            }

        }
    }

    public async updateFactorStatusApproval(factorStatusData: MSFactorStatusUpdateDto, userId: string): Promise<void> {
        let oldFactor: any;
        if (factorStatusData.branchId) {
            oldFactor = await this.msFactorResponsibleModel.findOne({ factorId: factorStatusData.factorId, branchId: factorStatusData.branchId, channelId: factorStatusData.channelId })
        } else {
            oldFactor = await this.msFactorResponsibleModel.findOne({ factorId: factorStatusData.factorId, channelId: factorStatusData.channelId })
        }
        let factorStatus: any = factorStatusData.approvalStatus;
        if (oldFactor.approvalStatus != factorStatusData.approvalStatus) {
            let factorLog: MSFactorLogs = {
                comments: factorStatusData.comments,
                status: factorStatus,
                factorId: factorStatusData.factorId,
                userId: userId,
                oldStatus: oldFactor.approvalStatus
            }
            await this.msFactorLogsModel.create(factorLog);
        }
        if (factorStatusData.branchId) {
            await this.msFactorResponsibleModel.updateOne({ factorId: factorStatusData.factorId, branchId: factorStatusData.branchId, channelId: factorStatusData.channelId }, { $set: { approvalStatus: factorStatusData.approvalStatus, approvalComments: factorStatusData.comments, repeat: factorStatusData.repeat } })
        } else {
            await this.msFactorResponsibleModel.updateOne({ factorId: factorStatusData.factorId, channelId: factorStatusData.channelId }, { $set: { approvalStatus: factorStatusData.approvalStatus, approvalComments: factorStatusData.comments, repeat: factorStatusData.repeat } })
        }
    }

    /**
     *Get dashboard data for each project
     *
     * @param {string} projectId
     * @return {*}  {Promise<any>}
     * @memberof MSFactorRepositoryImpl
     */
    async getForDashboard(projectId: string): Promise<any> {
        let pipe = [
            {
              '$match': {
                'projectId': new mongoose.Types.ObjectId(projectId)
              }
            },  {
                '$lookup': {
                  'from': 'ms-sub-criterias', 
                  'localField': 'subCriteriaId', 
                  'foreignField': '_id', 
                  'as': 'subCriteria', 
                  'pipeline': [
                    {
                      '$lookup': {
                        'from': 'ms-criterias', 
                        'localField': 'criteriaId', 
                        'foreignField': '_id', 
                        'as': 'mainCriteria', 
                        'pipeline': [
                          {
                            '$lookup': {
                              'from': 'ms-channels', 
                              'localField': 'channel', 
                              'foreignField': '_id', 
                              'as': 'channel'
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }, {
                '$addFields': {
                  'subCriteria': {
                    '$ifNull': [
                      {
                        '$first': '$subCriteria'
                      }, null
                    ]
                  }
                }
              }, {
                '$addFields': {
                  'criteria': {
                    '$ifNull': [
                      {
                        '$first': '$subCriteria.mainCriteria'
                      }, null
                    ]
                  }
                }
              }, {
                '$addFields': {
                  'channel': {
                    '$ifNull': [
                      {
                        '$first': '$criteria.channel'
                      }, null
                    ]
                  }
                }
              }, {
                '$project': {
                  'projectId': 1, 
                  'subCriteriaId': 1, 
                  'factor': 1, 
                  'measuringType': 1, 
                  'repeat': 1, 
                  'status': 1, 
                  'createdAt': 1, 
                  'updatedAt': 1, 
                  'subCriteria': {
                    '_id': 1, 
                    'criteria': 1
                  }, 
                  'criteria': {
                    '_id': 1, 
                    'criteria': 1
                  }, 
                  'channel': 1
                }
              }, {
                '$lookup': {
                  'from': 'ms-factor-responsibles', 
                  'let': {
                    'factorId': '$_id', 
                    'projectId': '$projectId'
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
                                '$projectId', '$$projectId'
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
                '$unwind': {
                  'path': '$factorResponsible', 
                  'preserveNullAndEmptyArrays': true
                }
              }, {
                '$addFields': {
                  'branchId': {
                    '$ifNull': [
                      '$factorResponsible.branchId', null
                    ]
                  }, 
                  'status': {
                    '$ifNull': [
                      '$factorResponsible.status', '$status'
                    ]
                  }
                }
              }, {
                '$lookup': {
                  'from': 'ms-evaluations', 
                  'localField': 'projectId', 
                  'foreignField': 'projectId', 
                  'let': {
                    'set_id': '$_id', 
                    'channel': '$channel._id'
                  }, 
                  'as': 'eval', 
                  'pipeline': [
                    {
                      '$unwind': {
                        'path': '$factors'
                      }
                    }, {
                      '$addFields': {
                        'match_id': '$$set_id', 
                        'match_channel': '$channel'
                      }
                    }, {
                      '$match': {
                        '$expr': {
                          '$and': [
                            {
                              '$eq': [
                                '$match_id', '$factors._id'
                              ]
                            }, {
                              '$eq': [
                                '$match_channel', '$channel'
                              ]
                            }
                          ]
                        }
                      }
                    }, {
                      '$addFields': {
                        'factors.branchId': '$branch'
                      }
                    }, {
                      '$replaceRoot': {
                        'newRoot': '$factors'
                      }
                    }
                  ]
                }
              }, {
                '$unwind': {
                  'path': '$eval'
                }
              }, {
                '$addFields': {
                  'branchId': '$eval.branchId'
                }
              }, {
                '$group': {
                  '_id': {
                    '_id': '$_id', 
                    'projectId': '$projectId', 
                    'subCriteriaId': '$subCriteriaId', 
                    'branchId': '$branchId'
                  }, 
                  'newRoot': {
                    '$first': '$$ROOT'
                  }, 
                  'eval': {
                    '$push': '$eval'
                  }
                }
              }, {
                '$addFields': {
                  'newRoot.eval': '$eval'
                }
              }, {
                '$replaceRoot': {
                  'newRoot': '$newRoot'
                }
              }, {
                '$addFields': {
                  'eval': {
                    '$cond': {
                      'if': {
                        '$eq': [
                          {
                            '$size': {
                              '$ifNull': [
                                '$eval', []
                              ]
                            }
                          }, 0
                        ]
                      }, 
                      'then': 0, 
                      'else': {
                        '$multiply': [
                          {
                            '$divide': [
                              {
                                '$sum': '$eval.grade'
                              }, {
                                '$size': '$eval'
                              }
                            ]
                          }, 20
                        ]
                      }
                    }
                  }, 
                  'msComments': '$eval.msComments'
                }
              }, {
                '$lookup': {
                  'from': 'ms-projects', 
                  'localField': 'projectId', 
                  'foreignField': '_id', 
                  'as': 'cutoff', 
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
                  'cutoff': {
                    '$ifNull': [
                      {
                        '$first': '$cutoff.factorCutOffPercentage'
                      }, 3
                    ]
                  }
                }
              }, {
                '$addFields': {
                  'cutoff': {
                    '$multiply': [
                      '$cutoff', 20
                    ]
                  }
                }
              }, {
                '$match': {
                  '$expr': {
                    '$lt': [
                      '$eval', '$cutoff'
                    ]
                  }
                }
              }, {
                '$lookup': {
                  'from': 'ms-channels', 
                  'localField': 'branchId', 
                  'foreignField': '_id', 
                  'as': 'branchDetails', 
                  'pipeline': [
                    {
                      '$lookup': {
                        'from': 'organization-units', 
                        'localField': 'branchId', 
                        'foreignField': '_id', 
                        'as': 'details', 
                        'pipeline': [
                          {
                            '$lookup': {
                              'from': 'locations', 
                              'localField': 'location', 
                              'foreignField': '_id', 
                              'as': 'location', 
                              'pipeline': [
                                {
                                  '$project': {
                                    'name': 1
                                  }
                                }
                              ]
                            }
                          }, {
                            '$unwind': {
                              'path': '$location'
                            }
                          }
                        ]
                      }
                    }, {
                      '$unwind': {
                        'path': '$details'
                      }
                    }
                  ]
                }
              }, {
                '$addFields': {
                  'branchDetails': {
                    '$first': '$branchDetails'
                  }
                }
              }, {
                '$facet': {
                  'data': [], 
                  'counts': [
                    {
                      '$group': {
                        '_id': '$status', 
                        'count': {
                          '$count': {}
                        }
                      }
                    }, {
                      '$project': {
                        'title': '$_id', 
                        'count': 1
                      }
                    }, {
                      '$unset': '_id'
                    }
                  ]
                }
              }
            ]
        return this.msFactorModel.aggregate(pipe);
    }

    async create(msFactorDto: MSFactor): Promise<MSFactor> {
        const createdMSFactor = new this.msFactorModel(msFactorDto);
        return createdMSFactor.save();
    }

    async findById(id: string): Promise<MSFactor | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msFactorModel.findById(id).exec();
    }

    async findAll(page: number, size: number, projectId: string): Promise<any> {
        const skip = (page - 1) * size;
        let query = {};
        query = { 'projectId': new mongoose.Types.ObjectId(projectId) }
        return await this.msFactorModel.find(query).skip(skip).limit(size).populate('subCriteriaId').exec();
    }

    async update(id: string, msFactorDto: MSFactor): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msFactorModel.updateOne({ _id: id }, { $set: msFactorDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.msFactorModel.deleteOne({ _id: id });
    }
}