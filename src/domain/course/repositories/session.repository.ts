import { Injectable } from "@nestjs/common";
import { SessionRepository } from "../interfaces/session-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, UpdateWriteOpResult } from "mongoose";
import { Session, UpdateSession } from "../dto/session.dto";


@Injectable()
export class SessionRepositoryImpl implements SessionRepository {

  constructor(@InjectModel('Session') private readonly sessionModel: Model<Session>) { }

  /**
   *
   *
   * @param {Session} Session
   * @return {*}  {Promise<Session>}
   * @memberof SessionRepositoryImpl
   */
  public async create(Session: Session): Promise<Session> {
    let totalCount = await this.sessionModel.countDocuments({ courseId: Session.courseId })
    Session.order = totalCount + 1;
    return this.sessionModel.create(Session);
  }

  public async updateResults(courseId: string, id: string, results: any):Promise<UpdateWriteOpResult> {
    return this.sessionModel.updateOne({ courseId, $or: [{ surveyId: id }, { assessmentId: id }] }, { $set: { results } })
  }


  public async updateSessionOrder(data: [{ _id: string, order: number }]) {
    const bulkUpdateOps: any = data.map(session => ({
      updateOne: {
        filter: { _id: session._id },
        update: { $set: { order: session.order } }
      }
    }));

    return await this.sessionModel.bulkWrite(bulkUpdateOps);
  }

  /**
   *
   *
   * @return {*}  {Promise<Session[]>}
   * @memberof SessionRepositoryImpl
   */
  public getAll(): Promise<Session[]> {
    return this.sessionModel.find();
  }

  public getSessionTrainers(id: string): Promise<any> {
    return this.sessionModel.aggregate([
        {
          '$match': {
            'courseId': new Types.ObjectId(id)
          }
        }, {
          '$group': {
            '_id': '$trainer.user_id', 
            'trainer': {
              '$first': '$trainer'
            }, 
            'courseId': {
              '$first': '$courseId'
            }
          }
        }, {
          '$match': {
            '_id': {
              '$ne': null
            }
          }
        }, {
          '$addFields': {
            'trainer.courseId': '$courseId'
          }
        }, {
          '$replaceRoot': {
            'newRoot': '$trainer'
          }
        }, {
          '$lookup': {
            'from': 'survey-attempts', 
            'localField': 'user_id', 
            'foreignField': 'ratingForID', 
            'let': {
              'courseId': '$courseId'
            }, 
            'as': 'rating', 
            'pipeline': [
              {
                '$addFields': {
                  'matchId': {
                    '$eq': [
                      '$$courseId', '$courseId'
                    ]
                  }
                }
              }, {
                '$match': {
                  'ratingFor': 'Trainer', 
                  'matchId': true
                }
              }
            ]
          }
        }, {
          '$addFields': {
            'questions': {
              '$reduce': {
                'input': '$rating', 
                'initialValue': [], 
                'in': {
                  '$concatArrays': [
                    '$$value', '$$this.questions'
                  ]
                }
              }
            }
          }
        }, {
          '$addFields': {
            'meta': {
              '$reduce': {
                'input': '$questions', 
                'initialValue': [], 
                'in': {
                  '$cond': [
                    {
                      '$eq': [
                        '$$this.type', 'STAR_RATING'
                      ]
                    }, {
                      '$concatArrays': [
                        '$$value', '$$this.meta.fields'
                      ]
                    }, {
                      '$concatArrays': [
                        '$$value', []
                      ]
                    }
                  ]
                }
              }
            }
          }
        }, {
          '$addFields': {
            'score': {
              '$reduce': {
                'input': '$meta', 
                'initialValue': {
                  'sum': 0, 
                  'count': 0
                }, 
                'in': {
                  'sum': {
                    '$add': [
                      '$$value.sum', '$$this.value'
                    ]
                  }, 
                  'count': {
                    '$add': [
                      '$$value.count', 1
                    ]
                  }
                }
              }
            }
          }
        }, {
          '$addFields': {
            'avg_rating': {
              '$cond': {
                'if': {
                  '$ne': [
                    '$score.count', 0
                  ]
                }, 
                'then': {
                  '$divide': [
                    '$score.sum', '$score.count'
                  ]
                }, 
                'else': null
              }
            }
          }
        }, {
          '$unset': [
            'questions', 'meta'
          ]
        }
      ]).exec();
  }


  formatDateTimeObject(input: any): any {
    const { trainerId, date, start_time, end_time, sessionId } = input;

    // Parse the date string into a JavaScript Date object
    const parsedDate = new Date(date);

    // Set hours and minutes to 00:00
    parsedDate.setUTCHours(0, 0, 0, 0);

    // Parse the start_time and end_time strings into hours and minutes
    const [startHours, startMinutes] = start_time.split(':').map(Number);
    const [endHours, endMinutes] = end_time.split(':').map(Number);

    // Create the start_date and end_date objects
    const start_date = new Date(parsedDate); // Copy the parsedDate object
    start_date.setUTCHours(startHours, startMinutes);

    const end_date = new Date(parsedDate); // Copy the parsedDate object
    end_date.setUTCHours(endHours, endMinutes);

    // Add one day to start_date and end_date
    start_date.setDate(start_date.getDate() + 1);
    end_date.setDate(end_date.getDate() + 1);

    return {
      trainerId: trainerId,
      start_date: start_date.toISOString(), // Convert to ISO string format
      end_date: end_date.toISOString(), // Convert to ISO string format
      sessionId : sessionId
    };
  }
  public checkTrainerAvailability(query: any): Promise<any> {
    let convertedQuery = this.formatDateTimeObject(query)
    return this.sessionModel.aggregate(
      [
        {
          '$match': {
            'trainer.user_id': convertedQuery.trainerId,
            'start_time': {
              '$ne': null
            },
            'end_time': {
              '$ne': null
            },
            '_id' :  { $ne : convertedQuery?.sessionId ? new Types.ObjectId(convertedQuery.sessionId) : null}
          }
        }, {
          '$addFields': {
            'new_date': {
              '$dateAdd': {
                'startDate': {
                  '$toDate': '$date'
                },
                'unit': 'hour',
                'amount': 5
              }
            }
          }
        }, {
          '$addFields': {
            'start_date': {
              '$dateFromString': {
                'dateString': {
                  '$dateToString': {
                    'format': '%Y-%m-%d',
                    'date': '$new_date'
                  }
                }
              }
            },
            'end_date': {
              '$dateFromString': {
                'dateString': {
                  '$dateToString': {
                    'format': '%Y-%m-%d',
                    'date': '$new_date'
                  }
                }
              }
            }
          }
        }, {
          '$addFields': {
            'start_date': {
              '$dateAdd': {
                'startDate': '$start_date',
                'unit': 'hour',
                'amount': {
                  '$toInt': {
                    '$first': {
                      '$split': [
                        '$start_time', ':'
                      ]
                    }
                  }
                }
              }
            },
            'end_date': {
              '$dateAdd': {
                'startDate': '$end_date',
                'unit': 'hour',
                'amount': {
                  '$toInt': {
                    '$first': {
                      '$split': [
                        '$end_time', ':'
                      ]
                    }
                  }
                }
              }
            }
          }
        }, {
          '$addFields': {
            'start_date': {
              '$dateAdd': {
                'startDate': '$start_date',
                'unit': 'minute',
                'amount': {
                  '$toInt': {
                    '$last': {
                      '$split': [
                        '$start_time', ':'
                      ]
                    }
                  }
                }
              }
            },
            'end_date': {
              '$dateAdd': {
                'startDate': '$end_date',
                'unit': 'minute',
                'amount': {
                  '$toInt': {
                    '$last': {
                      '$split': [
                        '$end_time', ':'
                      ]
                    }
                  }
                }
              }
            }
          }
        }, {
          '$project': {
            'new_date': 0
          }
        }, {
          '$addFields': {
            'IsActiveOnThatDay': {
              '$or': [
                {
                  '$and': [
                    {
                      '$gte': [
                        {
                          '$toDate': convertedQuery.start_date
                        }, '$start_date'
                      ]
                    }, {
                      '$lte': [
                        {
                          '$toDate': convertedQuery.start_date
                        }, '$end_date'
                      ]
                    }
                  ]
                }, {
                  '$and': [
                    {
                      '$gte': [
                        {
                          '$toDate': convertedQuery.end_date
                        }, '$start_date'
                      ]
                    }, {
                      '$lte': [
                        {
                          '$toDate': convertedQuery.end_date
                        }, '$end_date'
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }, {
          '$group': {
            '_id': null,
            'busy': {
              '$max': '$IsActiveOnThatDay'
            }
          }
        }
      ]
    )
  }

  /**
   *
   *
   * @param {UpdateSession} Session
   * @return {*}  {Promise<UpdateWriteOpResult>}
   * @memberof SessionRepositoryImpl
   */
  public update(Session: UpdateSession): Promise<UpdateWriteOpResult> {
    let _id = Session._id;
    delete Session._id;
    return this.sessionModel.updateOne({ _id }, { $set: Session })
  }

  public addSeenBy(Session: any): Promise<any> {
    let _id = Session._id;
    delete Session._id;
    return this.sessionModel.updateOne({ _id: _id, seenby: { $ne: Session.user_id } },
      { $addToSet: { seenby: Session.user_id } })
  }

  /**
   *
   *
   * @param {string} _id
   * @return {*}  {Promise<any>}
   * @memberof SessionRepositoryImpl
   */
  public delete(_id: string): Promise<any> {
    return this.sessionModel.deleteOne({ _id });
  }
}