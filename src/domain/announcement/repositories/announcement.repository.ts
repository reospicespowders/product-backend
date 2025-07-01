import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { Announcement, UpdateAnnouncement } from "../dto/announcement.dto";
import { AnnouncementRepository } from "../interfaces/announcement-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *Announcement Repository
 *
 * @export
 * @class AnnouncementRepositoryImpl
 * @implements {AnnouncementRepository}
 */
@Injectable()
export class AnnouncementRepositoryImpl implements AnnouncementRepository {

    /**
     * Creates an instance of AnnouncementRepositoryImpl.
     * @param {Model<Announcement>} announcementModel
     * @memberof AnnouncementRepositoryImpl
     */
    constructor(@InjectModel('announcement') private readonly announcementModel: Model<Announcement>) { }

    async create(announcementDto: Announcement, uid:string): Promise<Announcement> {
        announcementDto.createdBy = uid;
        console.log(announcementDto);
        const createdAnnouncement = new this.announcementModel(announcementDto);
        return createdAnnouncement.save();
    }

    public async getAllActive(uid: string): Promise<any> {
      var pipe =[
        {
          '$addFields': {
            'currentDate': {
        '$dateAdd': {
          'startDate': '$$NOW', 
          'unit': 'hour', 
          'amount': 3
        }
      }, 
            'startDateT': {
              '$toDate': '$startDate'
            }, 
            'endDateT': {
              '$toDate': '$endDate'
            }
          }
        }, {
          '$addFields': {
            'dateDIff_start': {
              '$dateDiff': {
                'startDate': '$startDateT', 
                'endDate': '$currentDate', 
                'unit': 'second'
              }
            }, 
            'dateDIff_end': {
              '$dateDiff': {
                'startDate': '$endDateT', 
                'endDate': '$currentDate', 
                'unit': 'second'
              }
            }
          }
        }, {
          '$match': {
            'dateDIff_start': {
              '$gt': 0
            }, 
            'dateDIff_end': {
              '$lt': 0
            }
          }
        }, {
          '$addFields': {
            'userId': new mongoose.Types.ObjectId(uid)
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'userId', 
            'foreignField': '_id', 
            'as': 'userOus', 
            'pipeline': [
              {
                '$project': {
                  'ou': 1
                }
              }
            ]
          }
        }, {
          '$unwind': {
            'path': '$userOus'
          }
        }, {
          '$addFields': {
            'userOus': '$userOus.ou'
          }
        }, {
          '$match': {
            '$or': [
              {
                '$expr': {
                  '$gt': [
                    {
                      '$size': {
                        '$setIntersection': [
                          '$userOus', '$ous'
                        ]
                      }
                    }, 0
                  ]
                }
              }, {
                'targetUsers': new mongoose.Types.ObjectId(uid)
              }
            ]
          }
        }, {
          '$match': {
            'seenBy.user': {
              '$ne': new mongoose.Types.ObjectId(uid)
            }
          }
        }, {
          '$limit': 1
        }
      ];
        return await this.announcementModel.aggregate(pipe).exec()
    }

    public async getResults(id: string): Promise<any> {
      var pipe = [
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(id)
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'ous', 
            'foreignField': 'ou', 
            'as': 'target1', 
            'pipeline': [
              {
                '$project': {
                  '_id': 1, 
                  'name': 1, 
                  'email': 1, 
                  'phone': 1, 
                  'gender': 1, 
                  'location': 1, 
                  'image': 1, 
                  'ou': 1
                }
              }, {
                '$lookup': {
                  'from': 'organization-units', 
                  'localField': 'ou', 
                  'foreignField': '_id', 
                  'as': 'ou', 
                  'pipeline': [
                    {
                      '$project': {
                        'name': 1, 
                        'parent': 1, 
                        'image': 1
                      }
                    }
                  ]
                }
              }
            ]
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'targetUsers', 
            'foreignField': '_id', 
            'as': 'target2', 
            'pipeline': [
              {
                '$project': {
                  '_id': 1, 
                  'name': 1, 
                  'email': 1, 
                  'phone': 1, 
                  'gender': 1, 
                  'location': 1, 
                  'image': 1, 
                  'ou': 1
                }
              }, {
                '$lookup': {
                  'from': 'organization-units', 
                  'localField': 'ou', 
                  'foreignField': '_id', 
                  'as': 'ou', 
                  'pipeline': [
                    {
                      '$project': {
                        'name': 1, 
                        'parent': 1, 
                        'image': 1
                      }
                    }
                  ]
                }
              }
            ]
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'seenBy.user', 
            'foreignField': '_id', 
            'as': 'target3', 
            'pipeline': [
              {
                '$project': {
                  '_id': 1, 
                  'name': 1, 
                  'email': 1, 
                  'phone': 1, 
                  'gender': 1, 
                  'location': 1, 
                  'image': 1, 
                  'ou': 1
                }
              }, {
                '$lookup': {
                  'from': 'organization-units', 
                  'localField': 'ou', 
                  'foreignField': '_id', 
                  'as': 'ou', 
                  'pipeline': [
                    {
                      '$project': {
                        'name': 1, 
                        'parent': 1, 
                        'image': 1
                      }
                    }
                  ]
                }
              }
            ]
          }
        }, {
          '$lookup': {
            'from': 'organization-units', 
            'localField': 'ous', 
            'foreignField': '_id', 
            'as': 'ous', 
            'pipeline': [
              {
                '$project': {
                  'name': 1, 
                  'parent': 1, 
                  'image': 1
                }
              }
            ]
          }
        }, {
          '$addFields': {
            'targetUsers': {
              '$reduce': {
                'input': {
                  '$setUnion': [
                    '$target1', '$target2', '$target3'
                  ]
                }, 
                'initialValue': [], 
                'in': {
                  '$concatArrays': [
                    '$$value', [
                      {
                        '$mergeObjects': [
                          '$$this', {
                            'seenBy': {
                              '$cond': {
                                'if': {
                                  '$in': [
                                    '$$this._id', '$seenBy.user'
                                  ]
                                }, 
                                'then': true, 
                                'else': false
                              }
                            }, 
                            'seenAt': {
                              '$let': {
                                'vars': {
                                  'seenEntry': {
                                    '$arrayElemAt': [
                                      {
                                        '$filter': {
                                          'input': '$seenBy', 
                                          'as': 'seen', 
                                          'cond': {
                                            '$eq': [
                                              '$$seen.user', '$$this._id'
                                            ]
                                          }
                                        }
                                      }, 0
                                    ]
                                  }
                                }, 
                                'in': '$$seenEntry.seenAt'
                              }
                            }
                          }
                        ]
                      }
                    ]
                  ]
                }
              }
            }
          }
        }, {
          '$unset': [
            'target1', 'target2', 'target3'
          ]
        }, {
          '$addFields': {
            'totalCount': {
              '$size': '$targetUsers'
            }, 
            'seenCount': {
              '$size': {
                '$filter': {
                  'input': '$targetUsers', 
                  'as': 'user', 
                  'cond': {
                    '$eq': [
                      '$$user.seenBy', true
                    ]
                  }
                }
              }
            }
          }
        }
      ];
      let result = await this.announcementModel.aggregate(pipe).exec()
      if(result[0]) {
        return result[0]
      } else {
        return {}
      }
    }

    async findById(id: string): Promise<Announcement | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.announcementModel.findById(id).populate('targetUsers').populate('createdBy').exec();
    }

    async findAll(page: number, size: number): Promise<any> {
        const skip = (page - 1) * size;
        return await this.announcementModel.find().populate('targetUsers').populate('createdBy').skip(skip).limit(size).exec();
    }   

    async update(announcementDto: UpdateAnnouncement): Promise<UpdateWriteOpResult> {
        let _id = announcementDto._id;
        delete announcementDto._id;
        return this.announcementModel.updateOne({ _id: _id }, { $set: announcementDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.announcementModel.deleteOne({ _id: id });
    }
}