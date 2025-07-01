import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { TrainingProgram, UpdateTrainingProgram } from "../dto/training.dto";
import { TrainingRepository } from "../interfaces/training-repository.interface";
import { pipe } from "rxjs";
import { types } from "joi";

@Injectable()
export class TrainingRepositoryImpl implements TrainingRepository {


  constructor(@InjectModel('TrainingProgram') private readonly TrainingModel: Model<TrainingProgram>) { }

  /**
   *
   *
   * @param {TrainingProgram} data
   * @return {*}  {Promise<TrainingProgram>}
   * @memberof TrainingRepositoryImpl
   */
  create(data: TrainingProgram): Promise<TrainingProgram> {
    return this.TrainingModel.create(data);
  }


  /**
   *
   *
   * @param {UpdateTrainingProgram} data
   * @return {*}  {Promise<TrainingProgram>}
   * @memberof TrainingRepositoryImpl
   */
  update(data: UpdateTrainingProgram): Promise<TrainingProgram> {
    return this.TrainingModel.findByIdAndUpdate(data._id, data);
  }


  /**
   *
   *
   * @param {number} page
   * @param {number} size
   * @return {*}  {*}
   * @memberof TrainingRepositoryImpl
   */
  async getAll(page: number, size: number): Promise<any> {
    //pagination 
    const offset = page * size;
    let totalDocuments = await this.TrainingModel.countDocuments();
    let data = await this.TrainingModel.find().limit(size).skip(offset).populate(["courses", "ous"]).populate("attendees", "_id name email image phone");
    return { data: data, totalDocuments };
  }


  /**
   *
   *
   * @param {number} page
   * @param {number} size
   * @return {*}  {*}
   * @memberof TrainingRepositoryImpl
   */
  async getAggregatedTrainingPrograms(query: any, page: number, size: number): Promise<any> {
    //pagination 
    const skip = (page - 1) * size;


    let dateMatch: any = {}
    let pipeline: any = []
    let logicalDateCreated = false

    if (query.start_date || query.start_date) {
      dateMatch = {
        '$or': [
          {
            'start_date_logical': {
              '$gte': new Date(query.start_date),
              '$lte': new Date()
            }
          }, {
            'end_date_logical': {
              '$gte': new Date(query.end_date),
              '$lte': new Date()
            }
          }
        ]
      }

      pipeline.push({
        '$addFields': {
          'start_date_logical': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$start_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          },
          'end_date_logical': {
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
        '$match': dateMatch
      },)

      delete query.start_date
      delete query.end_date
      logicalDateCreated = true
    }

    if (query?.status == 'COMPLETED') {

      if (!logicalDateCreated) {
        pipeline.push({
          '$addFields': {
            'start_date_logical': {
              '$dateAdd': {
                'startDate': {
                  '$toDate': '$start_date'
                },
                'unit': 'hour',
                'amount': 5
              }
            },
            'end_date_logical': {
              '$dateAdd': {
                'startDate': {
                  '$toDate': '$end_date'
                },
                'unit': 'hour',
                'amount': 5
              }
            }
          }
        })
      }

      pipeline.push({
        $match: {
          end_date_logical: { $lt: new Date() }
        }
      })
      delete query.status

      // console.log("Position 2 Pipeline", pipeline)
    }

    if (query._id) query._id = new mongoose.Types.ObjectId(query._id)

    pipeline = [...pipeline,

    {
      '$match': query
    },
    {
      '$lookup': {
        'from': 'organization-units',
        'localField': 'ous',
        'foreignField': '_id',
        'as': 'ous',
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
    },
    {
      '$lookup': {
        'from': 'users',
        'localField': 'attendees',
        'foreignField': '_id',
        'as': 'attendees',
        'pipeline': [
          {
            '$project': {
              'email': 1,
              'phone': 1,
              'ou': 1,
              'location': 1,
              'name': 1
            }
          }
        ]
      }
    },
    {
      '$lookup': {
        'from': 'training_request',
        'localField': 'courses',
        'foreignField': 'trainingId',
        'as': 'courses',
        'pipeline': [
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
          }
          , {
            '$unwind': {
              'path': '$ou',
              'preserveNullAndEmptyArrays': true
            }
          }, {
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
                    'from': 'users',
                    'localField': 'attendees',
                    'foreignField': '_id',
                    'as': 'attendees',
                    'pipeline': [
                      {
                        '$project': {
                          'email': 1,
                          'phone': 1,
                          'ou': 1,
                          'location': 1,
                          'name': 1
                        }
                      }
                    ]
                  }
                },
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
        ]
      }
    }
    ]

    let countPipe = [...pipeline]
    let count: any = await this.countAggrigated(countPipe)

    let test: number = 2 * (size) - size

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





    let data = await this.TrainingModel.aggregate(pipeline);

    return { data: data, totalRecords: count.lenght > 0 ? count[0].count : 0 };
  }

  async countAggrigated(pipeline: any) {
    pipeline.push({
      '$count': 'count'
    })

    return this.TrainingModel.aggregate(pipeline);
  }

  /**
   *
   * @param {string} _id
   * @return {*}  {Promise<any>}
   * @memberof TrainingRepositoryImpl
   */
  delete(_id: string): Promise<any> {
    return this.TrainingModel.deleteOne({ _id })
  }

  /**
   *
   *
   * @param {string} _id
   * @return {*}  {Promise<TrainingProgram>}
   * @memberof TrainingRepositoryImpl
   */
  getOne(_id: string): Promise<any> {
    return this.TrainingModel.findById({ _id }).populate(["courses", "ous"]).populate("attendees", "_id name email image phone");
  }

  /**
   *
   *
   * @param {string} _id
   * @return {*}  {Promise<TrainingProgram>}
   * @memberof TrainingRepositoryImpl
   */
  getOneSimple(_id: string): Promise<any> {
    return this.TrainingModel.findById({ _id });
  }

  async getMergedTrainingProgramAndCourses(page: number, offset: number, filter: any): Promise<any> {
    const skip: number = page * offset - offset;
    let test: number = 2 * (offset) - offset

    const pipeline: any[] = [
      {
        '$addFields': {
          'isProgram': true
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'ous',
          'foreignField': '_id',
          'as': 'ous'
        }
      }, {
        '$lookup': {
          'from': 'training_request',
          'localField': 'courses',
          'foreignField': 'trainingId',
          'as': 'courses',
          'pipeline': [
            {
              '$match': {
                'trainingId': {
                  '$ne': null
                }
              }
            }, {
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
            }, {
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
              '$lookup': {
                'from': 'organization-units',
                'localField': 'ous',
                'foreignField': '_id',
                'as': 'ous'
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
                      'from': 'users',
                      'localField': 'attendees',
                      'foreignField': '_id',
                      'as': 'attendees',
                      'pipeline': [
                        {
                          '$project': {
                            '_id': 1,
                            'name': 1,
                            'email': 1,
                            'image': 1,
                            'phone': 1
                          }
                        }
                      ]
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
            }, {
              '$lookup': {
                'from': 'users',
                'localField': 'attendees',
                'foreignField': '_id',
                'as': 'attendees',
                'pipeline': [
                  {
                    '$project': {
                      '_id': 1,
                      'name': 1,
                      'email': 1,
                      'image': 1,
                      'phone': 1
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
          'localField': 'attendees',
          'foreignField': '_id',
          'as': 'attendees',
          'pipeline': [
            {
              '$project': {
                '_id': 1,
                'name': 1,
                'email': 1,
                'image': 1,
                'phone': 1
              }
            }
          ]
        }
      }, {
        '$unionWith': {
          'coll': 'training_request',
          'pipeline': [
            {
              '$match': {
                'programId': null
              }
            }, {
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
            }, {
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
              '$lookup': {
                'from': 'organization-units',
                'localField': 'ous',
                'foreignField': '_id',
                'as': 'ous'
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
                    '$match': {
                      'programId': null
                    }
                  }, {
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
                      'from': 'users',
                      'localField': 'attendees',
                      'foreignField': '_id',
                      'as': 'attendees',
                      'pipeline': [
                        {
                          '$project': {
                            '_id': 1,
                            'name': 1,
                            'email': 1,
                            'image': 1,
                            'phone': 1
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }, {
              '$match': {
                'trainingId': {
                  '$ne': []
                }
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
            }, {
              '$lookup': {
                'from': 'users',
                'localField': 'attendees',
                'foreignField': '_id',
                'as': 'attendees',
                'pipeline': [
                  {
                    '$project': {
                      '_id': 1,
                      'name': 1,
                      'email': 1,
                      'image': 1,
                      'phone': 1
                    }
                  }
                ]
              }
            }, {
              '$addFields': {
                'isProgram': false
              }
            }
          ]
        }
      }, {
        '$sort': {
          'createdAt': -1
        }
      }
    ]


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

    if (filter.trainer || filter.master_trainer || filter.ou || filter.ous) {

      var cond = []

      if (filter.trainer) {
        cond.push({
          $or: [
            { 'trainer.user_id': filter.trainer },
            { 'courses.trainer.user_id': filter.trainer }
          ]
        });
      }

      if (filter.master_trainer) {
        cond.push({
          $or: [
            { 'master_trainer': new mongoose.Types.ObjectId(filter.master_trainer) },
            { 'courses.master_trainer': new mongoose.Types.ObjectId(filter.master_trainer) }
          ]
        });
      }

      if (filter.ou) {
        const ouCondition = Array.isArray(filter.ou) ? {
          '$in': filter.ou.map((ou: any) => new mongoose.Types.ObjectId(ou))
        } : new mongoose.Types.ObjectId(filter.ou);

        cond.push({
          $or: [
            { 'ou._id': ouCondition },
            { 'courses.ou._id': ouCondition }
          ]
        });
      }

      if (filter.ous) {
        const ousCondition = filter.ous.map((ou: any) => new mongoose.Types.ObjectId(ou));

        if (filter?.allowedNullOu) {
          cond.push({
            $or: [
              {
                $or: [
                  { 'ous': { $exists: false } },
                  { 'ous': { $eq: [] } },
                  { 'ous': { $eq: null } },
                  { 'ous': { '$in': ousCondition } }
                ]
              },
              {
                $or: [
                  { 'courses.ous': { $exists: false } },
                  { 'courses.ous': { $eq: [] } },
                  { 'courses.ous': { $eq: null } },
                  { 'courses.ous': { '$in': ousCondition } }
                ]
              }
            ]
          });
        } else {
          cond.push({
            $or: [
              { 'ous': { '$in': ousCondition } },
              { 'courses.ous': { '$in': ousCondition } }
            ]
          });
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
          $or: [
            { 'creator': new mongoose.Types.ObjectId(filter.creator) },
            { 'courses.creator': new mongoose.Types.ObjectId(filter.creator) }
          ]
        }
      });
    }



    let countPipeline = JSON.parse(JSON.stringify(pipeline))


    pipeline.push({
      '$skip': skip
    })
    pipeline.push({
      '$limit': test
    })


    let data = await this.TrainingModel.aggregate(pipeline);

    // pipeline.push({
    //   '$count': 'count'
    // })


    //count Documents

    let count = await this.TrainingModel.countDocuments(countPipeline);
    let totalCount = 0

    if (count) {
      totalCount = count
    }


    return { data: data, totalCount: totalCount }
  }



  getTrainingProgramAttendees(_id: string): Promise<any> {
    try {

      return this.TrainingModel.aggregate([
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(_id)
          }
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'attendees',
            'foreignField': '_id',
            'as': 'attendees'
          }
        }, {
          '$unwind': '$attendees'
        }, {
          '$project': {
            'attendees.name': 1,
            'attendees.phone': 1,
            'attendees.email': 1,
            'attendees.externalUser': 1,
            'attendees.location': 1
          }
        }, {
          '$lookup': {
            'from': 'locations',
            'localField': 'attendees.location',
            'foreignField': '_id',
            'as': 'attendees.location'
          }
        }, {
          '$unwind': '$attendees.location'
        }, {
          '$group': {
            '_id': '$_id',
            'attendees': {
              '$push': '$attendees'
            }
          }
        }, {
          '$project': {
            'attendees': 1,
            '_id': 0
          }
        }
      ])

    } catch (error) {
      return error
    }
  }

  async removeCourseFromProgram(_id: string, programId: string): Promise<any> {
    return this.TrainingModel.updateOne({ _id: programId }, { $pull: { courses: _id } })
  }
}