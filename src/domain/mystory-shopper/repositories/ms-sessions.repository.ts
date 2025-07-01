import mongoose, { Model, Types, UpdateWriteOpResult } from "mongoose";
import { MSSession, MSSessionVisitDate } from "../dto/ms-sessions.dto";
import { MSSessionRepository } from "../interfaces/ms-sessions-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *MSSession Repository
 *
 * @export
 * @class MSSessionRepositoryImpl
 * @implements {MSSessionRepository}
 */
@Injectable()
export class MSSessionRepositoryImpl implements MSSessionRepository {

  /**
   * Creates an instance of MSSessionRepositoryImpl.
   * @param {Model<MSSession>} msSessionModel
   * @memberof MSSessionRepositoryImpl
   */
  constructor(@InjectModel('ms-session') private readonly msSessionModel: Model<MSSession>) { }


  async getByProject(page: number, size: number, projectId: string): Promise<any> {
    const skip = (page - 1) * size;
    return await this.msSessionModel.find({ projectId }).skip(skip).limit(size).exec();
  }

  async create(msSessionDto: MSSession): Promise<MSSession> {
    const createdMSSession = new this.msSessionModel(msSessionDto);
    return createdMSSession.save();
  }

  async findById(id: string): Promise<MSSession | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return this.msSessionModel.findById(id).exec();
  }

  async findAll(page: number, size: number, tags: string[]): Promise<any> {
    const skip = (page - 1) * size;
    return await this.msSessionModel.find().skip(skip).limit(size).exec();
  }

  async update(id: string, msSessionDto: MSSession): Promise<UpdateWriteOpResult> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return this.msSessionModel.updateOne({ _id: id }, { $set: msSessionDto });
  }

  async insertSession(id: string, msSessionDto: MSSessionVisitDate): Promise<UpdateWriteOpResult> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return this.msSessionModel.updateOne({ _id: id },
      {
        "$push": { // Use the $push operator to add the new object to the visits.data array
          "visits.data": { // Specify the field to push into
            "channel": new Types.ObjectId(msSessionDto.channel), // New object properties
            "branch": new Types.ObjectId(msSessionDto.branch), // New object properties
            "date": msSessionDto.date,
            "status": "Pending",
            "time": msSessionDto.time
          }
        }
      }
    );
  }

  async delete(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return this.msSessionModel.deleteOne({ _id: id });
  }



  async getCalender(id: string): Promise<any> {
    return await this.msSessionModel.aggregate([
        {
          '$match': {
            '_id': new Types.ObjectId(id)
          }
        }, {
          '$lookup': {
            'from': 'ms-projects', 
            'localField': 'projectId', 
            'foreignField': '_id', 
            'as': 'projectId'
          }
        }, {
          '$unwind': {
            'path': '$projectId'
          }
        }, {
          '$unwind': {
            'path': '$visits.data'
          }
        }, {
          '$addFields': {
            'dateObj': {
              '$dateToParts': {
                'date': '$visits.data.date'
              }
            }
          }
        }, {
          '$lookup': {
            'from': 'ms-channels', 
            'localField': 'visits.data.channel', 
            'foreignField': '_id', 
            'as': 'visits.data.channel'
          }
        }, {
          '$unwind': {
            'path': '$visits.data.channel'
          }
        }, {
          '$lookup': {
            'from': 'ms-channels', 
            'localField': 'visits.data.branch', 
            'foreignField': '_id', 
            'as': 'visits.data.branch', 
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
          '$unwind': {
            'path': '$visits.data.branch', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$group': {
            '_id': {
              'year': '$dateObj.year', 
              'month': '$dateObj.month', 
              'day': '$dateObj.day'
            }, 
            'data': {
              '$push': '$$ROOT'
            }
          }
        }
      ])
  }

  async getVisitDates(projectId:string):Promise<any> {
    let pipe = [
      {
        '$match': {
          'projectId': new mongoose.Types.ObjectId(projectId)
        }
      }, {
        '$unwind': {
          'path': '$visits.data'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$visits.data'
        }
      },
      //  {
      //   '$match': {
      //     'channel': new mongoose.Types.ObjectId('65c9fd362020a3e080d808b8'),
      //    //‘branch’: new ObjectId('65c9fd362020a3e080d808b8')
      //   }
      // }, 
      {
        '$addFields': {
          'dateObj': {
            '$dateToParts': {
              'date': '$date'
            }
          }
        }
      }, {
        '$addFields': {
          'dateObj.hour': {
            '$toInt': {
              '$arrayElemAt': [
                {
                  '$split': [
                    '$time', ':'
                  ]
                }, 0
              ]
            }
          }, 
          'dateObj.minute': {
            '$toInt': {
              '$arrayElemAt': [
                {
                  '$split': [
                    '$time', ':'
                  ]
                }, 1
              ]
            }
          }
        }
      }, {
        '$addFields': {
          'date': {
            '$dateFromParts': {
              'year': '$dateObj.year', 
              'month': '$dateObj.month', 
              'day': '$dateObj.day', 
              'hour': '$dateObj.hour', 
              'minute': '$dateObj.minute'
            }
          }
        }
      }
    ];

    return this.msSessionModel.aggregate(pipe);
  }

  async deleteVisit(sessionId: string, visitId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(sessionId) || !mongoose.Types.ObjectId.isValid(visitId)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    const session = await this.msSessionModel.findOneAndUpdate(
      { _id: sessionId },
      { $pull: { 'visits.data': { _id: visitId } } },
      { new: true }
    );
    return session;
  }
}