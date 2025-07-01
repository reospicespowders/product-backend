import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Mongoose, Types, UpdateWriteOpResult } from "mongoose";
import { TrainingRequest, UpdateTrainingRequest } from "../dto/training-request.dto";
import { TrainingRequestRepository } from "../interfaces/training-request-repository.interface";




@Injectable()
export class TrainingRequestRepositoryImpl implements TrainingRequestRepository {


  constructor(@InjectModel('Training_Request') private readonly TrainingRequestModel: Model<TrainingRequest>,
    @InjectModel('OU-Location') private readonly locationModel: Model<Location>) { }


  async deleteAll(courses: any[]): Promise<any> {
    await this.TrainingRequestModel.deleteMany({ trainingId: { $in: courses } })
  }



  getUnregisteredUsers(courseId: string): Promise<any> {
    return this.TrainingRequestModel.find({ trainingId: courseId }, { unregisteredUsers: 1 })
  }

  updateUnregisteredUsers(courseId: any, users: string[]): Promise<UpdateWriteOpResult> {
    return this.TrainingRequestModel.updateOne({ trainingId: courseId }, { $set: { unregisteredUsers: users } })
  }


  getAllByCourses(courses: string[]): Promise<TrainingRequest[]> {
    return this.TrainingRequestModel.find({ trainingId: { $in: courses } })
  }

  async getAllByCoursesAndCourses(courses: string[]): Promise<any[]> {
    let res = await this.TrainingRequestModel.find({ trainingId: { $in: courses } }).populate('trainingId')
    return res;
  }

  /**
   *
   *
   * @param {TrainingRequest} trainingRequests
   * @return {*}  {Promise<TrainingRequest>}
   * @memberof TrainingRequestRepositoryImpl
   */
  create(trainingRequests: TrainingRequest): Promise<TrainingRequest> {
    return this.TrainingRequestModel.create(trainingRequests);
  }


  /**
   *
   *
   * @param {UpdateTrainingRequest} trainingRequests
   * @return {*}  {Promise<TrainingRequest>}
   * @memberof TrainingRequestRepositoryImpl
   */
  update(trainingRequests: UpdateTrainingRequest): Promise<TrainingRequest> {
    return this.TrainingRequestModel.findByIdAndUpdate(trainingRequests._id, trainingRequests);
  }


  updateField(trainingRequests: any): Promise<UpdateWriteOpResult> {
    return this.TrainingRequestModel.updateOne({ _id: trainingRequests._id }, { $set: trainingRequests });
  }


  /**
   *
   *
   * @param {number} page
   * @param {number} offset
   * @param {TrainingRequest} filter
   * @return {*}  {Promise<TrainingRequest[]>}
   * @memberof TrainingRequestRepositoryImpl
   */
  async getAll(page: number, offset: string, filter: any): Promise<TrainingRequest[]> {
    //pagination 
    const limitValue = parseInt(offset as string, 10);
    const skip: number = page * limitValue - limitValue;

    let data = await this.TrainingRequestModel.find(filter).populate('type').populate('trainingId').populate('ou').limit(limitValue).skip(skip).sort({ createdAt: -1 });


    data?.forEach(async (item: any) => {
      if (item?.ou?.location) item.ou.location = await this.locationModel.findOne({ _id: item?.ou?.location })
    })

    return data
  }


  /**
   *
   *
   * @param {number} page
   * @param {number} offset
   * @param {TrainingRequest} filter
   * @return {*}  {Promise<TrainingRequest[]>}
   * @memberof TrainingRequestRepositoryImpl
   */
  async getNewBranchTrainings(filter: any, selection: any): Promise<TrainingRequest[]> {

    let data = await this.TrainingRequestModel.find(filter, selection)

    return data
  }

  /**
   *
   *
   * @param {number} page
   * @param {number} offset
   * @param {TrainingRequest} filter
   * @return {*}  {Promise<TrainingRequest[]>}
   * @memberof TrainingRequestRepositoryImpl
   */
  async getAllAggregated(page: number, offset: number, filter: TrainingRequest): Promise<TrainingRequest[]> {
    //pagination 
    const skip: number = page * offset - offset;

    return this.TrainingRequestModel.aggregate([
      {
        '$match': {
          'status': filter.status ? filter.status : ''
        }
      }, {
        '$lookup': {
          'from': 'training-type',
          'localField': 'type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$addFields': {
          'type': {
            '$first': '$type'
          }
        }
      }, {
        '$match': {
          'type.name': filter.type ? filter.type : ''
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'ou',
          'foreignField': '_id',
          'as': 'ou'
        }
      }, {
        '$addFields': {
          'ou': {
            '$first': '$ou'
          }
        }
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$ou._id',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'as': 'parentUnits',
          'depthField': 'depth'
        }
      }, {
        '$match': {
          'parentUnits': {
            '$ne': []
          }
        }
      }, {
        '$addFields': {
          'parentUnits': {
            '$map': {
              'input': '$parentUnits',
              'in': '$$this._id'
            }
          }
        }
      }, {
        '$match': {
          'parentUnits': filter.ou ? filter.ou : ''
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'trainingId',
          'foreignField': '_id',
          'as': 'trainingId'
        }
      }, {
        '$addFields': {
          'trainingId': {
            '$first': '$trainingId'
          }
        }
      }
    ])
  }



  /**
   *
   *
   * @param {number} page
   * @param {number} offset
   * @param {TrainingRequest} filter
   * @return {*}  {Promise<TrainingRequest[]>}
   * @memberof TrainingRequestRepositoryImpl
   */
  async getAllAggregatedV2(page: number, offset: number, filter: TrainingRequest | any): Promise<TrainingRequest[]> {
    const skip: number = page * offset - offset;

    let test: number = 2 * (offset) - offset

    const pipeline: any[] = [
      {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'ou',
          'foreignField': '_id',
          'as': 'ou',
          'pipeline': [
            {
              '$lookup': {
                'from': 'locations',
                'localField': 'location',
                'foreignField': '_id',
                'as': 'location'
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
          'path': '$ou',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$ous',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'as': 'ous',
          'depthField': 'depth'
        }
      }, {
        '$addFields': {
          'ous': {
            '$reduce': {
              'input': '$ous',
              'initialValue': [],
              'in': {
                '$concatArrays': [
                  [
                    '$$this._id'
                  ], '$$value'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'createdAtDate': {
            '$dateToString': {
              'format': '%Y-%m-%d',
              'date': '$createdAt'
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'trainingId',
          'foreignField': '_id',
          'as': 'trainingId',
          'pipeline': [
            {
              '$lookup': {
                'from': 'session',
                'localField': 'session',
                'foreignField': '_id',
                'as': 'sessions'
              }
            }, {
              '$addFields': {
                'trainer': {
                  '$map': {
                    'input': '$sessions.typeId',
                    'in': {
                      '$toObjectId': '$$this'
                    }
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'program',
                'localField': 'trainer',
                'foreignField': '_id',
                'as': 'trainer'
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'trainer': {
            '$first': '$trainingId.sessions.trainer'
          },
          'start_date': {
            '$toDate': {
              '$first': '$trainingId.start_date'
            }
          },
          'end_date': {
            '$toDate': {
              '$first': '$trainingId.end_date'
            }
          },
          'trainingId': {
            '$first': '$trainingId'
          }
        }
      }
    ];


    if (filter.startDate && filter.endDate) {
      pipeline.push({
        '$match': {
          'createdAt': {
            '$gte': new Date(filter.startDate),
            '$lte': new Date(filter.endDate)
          }
        }
      });
    }

    if (filter.status) {

      if (Array.isArray(filter.status)) {
        pipeline.push({
          '$match': {
            'status': { '$in': filter.status }
          }
        });
      } else {
        pipeline.push({
          '$match': {
            'status': filter.status
          }
        });
      }

    }

    if (filter.type) {
      if (Array.isArray(filter.type)) {
        pipeline.push({
          '$match': {
            'type': {
              '$in': filter.type.map((type: any) => {
                return new mongoose.Types.ObjectId(type)
              })
            }
          }
        })
      } else {
        pipeline.push({
          '$match': {
            'type': new mongoose.Types.ObjectId(filter.type)
          }
        });
      }

    }

    if (filter?.allowedNullOu) {
      pipeline.push({
        '$match': {
          '$or': [
            { 'trainingId.programId': { $exists: false } }, // Field doesn't exist
            { 'trainingId.programId': { $eq: [] } },        // Empty array
            { 'trainingId.programId': { $eq: null } }       // Null value
          ]
        }
      });
    }




    if (filter.trainer || filter.master_trainer || filter.ou || filter.ous) {

      var cond = []

      if (filter.trainer) {
        cond.push({ 'trainer.user_id': filter.trainer })
      }

      if (filter.master_trainer) {
        cond.push({ 'master_trainer': new mongoose.Types.ObjectId(filter.master_trainer) })
      }


      if (filter.ou) {
        if (Array.isArray(filter.ou)) {
          cond.push({
            'ou._id': {
              '$in': filter.ou.map((ou: any) => {
                return new mongoose.Types.ObjectId(ou)
              })
            }
          })
        } else {
          cond.push({
            'ou._id': new mongoose.Types.ObjectId(filter.ou)
          });
        }
      }

      if (filter.ous) {
        if (filter?.allowedNullOu) {
          cond.push({
            $or: [
              { 'ous': { $exists: false } }, // Field doesn't exist
              { 'ous': { $eq: [] } },        // Empty array
              { 'ous': { $eq: null } },      // Null value
              {
                'ous': {
                  '$in': filter.ous.map((ou: any) => {
                    return new mongoose.Types.ObjectId(ou)
                  })
                }
              }        // Matching `ous` condition
            ]
          })
        } else {
          cond.push({
            'ous': {
              '$in': filter.ous.map((ou: any) => {
                return new mongoose.Types.ObjectId(ou)
              })
            }
          })
        }
      }

      pipeline.push({
        '$match': {
          '$or': cond
        }
      });


    }

    if (filter.creator) {
      pipeline.push({
        '$match': {
          'creator': new mongoose.Types.ObjectId(filter.creator)
        }
      });
    }





    // if (filter.trainer) {
    //   pipeline.push({
    //     '$match': {
    //       'trainer.user_id': filter.trainer
    //     }
    //   });
    // }

    // if(filter.master_trainer){
    //   pipeline.push({
    //     '$match': {
    //       'master_trainer': new mongoose.Types.ObjectId(filter.master_trainer)
    //     }
    //   });
    // }

    pipeline.push({
      '$sort': {
        'createdAt': -1
      }
    });

    pipeline.push(
      {
        '$skip': skip
      },
    )


    pipeline.push(
      {
        '$limit': test
      }
    )



    const result = await this.TrainingRequestModel.aggregate(pipeline);

    return result;
  }



  async getAllAggregatedV2Count(filter: any): Promise<number> {
    const pipeline: any[] = [
      {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'ou',
          'foreignField': '_id',
          'as': 'ou',
          'pipeline': [
            {
              '$lookup': {
                'from': 'locations',
                'localField': 'location',
                'foreignField': '_id',
                'as': 'location'
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
          'path': '$ou',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$ous',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'as': 'ous',
          'depthField': 'depth'
        }
      }, {
        '$addFields': {
          'ous': {
            '$reduce': {
              'input': '$ous',
              'initialValue': [],
              'in': {
                '$concatArrays': [
                  [
                    '$$this._id'
                  ], '$$value'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'createdAtDate': {
            '$dateToString': {
              'format': '%Y-%m-%d',
              'date': '$createdAt'
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'trainingId',
          'foreignField': '_id',
          'as': 'trainingId',
          'pipeline': [
            {
              '$lookup': {
                'from': 'session',
                'localField': 'session',
                'foreignField': '_id',
                'as': 'sessions'
              }
            }, {
              '$addFields': {
                'trainer': {
                  '$map': {
                    'input': '$sessions.typeId',
                    'in': {
                      '$toObjectId': '$$this'
                    }
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'program',
                'localField': 'trainer',
                'foreignField': '_id',
                'as': 'trainer'
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'trainer': {
            '$first': '$trainingId.sessions.trainer'
          },
          'start_date': {
            '$toDate': {
              '$first': '$trainingId.start_date'
            }
          },
          'end_date': {
            '$toDate': {
              '$first': '$trainingId.end_date'
            }
          },
          'trainingId': {
            '$first': '$trainingId'
          }
        }
      }
    ];


    if (filter.startDate && filter.endDate) {
      pipeline.push({
        '$match': {
          'createdAt': {
            '$gte': new Date(filter.startDate),
            '$lte': new Date(filter.endDate)
          }
        }
      });
    }

    if (filter.status) {

      if (Array.isArray(filter.status)) {
        pipeline.push({
          '$match': {
            'status': { '$in': filter.status }
          }
        });
      } else {
        pipeline.push({
          '$match': {
            'status': filter.status
          }
        });
      }

    }

    if (filter.type) {
      if (Array.isArray(filter.type)) {
        pipeline.push({
          '$match': {
            'type': {
              '$in': filter.type.map((type: any) => {
                return new mongoose.Types.ObjectId(type)
              })
            }
          }
        })
      } else {
        pipeline.push({
          '$match': {
            'type': new mongoose.Types.ObjectId(filter.type)
          }
        });
      }

    }

    if (filter?.allowedNullOu) {
      pipeline.push({
        '$match': {
          '$or': [
            { 'trainingId.programId': { $exists: false } }, // Field doesn't exist
            { 'trainingId.programId': { $eq: [] } },        // Empty array
            { 'trainingId.programId': { $eq: null } }       // Null value
          ]
        }
      });
    }

    // if (filter.ous) {
    //   pipeline.push({
    //     '$match': {
    //       'ous': {
    //         '$in': filter.ous.map((ou: any) => {
    //           return new mongoose.Types.ObjectId(ou)
    //         })
    //       }
    //     }
    //   })
    // }

    if (filter.trainer || filter.master_trainer || filter.ou || filter.ous) {

      var cond = []

      if (filter.trainer) {
        cond.push({ 'trainer.user_id': filter.trainer })
      }

      if (filter.master_trainer) {
        cond.push({ 'master_trainer': new mongoose.Types.ObjectId(filter.master_trainer) })
      }


      if (filter.ou) {
        if (Array.isArray(filter.ou)) {
          cond.push({
            'ou._id': {
              '$in': filter.ou.map((ou: any) => {
                return new mongoose.Types.ObjectId(ou)
              })
            }
          })
        } else {
          cond.push({
            'ou._id': new mongoose.Types.ObjectId(filter.ou)
          });
        }
      }

      if (filter.ous) {
        if (filter?.allowedNullOu) {
          cond.push({
            $or: [
              { 'ous': { $exists: false } }, // Field doesn't exist
              { 'ous': { $eq: [] } },        // Empty array
              { 'ous': { $eq: null } },      // Null value
              {
                'ous': {
                  '$in': filter.ous.map((ou: any) => {
                    return new mongoose.Types.ObjectId(ou)
                  })
                }
              }        // Matching `ous` condition
            ]
          })
        } else {
          cond.push({
            'ous': {
              '$in': filter.ous.map((ou: any) => {
                return new mongoose.Types.ObjectId(ou)
              })
            }
          })
        }
      }

      pipeline.push({
        '$match': {
          '$or': cond
        }
      });


    }


    if (filter.creator) {
      pipeline.push({
        '$match': {
          'creator': new mongoose.Types.ObjectId(filter.creator)
        }
      });
    }




    pipeline.push({
      '$count': 'count'
    })


    const result = await this.TrainingRequestModel.aggregate(pipeline);

    if (result[0] && result[0].count) {
      return result[0].count
    } else {
      return 0
    }

  }

  /**
   *
   *
   * @param {*} query
   * @return {*}  {Promise<number>}
   * @memberof TrainingRequestRepositoryImpl
   */
  countDocuments(query: any): Promise<number> {
    return this.TrainingRequestModel.countDocuments(query)
  }

  /**
   *
   *
   * @param {*} filter
   * @return {*}  {Promise<TrainingRequest[]>}
   * @memberof TrainingRequestRepositoryImpl
   */
  getAllForCrown(filter: any): Promise<TrainingRequest[]> {
    return this.TrainingRequestModel.aggregate([
      {
        '$lookup': {
          'from': 'training-type',
          'localField': 'type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$unwind': {
          'path': '$type'
        }
      }, {
        '$match': filter
      }
    ]);
  }


  /**
   *
   *
   * @param {*} type
   * @return {*}  {Promise<any[]>}
   * @memberof TrainingRequestRepositoryImpl
   */
  getGraphData(data: any): Promise<any[]> {

    let datetimepipe: any = []

    if (data.start_date && data.end_date) {
      datetimepipe.push({
        '$addFields': {
          'staringDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$start_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          },
          'endingDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$end_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          }
        }
      });

      datetimepipe.push({
        '$match': {
          '$or': [{
            'staringDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          },
          {
            'endingDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          }]
        }
      });

    }

    let pipeline: any = [
      {
        '$lookup': {
          'from': 'courses',
          'localField': '_id',
          'foreignField': 'request_id',
          'as': 'courses',
          'pipeline': datetimepipe
        }
      }, {
        '$unwind': {
          'path': '$courses',
          'preserveNullAndEmptyArrays': false
        }
      },
      {
        '$lookup': {
          'from': 'training-type',
          'localField': 'type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$unwind': {
          'path': '$type'
        }
      }, {
        '$match': {
          'type.name': data.type
        }
      }, {
        '$addFields': {
          'ou': {
            '$cond': [
              {
                '$eq': [
                  {
                    '$ifNull': [
                      '$ou', null
                    ]
                  }, null
                ]
              }, '$ous', [
                '$ou'
              ]
            ]
          }
        }
      }, {
        '$unwind': {
          'path': '$ou'
        }
      }, {
        '$match': {
          'ou': {
            '$ne': null
          }
        }
      }, {
        '$group': {
          '_id': '$ou',
          'total_records': {
            '$sum': 1
          },
          'published_records': {
            '$sum': {
              '$cond': {
                'if': {
                  '$eq': [
                    '$status', 'PUBLISHED'
                  ]
                },
                'then': 1,
                'else': 0
              }
            }
          },
          'rejected_records': {
            '$sum': {
              '$cond': {
                'if': {
                  '$eq': [
                    '$status', 'REJECTED'
                  ]
                },
                'then': 1,
                'else': 0
              }
            }
          },
          'approved_records': {
            '$sum': {
              '$cond': {
                'if': {
                  '$eq': [
                    '$status', 'APPROVED'
                  ]
                },
                'then': 1,
                'else': 0
              }
            }
          },
          'draft': {
            '$sum': {
              '$cond': {
                'if': {
                  '$eq': [
                    '$status', 'TRAINING_CREATED'
                  ]
                },
                'then': 1,
                'else': 0
              }
            }
          },
          'pending': {
            '$sum': {
              '$cond': {
                'if': {
                  '$eq': [
                    '$status', 'PENDING'
                  ]
                },
                'then': 1,
                'else': 0
              }
            }
          },
          'completed': {
            '$sum': {
              '$cond': {
                'if': {
                  '$eq': [
                    '$status', 'COMPLETED'
                  ]
                },
                'then': 1,
                'else': 0
              }
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': '_id',
          'foreignField': '_id',
          'as': 'ou'
        }
      }, {
        '$unwind': {
          'path': '$ou'
        }
      }, {
        '$lookup': {
          'from': 'locations',
          'localField': 'ou.location',
          'foreignField': '_id',
          'as': 'location'
        }
      }, {
        '$unwind': {
          'path': '$location'
        }
      }
    ];


    return this.TrainingRequestModel.aggregate(pipeline);
  }

  /**
   *
   *
   * @param {*} type
   * @return {*}  {Promise<any[]>}
   * @memberof TrainingRequestRepositoryImpl
   */
  getGraphDataUsers(data): Promise<any[]> {

    let datetimepipe: any = []

    if (data.start_date && data.end_date) {
      datetimepipe.push({
        '$addFields': {
          'staringDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$start_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          },
          'endingDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$end_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          }
        }
      });

      datetimepipe.push({
        '$match': {
          '$or': [{
            'staringDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          },
          {
            'endingDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          }]
        }
      });

    }

    let pipeline: any = [
      {
        '$match': {
          'status': 'COMPLETED',
          'type': new Types.ObjectId(data.type)
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': '_id',
          'foreignField': 'request_id',
          'as': 'courses',
          'pipeline': datetimepipe
        }
      }, {
        '$unwind': {
          'path': '$courses',
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$unwind': {
          'path': '$ous',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$addFields': {
          'ou': {
            '$ifNull': [
              '$ou', '$ous'
            ]
          }
        }
      }, {
        '$project': {
          'ou': '$ou',
          'attendees': '$courses.attendees'
        }
      }, {
        '$unwind': {
          'path': '$attendees',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$group': {
          '_id': '$ou',
          'numberOfAttendees': {
            '$addToSet': '$attendees'
          },
          'trainings': {
            '$addToSet': '$_id'
          }
        }
      }, {
        '$addFields': {
          'numberOfAttendees': {
            '$reduce': {
              'input': '$numberOfAttendees',
              'initialValue': [],
              'in': {
                '$cond': {
                  'if': {
                    '$in': [
                      '$$this', '$$value'
                    ]
                  },
                  'then': '$$value',
                  'else': {
                    '$concatArrays': [
                      '$$value', [
                        '$$this'
                      ]
                    ]
                  }
                }
              }
            }
          },
          'trainings': {
            '$size': '$trainings'
          }
        }
      }, {
        '$addFields': {
          'numberOfAttendees': {
            '$size': '$numberOfAttendees'
          }
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': '_id',
          'foreignField': '_id',
          'as': 'ou',
          'pipeline': [
            {
              '$match': {
                'managers': {
                  '$ne': []
                }
              }
            }, {
              '$lookup': {
                'from': 'locations',
                'localField': 'location',
                'foreignField': '_id',
                'as': 'location'
              }
            }, {
              '$addFields': {
                'location': {
                  '$first': '$location.name'
                }
              }
            }, {
              '$graphLookup': {
                'from': 'organization-units',
                'startWith': '$_id',
                'connectFromField': 'parent',
                'connectToField': '_id',
                'depthField': 'depth',
                'as': 'breadcrumbs'
              }
            }, {
              '$addFields': {
                'breadcrumbs': {
                  '$map': {
                    'input': '$breadcrumbs',
                    'in': {
                      '_id': '$$this._id',
                      'label': '$$this.name',
                      'id': '$$this.id',
                      'icon': '$$this.image_sq',
                      'depth': '$$this.depth'
                    }
                  }
                }
              }
            }, {
              '$project': {
                'name': 1,
                'image': 1,
                'image_sq': 1,
                'location': 1,
                'ous': '$breadcrumbs'
              }
            }
          ]
        }
      }, {
        '$unwind': {
          'path': '$ou',
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$match': {
          '_id': {
            '$ne': null
          }
        }
      }
    ]

    return this.TrainingRequestModel.aggregate(pipeline);
  }



  getTopThree(data): Promise<any[]> {

    let datetimepipe: any = [
      {
        '$project': {
          'attendees': '$attendees'
        }
      }
    ]

    if (data.start_date && data.end_date) {
      datetimepipe = [{
        '$addFields': {
          'staringDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$start_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          },
          'endingDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$end_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          }
        }
      }, {
        '$match': {
          '$or': [{
            'staringDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          },
          {
            'endingDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          }]
        }
      }, {
        '$project': {
          'attendees': '$attendees'
        }
      }]

    }

    let pipeline: any = [
      {
        '$match': {
          'status': 'COMPLETED',
          'type': new Types.ObjectId(data.type)
        }
      }, {
        '$unwind': {
          'path': '$ous',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$addFields': {
          'ou': {
            '$ifNull': [
              '$ou', '$ous'
            ]
          }
        }
      }, {
        '$group': {
          '_id': '$ou',
          'courses': {
            '$addToSet': '$_id'
          }
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'courses',
          'foreignField': 'request_id',
          'as': 'courses',
          'pipeline': datetimepipe
        }
      }, {
        '$match': {
          'courses': { '$ne': [] }
        }
      }, {
        '$addFields': {
          'attendees': {
            '$reduce': {
              'input': '$courses.attendees',
              'initialValue': [],
              'in': {
                '$concatArrays': [
                  '$$value', '$$this'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'attendees': {
            '$reduce': {
              'input': '$attendees',
              'initialValue': [],
              'in': {
                '$cond': {
                  'if': {
                    '$in': [
                      '$$this', '$$value'
                    ]
                  },
                  'then': '$$value',
                  'else': {
                    '$concatArrays': [
                      '$$value', [
                        '$$this'
                      ]
                    ]
                  }
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'attendees': {
            '$size': '$attendees'
          },
          'courses': {
            '$map': {
              'input': '$courses',
              'in': '$$this._id'
            }
          }
        }
      }, {
        '$addFields': {
          'size': {
            '$size': '$courses'
          }
        }
      }, {
        '$sort': {
          'size': -1,
          'attendees': -1
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': '_id',
          'foreignField': '_id',
          'as': 'ou',
          'pipeline': [
            {
              '$match': {
                'managers': {
                  '$ne': []
                }
              }
            },
          ]
        }
      }, {
        '$unwind': {
          'path': '$ou'
        }
      }, {
        '$limit': 3
      }, {
        '$lookup': {
          'from': 'locations',
          'localField': 'ou.location',
          'foreignField': '_id',
          'as': 'ou.location'
        }
      }, {
        '$unwind': {
          'path': '$ou.location',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$addFields': {
          '_id': {
            '$concat': [
              '$ou.name', ' (', '$ou.location.name', ')'
            ]
          }
        }
      }
    ]

    return this.TrainingRequestModel.aggregate(pipeline)
  }

  getTopTopics(data): Promise<any[]> {

    let datetimepipe: any = [{
      '$group': {
        '_id': null,
        'count': {
          '$sum': {
            '$size': '$attendees'
          }
        }
      }
    }]

    if (data.start_date && data.end_date) {
      datetimepipe = [{
        '$addFields': {
          'staringDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$start_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          },
          'endingDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$end_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          }
        }
      }, {
        '$match': {
          '$or': [{
            'staringDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          },
          {
            'endingDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          }]
        }
      }, {
        '$group': {
          '_id': null,
          'count': {
            '$sum': {
              '$size': '$attendees'
            }
          }
        }
      }]

    }

    let pipeline: any = [
      {
        '$match': {
          'status': 'COMPLETED',
          'type': new Types.ObjectId(data.type),
        }
      }, {
        '$addFields': {
          'ou': {
            '$cond': [
              {
                '$eq': [
                  {
                    '$ifNull': [
                      '$ou', null
                    ]
                  }, null
                ]
              }, '$ous', [
                '$ou'
              ]
            ]
          }
        }
      }, {
        '$unwind': {
          'path': '$ou'
        }
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$ou',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'depthField': 'depth',
          'as': 'breadcrumbs'
        }
      }, {
        '$match': {
          'breadcrumbs': {
            '$ne': []
          }
        }
      }, {
        '$addFields': {
          'breadcrumbs': {
            '$map': {
              'input': '$breadcrumbs',
              'in': {
                '_id': '$$this._id',
                'label': '$$this.name',
                'id': '$$this.id',
                'image_sq': '$$this.image_sq',
                'image': '$$this.image',
                'depth': '$$this.depth',
                'parent': '$$this.parent'
              }
            }
          }
        }
      }, {
        '$addFields': {
          'breadcrumbs': {
            '$reduce': {
              'input': '$breadcrumbs',
              'initialValue': {},
              'in': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$$this.parent', null
                    ]
                  },
                  'then': '$$this',
                  'else': '$$value'
                }
              }
            }
          }
        }
      }, {
        '$group': {
          '_id': {
            'ou': '$breadcrumbs',
            'topic': '$topic'
          },
          'count': {
            '$count': {}
          },
          'courses': {
            '$addToSet': '$_id'
          }
        }
      }, {
        '$match': {
          'courses': {
            '$ne': []
          }
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'courses',
          'foreignField': 'request_id',
          'as': 'attendees',
          'pipeline': datetimepipe
        }
      }, {
        '$match': {
          'attendees': { '$ne': [] }
        }
      }, {
        '$addFields': {
          'attendees': {
            '$first': '$attendees.count'
          }
        }
      }, {
        '$sort': {
          'attendees': -1
        }
      }, {
        '$limit': 3
      }, {
        '$project': {
          '_id': '$_id.topic',
          'ou': '$_id.ou',
          'requestcount': '$count',
          'courses': 1,
          'attendees': 1
        }
      }
    ]


    return this.TrainingRequestModel.aggregate(pipeline)
  }

  getTotalAndCompleted(data): Promise<any[]> {

    let datetimepipe: any = []

    if (data.start_date && data.end_date) {
      datetimepipe = [{
        '$addFields': {
          'staringDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$start_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          },
          'endingDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$end_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          }
        }
      }, {
        '$match': {
          '$or': [{
            'staringDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          },
          {
            'endingDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          }]
        }
      }]

    }

    let pipeline: any = [
      {
        '$match': {
          'type': new Types.ObjectId(data.type)
        }
      }, {
        '$unwind': {
          'path': '$ous',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$addFields': {
          'ou': {
            '$ifNull': [
              '$ou', '$ous'
            ]
          }
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': '_id',
          'foreignField': 'request_id',
          'as': 'courses',
          'pipeline': datetimepipe
        }
      }, {
        '$unwind': {
          'path': '$courses',
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'ou',
          'foreignField': '_id',
          'as': 'ou',
          'pipeline': [
            {
              '$match': {
                'managers': {
                  '$ne': []
                }
              }
            },
          ]
        }
      }, {
        '$match': {
          'ou': {
            '$ne': []
          }
        }
      }, {
        '$group': {
          '_id': '$_id',
          'courses': {
            '$first': '$courses'
          },
          'status': {
            '$first': '$status'
          }
        }
      }, {
        '$group': {
          '_id': '$status',
          'count': {
            '$count': {}
          },
          'attendeesincourses': {
            '$addToSet': '$courses.attendees'
          },
          'certifiedUsers': {
            '$addToSet': '$courses.certifiedUsers'
          }
        }
      }, {
        '$addFields': {
          'attendeesincourses': {
            '$reduce': {
              'input': '$attendeesincourses',
              'initialValue': [],
              'in': {
                '$setUnion': [
                  '$$value', '$$this'
                ]
              }
            }
          },
          'certifiedUsers': {
            '$reduce': {
              'input': '$certifiedUsers',
              'initialValue': [],
              'in': {
                '$setUnion': [
                  '$$value', '$$this'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'attendees': {
            '$size': '$attendeesincourses'
          },
          'certified': {
            '$size': '$certifiedUsers'
          }
        }
      }, {
        '$group': {
          '_id': null,
          'data': {
            '$addToSet': {
              'k': '$_id',
              'v': '$count'
            }
          },
          'total': {
            '$sum': '$count'
          },
          'attendees': {
            '$addToSet': '$attendeesincourses'
          },
          'certified': {
            '$addToSet': '$certifiedUsers'
          }
        }
      }, {
        '$addFields': {
          'attendees': {
            '$reduce': {
              'input': '$attendees',
              'initialValue': [],
              'in': {
                '$setUnion': [
                  '$$value', '$$this'
                ]
              }
            }
          },
          'certified': {
            '$reduce': {
              'input': '$certified',
              'initialValue': [],
              'in': {
                '$setUnion': [
                  '$$value', '$$this'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'attendees': {
            '$size': '$attendees'
          },
          'certified': {
            '$size': '$certified'
          }
        }
      }, {
        '$addFields': {
          'data': {
            '$arrayToObject': '$data'
          }
        }
      }, {
        '$addFields': {
          'data.TOTAL': '$total',
          'data.ATTENDEES': '$attendees',
          'data.COMPLETEDUSERS': '$certified'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$data'
        }
      }
    ]

    return this.TrainingRequestModel.aggregate(pipeline)
  }


  getSkillTrainingData(data): Promise<any[]> {

    let datetimepipe: any = []

    if (data.start_date && data.end_date) {
      datetimepipe = [{
        '$addFields': {
          'staringDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$start_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          },
          'endingDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$end_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          }
        }
      }, {
        '$match': {
          '$or': [{
            'staringDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          },
          {
            'endingDate': {
              '$gte': new Date(data.start_date),
              '$lte': new Date(data.end_date)
            }
          }]
        }
      }]

    }

    let pipeline: any = [
      {
        '$match': {
          'type': new Types.ObjectId(data.type)
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'trainingId',
          'foreignField': '_id',
          'as': 'courses',
          'pipeline': datetimepipe
        }
      }, {
        '$match': {
          'courses': {
            '$ne': []
          }
        }
      }, {
        '$addFields': {
          'courses': {
            '$first': '$courses'
          }
        }
      }, {
        '$lookup': {
          'from': 'session',
          'localField': 'courses.session',
          'foreignField': '_id',
          'as': 'courses.session',
          'let': {
            'certifiedUsers': '$courses.certifiedUsers'
          },
          'pipeline': [
            {
              '$match': {
                'sessionType': 'Assessment'
              }
            }, {
              '$addFields': {
                'assessmentId': {
                  '$toObjectId': '$assessmentId'
                },
                'certifiedUsers': '$$certifiedUsers'
              }
            }, {
              '$lookup': {
                'from': 'assessments',
                'localField': 'assessmentId',
                'foreignField': '_id',
                'as': 'assessment',
                'pipeline': [
                  {
                    '$project': {
                      'percentageCriteria': 1
                    }
                  }
                ]
              }
            }, {
              '$unwind': {
                'path': '$assessment'
              }
            }, {
              '$lookup': {
                'from': 'assessment-results',
                'localField': 'assessmentId',
                'foreignField': 'assessmentId',
                'let': {
                  'criteria': '$assessment.percentageCriteria',
                  'certifiedUsers': '$certifiedUsers'
                },
                'as': 'results',
                'pipeline': [
                  {
                    '$lookup': {
                      'from': 'users',
                      'localField': 'email',
                      'foreignField': 'email',
                      'as': 'uid',
                      'pipeline': [
                        {
                          '$project': {
                            '_id': 1
                          }
                        }
                      ]
                    }
                  }, {
                    '$addFields': {
                      'uid': {
                        '$ifNull': [
                          {
                            '$first': '$uid._id'
                          }, null
                        ]
                      },
                      'certifiedUsers': '$$certifiedUsers'
                    }
                  }, {
                    '$unwind': {
                      'path': '$certifiedUsers'
                    }
                  }, {
                    '$addFields': {
                      'isMatch': {
                        '$eq': [
                          '$certifiedUsers', '$uid'
                        ]
                      }
                    }
                  }, {
                    '$match': {
                      'isMatch': true
                    }
                  }, {
                    '$addFields': {
                      'percentage': {
                        '$multiply': [
                          {
                            '$divide': [
                              '$score', '$totalmarks'
                            ]
                          }, 100
                        ]
                      },
                      'criteria': '$$criteria'
                    }
                  }, {
                    '$addFields': {
                      'criteria': {
                        '$reduce': {
                          'input': '$criteria',
                          'initialValue': null,
                          'in': {
                            '$cond': {
                              'if': {
                                '$and': [
                                  {
                                    '$eq': [
                                      '$$value', null
                                    ]
                                  }, {
                                    '$lte': [
                                      '$percentage', '$$this.to'
                                    ]
                                  }, {
                                    '$gte': [
                                      '$percentage', '$$this.from'
                                    ]
                                  }
                                ]
                              },
                              'then': '$$this',
                              'else': '$$value'
                            }
                          }
                        }
                      }
                    }
                  }, {
                    '$facet': {
                      'gradecount': [
                        {
                          '$group': {
                            '_id': '$criteria',
                            'count': {
                              '$sum': 1
                            }
                          }
                        }
                      ],
                      'avg': [
                        {
                          '$group': {
                            '_id': null,
                            'avg': {
                              '$avg': '$percentage'
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'result': {
            '$last': '$courses.session'
          }
        }
      }, {
        '$addFields': {
          'result': {
            '$first': '$result.results'
          }
        }
      }, {
        '$addFields': {
          'result.avg': {
            '$ifNull': [
              {
                '$first': '$result.avg.avg'
              }, null
            ]
          }
        }
      }, {
        '$facet': {
          'stats': [
            {
              '$group': {
                '_id': null,
                'attendees': {
                  '$addToSet': '$courses.attendees'
                },
                'completed': {
                  '$addToSet': '$courses.certifiedUsers'
                },
                'avg': {
                  '$avg': '$result.avg'
                },
                'gradecount': {
                  '$push': '$result.gradecount'
                }
              }
            }, {
              '$addFields': {
                'attendees': {
                  '$reduce': {
                    'input': '$attendees',
                    'initialValue': [],
                    'in': {
                      '$setUnion': [
                        '$$value', '$$this'
                      ]
                    }
                  }
                },
                'completed': {
                  '$reduce': {
                    'input': '$completed',
                    'initialValue': [],
                    'in': {
                      '$setUnion': [
                        '$$value', '$$this'
                      ]
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'attendees': {
                  '$size': '$attendees'
                },
                'completed': {
                  '$size': '$completed'
                }
              }
            }, {
              '$project': {
                '_id': 0,
                'attendees': 1,
                'completed': 1,
                'avg': 1,
                'gradecount': {
                  '$reduce': {
                    'input': '$gradecount',
                    'initialValue': [],
                    'in': {
                      '$concatArrays': [
                        '$$value', '$$this'
                      ]
                    }
                  }
                }
              }
            }, {
              '$unwind': {
                'path': '$gradecount'
              }
            }, {
              '$group': {
                '_id': '$gradecount._id',
                'attendees': {
                  '$first': '$attendees'
                },
                'completed': {
                  '$first': '$completed'
                },
                'avg': {
                  '$first': '$avg'
                },
                'count': {
                  '$sum': '$gradecount.count'
                }
              }
            }, {
              '$group': {
                '_id': null,
                'attendees': {
                  '$first': '$attendees'
                },
                'completed': {
                  '$first': '$completed'
                },
                'avg': {
                  '$first': '$avg'
                },
                'gradecount': {
                  '$addToSet': {
                    '_id': '$_id',
                    'count': '$count'
                  }
                }
              }
            }
          ],
          'data': [
            {
              '$project': {
                'title': '$courses.title',
                'description': '$courses.description',
                'start_date': {
                  '$dateAdd': {
                    'startDate': {
                      '$toDate': '$courses.start_date'
                    },
                    'unit': 'hour',
                    'amount': 5
                  }
                },
                'end_date': {
                  '$dateAdd': {
                    'startDate': {
                      '$toDate': '$courses.end_date'
                    },
                    'unit': 'hour',
                    'amount': 5
                  }
                },
                'attendees': '$courses.attendees',
                'completed': '$courses.certifiedUsers',
                'avg': '$result.avg',
                'gradecount': '$result.gradecount'
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'stats': {
            '$first': '$stats'
          }
        }
      }
    ]

    return this.TrainingRequestModel.aggregate(pipeline)
  }

  /**
   *
   *
   * @param {string} _id
   * @return {*}  {Promise<any>}
   * @memberof TrainingRequestRepositoryImpl
   */
  delete(_id: string): Promise<any> {
    return this.TrainingRequestModel.deleteOne({ _id })
  }

  /**
   *
   *
   * @param {string} _id
   * @return {*}  {Promise<TrainingRequest>}
   * @memberof TrainingRequestRepositoryImpl
   */
  getOne(_id: string): Promise<TrainingRequest> {
    return this.TrainingRequestModel.findById({ _id })
  }

  /**
   *
   *
   * @return {*}  {Promise<any>}
   * @memberof TrainingRequestRepositoryImpl
   */
  getCompletedTrainingsOfPublishedStatus(): Promise<any> {
    return this.TrainingRequestModel.aggregate([
      {
        '$match': {
          'status': 'PUBLISHED'
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'trainingId',
          'foreignField': '_id',
          'as': 'courses'
        }
      }, {
        '$unwind': {
          'path': '$courses'
        }
      }, {
        '$addFields': {
          'dateDiff': {
            '$dateDiff': {
              'startDate': {
                '$toDate': '$courses.end_date'
              },
              'endDate': '$$NOW',
              'unit': 'day'
            }
          }
        }
      }, {
        '$match': {
          'dateDiff': {
            '$gt': 0
          }
        }
      }, {
        '$addFields': {
          'status': 'COMPLETED'
        }
      }, {
        '$unset': [
          'courses', 'dateDiff'
        ]
      }, {
        '$merge': {
          'into': 'training_request',
          'on': '_id',
          'whenMatched': 'replace',
          'whenNotMatched': 'insert'
        }
      }
    ])
  }

  getCalendar(query): Promise<any> {

    let pipeline: any = [
      {
        '$match': {
          'trainingId': {
            '$ne': null
          }
        }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'trainingId',
          'foreignField': '_id',
          'as': 'trainingDetails'
        }
      }, {
        '$addFields': {
          'trainingDetails': {
            '$first': '$trainingDetails'
          }
        }
      },
      {
        '$addFields': {
          'staringDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$trainingDetails.start_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          },
          'endingDate': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$trainingDetails.end_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          }
        }
      },
      {
        '$match': {
          '$or': [{
            'staringDate': {
              '$gte': new Date(query.start_date),
              '$lte': new Date(query.end_date)
            }
          },
          {
            'endingDate': {
              '$gte': new Date(query.start_date),
              '$lte': new Date(query.end_date)
            }
          }]
        }
      }, {
        '$addFields': {
          'ou': {
            '$cond': [
              {
                '$eq': [
                  {
                    '$ifNull': [
                      '$ou', null
                    ]
                  }, null
                ]
              }, '$ous', [
                '$ou'
              ]
            ]
          }
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'ou',
          'foreignField': '_id',
          'as': 'ou'
        }
      }, {
        '$lookup': {
          'from': 'training-type',
          'localField': 'type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$unwind': {
          'path': '$type'
        }
      }, {
        '$match': {
          'type.name': query.type
        }
      },
      {
        '$addFields': {
          'start_date_logical': {
            '$dateToParts': {
              'date': '$staringDate'
            }
          },
          'end_date_logical': {
            '$dateToParts': {
              'date': '$endingDate'
            }
          }
        }
      }, {
        '$addFields': {
          'dates': {
            '$map': {
              'input': {
                '$range': [
                  '$start_date_logical.day', {
                    '$cond': [
                      {
                        '$gt': [
                          '$end_date_logical.month', '$start_date_logical.month'
                        ]
                      }, 32, {
                        '$add': [
                          '$end_date_logical.day', 1
                        ]
                      }
                    ]
                  }, 1
                ]
              },
              'in': {
                'year': '$start_date_logical.year',
                'month': '$start_date_logical.month',
                'day': '$$this'
              }
            }
          }
        }
      }, {
        '$unwind': {
          'path': '$dates'
        }
      }, {
        '$group': {
          '_id': '$dates',
          'data': {
            '$push': '$$ROOT'
          }
        }
      }
    ]

    if (query.ou) {
      pipeline.unshift({
        '$match': {
          'ous': new mongoose.Types.ObjectId(query.ou)
        }
      });
    }

    if (query.ous) {
      pipeline.unshift({
        '$match': {
          'ous': {
            '$in': query.ous.map((ou: any) => {
              return new mongoose.Types.ObjectId(ou)
            })
          }
        }
      })
    }


    return this.TrainingRequestModel.aggregate(pipeline);
  }

  rejectWeekly(): Promise<any> {
    return this.TrainingRequestModel.aggregate([
      {
        '$match': {
          'type': new Types.ObjectId('64ecbe4ff6c283d49c8f3d61'),
          'status': { $nin: ["PUBLISHED", "COMPLETED"] }
        }
      }, {
        '$addFields': {
          'status': 'REJECTED',
          'reason': 'Auto Rejection due to week change'
        }
      }, {
        '$merge': {
          'into': 'training_request',
          'on': '_id',
          'whenMatched': 'replace',
          'whenNotMatched': 'insert'
        }
      }
    ])
  }

  generateWeelyTraining(): Promise<any> {
    return this.TrainingRequestModel.aggregate([
      {
        '$match': {
          'type': new Types.ObjectId('64ecbe4ff6c283d49c8f3d61')
        }
      }, {
        '$addFields': {
          'lastweek': {
            '$dateToParts': {
              'date': '$$NOW'
            }
          }
        }
      }, {
        '$addFields': {
          'lastweek': {
            '$dateFromParts': {
              'year': '$lastweek.year',
              'month': '$lastweek.month',
              'day': '$lastweek.day'
            }
          }
        }
      }, {
        '$addFields': {
          'lastweek': {
            '$dateSubtract': {
              'startDate': '$lastweek',
              'unit': 'day',
              'amount': 6
            }
          }
        }
      }, {
        '$addFields': {
          'datediff': {
            '$dateDiff': {
              'startDate': '$lastweek',
              'endDate': '$createdAt',
              'unit': 'day'
            }
          }
        }
      }, {
        '$match': {
          'datediff': {
            '$gte': 0
          }
        }
      }, {
        '$unset': [
          '_id', 'lastweek', 'datediff'
        ]
      }, {
        '$addFields': {
          'status': 'PENDING',
          'createdAt': '$$NOW',
          'updatedAt': '$$NOW'
        }
      }, {
        '$merge': {
          'into': 'training_request',
          'on': '_id',
          'whenMatched': 'fail',
          'whenNotMatched': 'insert'
        }
      }
    ])
  }

  getMangerImpactTask(id: string, filter: any): Promise<any> {

    let pipeline: any = [
      {
        '$match': {
          'impactSettings.users.assignedManager': id
        }
      }, {
        '$unwind': {
          'path': '$impactSettings.users',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$match': {
          'impactSettings.users.assignedManager': id
        }
      }, {
        '$addFields': {
          'assignedManager': {
            '$toObjectId': '$impactSettings.users.assignedManager'
          }
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'assignedManager',
          'foreignField': '_id',
          'as': 'assignedManager',
          'pipeline': [
            {
              '$project': {
                'name': 1,
                'email': 1
              }
            }
          ]
        }
      }, {
        '$unwind': {
          'path': '$assignedManager',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$addFields': {
          'impactSettings.users._id': {
            '$toObjectId': '$impactSettings.users.userId'
          }
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'impactSettings.users._id',
          'foreignField': '_id',
          'as': 'impactSettings.users.user',
          'pipeline': [
            {
              '$project': {
                'name': 1,
                'email': 1
              }
            }
          ]
        }
      }, {
        '$unwind': {
          'path': '$impactSettings.users.user'
        }
      }, {
        '$addFields': {
          'surveyId': {
            '$toObjectId': '$impactSettings.surveyId'
          }
        }
      }, {
        '$lookup': {
          'from': 'survey-attempts',
          'localField': 'surveyId',
          'foreignField': 'surveyId',
          'let': {
            'user': '$impactSettings.users._id',
            'manager': '$assignedManager.email'
          },
          'as': 'survey',
          'pipeline': [
            {
              '$addFields': {
                'userId': '$$user',
                'manager': '$$manager'
              }
            }, {
              '$addFields': {
                'match': {
                  '$eq': [
                    '$userId', '$attemptFor'
                  ]
                },
                'managerMatch': {
                  '$eq': [
                    '$email', '$manager'
                  ]
                }
              }
            }, {
              '$match': {
                'match': true,
                'managerMatch': true
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'impactSettings.users.user.survey': '$survey'
        }
      }, {
        '$group': {
          '_id': '$trainingId',
          'ou': {
            '$push': '$ou'
          },
          'ous': {
            '$push': '$ous'
          },
          'users': {
            '$push': '$impactSettings.users.user'
          },
          'surveyId': {
            '$addToSet': '$impactSettings.surveyId'
          }
        }
      }, {
        '$unwind': {
          'path': '$surveyId'
        }
      }, {
        '$addFields': {
          'ous': {
            '$reduce': {
              'input': '$ous',
              'initialValue': [],
              'in': {
                '$setUnion': [
                  '$$this', '$$value'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'ous': {
            '$concatArrays': [
              '$ou', '$ous'
            ]
          }
        }
      }, {
        '$unset': 'ou'
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': '_id',
          'foreignField': '_id',
          'as': 'courseDetails'
        }
      }, {
        '$unwind': {
          'path': '$courseDetails',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$project': {
          'title': '$courseDetails.title',
          'description': '$courseDetails.description',
          'type': '$courseDetails.type',
          'image': '$courseDetails.image',
          'start_date': '$courseDetails.start_date',
          'end_date': '$courseDetails.end_date',
          'ous': '$ous',
          'users': '$users',
          'surveyId': '$surveyId'
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'ous',
          'foreignField': '_id',
          'as': 'ous',
          'pipeline': [
            {
              '$graphLookup': {
                'from': 'organization-units',
                'startWith': '$_id',
                'connectFromField': 'parent',
                'connectToField': '_id',
                'depthField': 'depth',
                'as': 'breadcrumbs'
              }
            }, {
              '$addFields': {
                'breadcrumbs': {
                  '$map': {
                    'input': '$breadcrumbs',
                    'in': {
                      '_id': '$$this._id',
                      'label': '$$this.name',
                      'id': '$$this.id',
                      'icon': '$$this.image_sq',
                      'depth': '$$this.depth'
                    }
                  }
                }
              }
            }, {
              '$project': {
                '_id': '$_id',
                'label': '$name',
                'id': '$id',
                'icon': '$image_sq',
                'breadcrumbs': '$breadcrumbs'
              }
            }
          ]
        }
      }
    ]



    if (filter.status == 'PENDING') {
      pipeline.push({
        '$match': {
          'users.survey': []
        }
      })
    } else {
      pipeline.push({
        '$match': {
          'users.survey': { '$ne': [] }
        }
      })
    }

    if (filter.ou) {
      let ou = new mongoose.Types.ObjectId(filter.ou)
      pipeline.push({
        '$match': {
          'ous._id': ou
        }
      })
    }



    return this.TrainingRequestModel.aggregate(pipeline);
  }

}