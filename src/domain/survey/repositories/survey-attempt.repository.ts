import { InjectModel } from "@nestjs/mongoose";
import { SurveyAttempt } from "../dto/survey-attempt.dto";
import { SurveyAttemptRepository } from "../interfaces/survey-attempt-repository.interface";
import mongoose, { Model } from "mongoose";
import { Survey } from "../dto/survey.dto";


export class SurveyAttemptRepositoryImpl implements SurveyAttemptRepository {

    constructor(
      @InjectModel('survey') private readonly surveyModel: Model<Survey>,
      @InjectModel('survey-attempts') private readonly attemptModel: Model<SurveyAttempt>) { }

    async getById(id: string, email: string): Promise<SurveyAttempt> {
        let pipe = [
            {
                '$match': {
                    '$and': [
                        {
                            'email': email
                        }, {
                            'surveyId': new mongoose.Types.ObjectId(id)
                        }
                    ]
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'email',
                    'foreignField': 'email',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': true
                }
            }
        ];
        let res = await this.attemptModel.aggregate(pipe);
        // console.log(res, id, email);
        return res.length > 0 ? res[0] : null;
    }

    async getMultipleById(id: string, email: string): Promise<any> {
      let pipe = [
          {
              '$match': {
                  '$and': [
                      {
                          'email': email
                      }, {
                          'surveyId': new mongoose.Types.ObjectId(id)
                      }
                  ]
              }
          }, {
              '$lookup': {
                  'from': 'users',
                  'localField': 'email',
                  'foreignField': 'email',
                  'as': 'user'
              }
          }, {
              '$unwind': {
                  'path': '$user',
                  'preserveNullAndEmptyArrays': true
              }
          }
      ];
      return await this.attemptModel.aggregate(pipe);
  }

    async generateNewAttempt(id: string): Promise<any[]> { 
      let pipe:any = 
      [
          {
              '$match': {
                  'surveyId': new mongoose.Types.ObjectId(id)
              }
          },
          {
              '$lookup': {
                  'from': 'surveys',
                  'localField': 'surveyId',
                  'foreignField': '_id',
                  'as': 'gotQuestions',
                  'pipeline': [
                      {
                          '$unwind': '$questions'
                      },
                      {
                          '$replaceRoot': {
                              'newRoot': '$questions'
                          }
                      }
                  ]
              }
          },
          {
              '$set': {
                  'gotQuestions': {
                      '$map': {
                          'input': '$gotQuestions',
                          'as': 'gotQ',
                          'in': {
                              '$mergeObjects': [
                                  '$$gotQ',
                                  {
                                      'meta': {
                                          '$mergeObjects': [
                                              '$$gotQ.meta',
                                              {
                                                  'value': {
                                                      '$let': {
                                                          'vars': {
                                                              'matchingQuestion': {
                                                                  '$arrayElemAt': [
                                                                      {
                                                                          '$filter': {
                                                                              'input': '$questions',
                                                                              'as': 'q',
                                                                              'cond': {
                                                                                  '$eq': [
                                                                                      '$$q.questionCode',
                                                                                      '$$gotQ.questionCode'
                                                                                  ]
                                                                              }
                                                                          }
                                                                      },
                                                                      0
                                                                  ]
                                                              }
                                                          },
                                                          'in': {
                                                              '$cond': [
                                                                  {
                                                                      '$ne': [
                                                                          '$$matchingQuestion.meta.value',
                                                                          null
                                                                      ]
                                                                  },
                                                                  '$$matchingQuestion.meta.value',
                                                                  {
                                                                      '$cond': [
                                                                          {
                                                                              '$ne': [
                                                                                  {
                                                                                      '$arrayElemAt': [
                                                                                          '$$matchingQuestion.meta.fields.value',
                                                                                          0
                                                                                      ]
                                                                                  },
                                                                                  null
                                                                              ]
                                                                          },
                                                                          {
                                                                              '$arrayElemAt': [
                                                                                  '$$matchingQuestion.meta.fields.value',
                                                                                  0
                                                                              ]
                                                                          },
                                                                          {
                                                                              '$cond': [
                                                                                  {
                                                                                      '$ne': [
                                                                                          {
                                                                                              '$arrayElemAt': [
                                                                                                  '$$matchingQuestion.meta.fields.field.value',
                                                                                                  0
                                                                                              ]
                                                                                          },
                                                                                          null
                                                                                      ]
                                                                                  },
                                                                                  {
                                                                                      '$arrayElemAt': [
                                                                                          '$$matchingQuestion.meta.fields.field.value',
                                                                                          0
                                                                                      ]
                                                                                  },
                                                                                  {
                                                                                      '$arrayElemAt': [
                                                                                          '$$matchingQuestion.meta.orderedFields.value',
                                                                                          0
                                                                                      ]
                                                                                  }
                                                                              ]
                                                                          }
                                                                      ]
                                                                  }
                                                              ]
                                                          }
                                                      }
                                                  },
                                                  'fields': {
                                                      '$map': {
                                                          'input': '$$gotQ.meta.fields',
                                                          'as': 'field',
                                                          'in': {
                                                              '$mergeObjects': [
                                                                  '$$field',
                                                                  {
                                                                      'value': {
                                                                          '$let': {
                                                                              'vars': {
                                                                                  'matchingQuestion': {
                                                                                      '$arrayElemAt': [
                                                                                          {
                                                                                              '$filter': {
                                                                                                  'input': '$questions',
                                                                                                  'as': 'q',
                                                                                                  'cond': {
                                                                                                      '$eq': [
                                                                                                          '$$q.questionCode',
                                                                                                          '$$gotQ.questionCode'
                                                                                                      ]
                                                                                                  }
                                                                                              }
                                                                                          },
                                                                                          0
                                                                                      ]
                                                                                  }
                                                                              },
                                                                              'in': {
                                                                                  '$cond': [
                                                                                      {
                                                                                          '$ne': [
                                                                                              '$$matchingQuestion.meta.fields.value',
                                                                                              null
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          '$arrayElemAt': [
                                                                                              '$$matchingQuestion.meta.fields.value',
                                                                                              {
                                                                                                  '$indexOfArray': [
                                                                                                      '$$gotQ.meta.fields.label',
                                                                                                      '$$field.label'
                                                                                                  ]
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      null
                                                                                  ]
                                                                              }
                                                                          }
                                                                      }
                                                                  }
                                                              ]
                                                          }
                                                      }
                                                  }
                                              }
                                          ]
                                      }
                                  }
                              ]
                          }
                      }
                  }
              }
          },
          {
              '$addFields': {
                  'questions': '$gotQuestions'
              }
          },
          {
              '$unset': 'gotQuestions'
          },
          {
              '$merge': {
                  'into': 'survey-attempts',
                  'on': '_id',
                  'whenMatched': 'replace',
                  'whenNotMatched': 'insert'
              }
          }
      ];        
      return await this.attemptModel.aggregate(pipe);
    }

    totalCount(): Promise<number> {
        return this.attemptModel.countDocuments();
    }

    save(surveyAttempt: SurveyAttempt): Promise<SurveyAttempt> {
        return this.attemptModel.create(surveyAttempt);
    }


    async checkIfAttempted(email: string, surveyId: string, isRedo: boolean): Promise<boolean> {
      // First, find the survey to check multiAttemptAllow
      const survey = await this.surveyModel.findById(surveyId);
      
      // If multiAttemptAllow is true, always return false (allowing multiple attempts)
      if (survey?.multiAttemptAllow) {
          return false;
      }
      
      return (await this.attemptModel.countDocuments({ email, surveyId, isRedoAllow: isRedo })) > 0
    }

    async checkIfRated(email: string, surveyId: string, ratingForID: string): Promise<boolean> {
      // First, find the survey to check multiAttemptAllow
      const survey = await this.surveyModel.findById(surveyId);
      
      // If multiAttemptAllow is true, always return false (allowing multiple attempts)
      if (survey?.multiAttemptAllow) {
          return false;
      }
      
      // If multiAttemptAllow is false or not set, count existing documents
      return (await this.attemptModel.countDocuments({ email, surveyId, ratingForID })) > 0;
  }

    async deleteByEmail(surveyId: string, email:string, ratingForID: string): Promise<any> {
      if (ratingForID != '')
      {
        return this.attemptModel.deleteOne({ surveyId: surveyId, email:email, ratingForID: ratingForID });
      }
      else{
        return this.attemptModel.deleteOne({ surveyId: surveyId, email:email });
      }
    }

    async allowRedoByEmailAndAssessmentId(surveyId: string, email: string, isRedoAllow: boolean): Promise<any>  {
      return await this.attemptModel.updateMany({ surveyId, email }, { $set: { isRedoAllow: isRedoAllow } });
    }

    updateAttempt(data: any): Promise<any> {
        let _id = data._id;
        delete data._id;
        return this.attemptModel.updateOne({ _id }, { $set: data })
    }

    async getAvgRating(data:any): Promise<any> {

        let match: any = {
            'ratingForID': data.ratingForID,
            'ratingFor': data.ratingFor,
        };

        let matchType: any = {};
        if (data.type_id) {
            matchType['type_id'] = new mongoose.Types.ObjectId(data.type_id);
        }

        let pipe: any = [
            {
              '$match': match
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
              '$lookup': {
                'from': 'courses', 
                'localField': 'courseId', 
                'foreignField': '_id', 
                'as': 'courseId'
              }
            }, {
              '$project': {
                'avg_rating': 1, 
                'course_id': {
                  '$first': '$courseId._id'
                }, 
                'course': {
                  '$first': '$courseId.title'
                }, 
                'training_type': {
                  '$first': '$courseId.type'
                }, 
                'request_id': {
                  '$first': '$courseId.request_id'
                }
              }
            }, {
              '$lookup': {
                'from': 'training_request', 
                'localField': 'request_id', 
                'foreignField': '_id', 
                'as': 'request', 
                'pipeline': [
                  {
                    '$project': {
                      '_id': 0, 
                      'type': 1
                    }
                  }
                ]
              }
            }, {
              '$addFields': {
                'type_id': {
                  '$first': '$request.type'
                }
              }
            },{
                '$match': matchType
            }, {
              '$unset': 'request'
            }, {
              '$sort': {
                'updatedAt': -1
              }
            }, {
              '$limit': data.limit
            }
        ]

        let res = await this.attemptModel.aggregate(pipe);
        return res;
    }
}