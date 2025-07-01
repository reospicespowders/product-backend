import mongoose , { Model } from "mongoose";
import { AssessmentSurveyCache } from "../entities/assessment-survey-cache.entity";
import { CacheRepository } from "../interfaces/cache-repository.interface";
import { InjectModel } from "@nestjs/mongoose";



export class CacheRepositoryImpl implements CacheRepository {
    constructor(@InjectModel("assessment-survey-cache") private readonly cacheModal: Model<AssessmentSurveyCache>) { }

    save(data: AssessmentSurveyCache): Promise<AssessmentSurveyCache> {
        return this.cacheModal.findOneAndUpdate({ 'data._id': data.data._id, 'data.email': data.data.email }, { data: data.data }, { upsert: true, new: true }).exec();
    }

    getCache(surveyId: string, email: string): Promise<AssessmentSurveyCache> {
        return this.cacheModal.findOne({ 
            'data._id': surveyId, 
            'data.email': email, 
            $or: [
                { 'data.multiAttemptAllow': false },
                { 'data.multiAttemptAllow': null }
            ]
        });
    }

    async getCacheCount(_id:string ): Promise<any> {
        let pipe: any = [
            {
              '$match': {
                'data._id': _id
              }
            }, {
              '$addFields': {
                'assessmentId': {
                  '$toObjectId': '$data._id'
                }
              }
            }, {
              '$lookup': {
                'from': 'assessment-results', 
                'localField': 'data.email', 
                'foreignField': 'email', 
                'as': 'isalreadycreated', 
                'let': {
                  'aId': '$data._id'
                }, 
                'pipeline': [
                  {
                    '$project': {
                      '_id': 1, 
                      'email': 1, 
                      'compare': [
                        '$assessmentId', {
                          '$toObjectId': '$$aId'
                        }
                      ], 
                      'assessmentId': {
                        '$eq': [
                          '$assessmentId', {
                            '$toObjectId': '$$aId'
                          }
                        ]
                      }
                    }
                  }, {
                    '$match': {
                      'assessmentId': true
                    }
                  }
                ]
              }
            }, {
              '$addFields': {
                'isalreadycreatedsize': {
                  '$size': '$isalreadycreated'
                }
              }
            }, {
              '$match': {
                'isalreadycreatedsize': 0
              }
            }, {
              '$count': 'count'
            }
          ];
  
        let result = await this.cacheModal.aggregate(pipe).exec();

        if(result[0]) {
            return result[0]
        } else {
            return {}
        }
    }

    async getExcelData(_id:string): Promise<any> {

        let pipe: any = [
        {
        '$match': {
            'data._id': _id
        }
        }, {
            '$addFields': {
                'assessmentId': {
                '$toObjectId': '$data._id'
                }
            }
            }, {
            '$lookup': {
                'from': 'assessment-results', 
                'localField': 'data.email', 
                'foreignField': 'email', 
                'as': 'isalreadycreated', 
                'let': {
                'aId': '$data._id'
                }, 
                'pipeline': [
                {
                    '$project': {
                    '_id': 1, 
                    'email': 1, 
                    'compare': [
                        '$assessmentId', {
                        '$toObjectId': '$$aId'
                        }
                    ], 
                    'assessmentId': {
                        '$eq': [
                        '$assessmentId', {
                            '$toObjectId': '$$aId'
                        }
                        ]
                    }
                    }
                }, {
                    '$match': {
                    'assessmentId': true
                    }
                }
                ]
            }
            }, {
            '$addFields': {
                'isalreadycreatedsize': {
                '$size': '$isalreadycreated'
                }
            }
            }, {
            '$match': {
                'isalreadycreatedsize': 0
            }
            }, {
            '$project': {
                '_id': 0, 
                'assessmentId': {
                '$toObjectId': '$data._id'
                }, 
                'questions': '$data.questions', 
                'email': '$data.email', 
                'externalName': '$data.externalName', 
                'externalGender': '$data.externalGender', 
                'isRedoAllow': {
                '$toBool': 0
                }, 
                'attempt': 1, 
                'timeTaken': '$data.secondsUntilEndDate', 
                'externalQuestions': '$data.externalQuestions'
            }
            }, {
            '$addFields': {
                'score': {
                '$map': {
                    'input': '$questions', 
                    'in': {
                    'value': {
                        '$cond': {
                        'if': {
                            '$eq': [
                            {
                                '$type': '$$this.meta.value'
                            }, 'array'
                            ]
                        }, 
                        'then': '$$this.meta.value', 
                        'else': {
                            '$ifNull': [
                            '$$this.meta.value', {
                                '$cond': [
                                {
                                    '$ne': [
                                    '$$this.meta.fields.value', []
                                    ]
                                }, '$$this.meta.fields.value', {
                                    '$cond': [
                                    {
                                        '$ne': [
                                        '$$this.meta.fields.field.value', []
                                        ]
                                    }, '$$this.meta.fields.field.value', {
                                        '$cond': [
                                        {
                                            '$ne': [
                                            '$$this.meta.orderedFields.order', []
                                            ]
                                        }, '$$this.meta.orderedFields.order', 'No Value'
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
                    'correct': {
                        '$cond': {
                        'if': {
                            '$eq': [
                            {
                                '$type': '$$this.meta.correct'
                            }, 'array'
                            ]
                        }, 
                        'then': '$$this.meta.correct', 
                        'else': {
                            '$ifNull': [
                            '$$this.meta.correct', {
                                '$cond': [
                                {
                                    '$ne': [
                                    '$$this.meta.fields.correct', []
                                    ]
                                }, '$$this.meta.fields.correct', {
                                    '$cond': [
                                    {
                                        '$ne': [
                                        '$$this.meta.fields.field.correct', []
                                        ]
                                    }, '$$this.meta.fields.field.correct', 'No Correct Value'
                                    ]
                                }
                                ]
                            }
                            ]
                        }
                        }
                    }, 
                    'marks': '$$this.meta.marks'
                    }
                }
                }, 
                'totalmarks': {
                '$reduce': {
                    'input': '$questions', 
                    'initialValue': 0, 
                    'in': {
                    '$add': [
                        '$$value', '$$this.meta.marks'
                    ]
                    }
                }
                }
            }
            }, {
            '$addFields': {
                'totalmarks': {
                '$ifNull': [
                    '$totalmarks', {
                    '$reduce': {
                        'input': '$questions', 
                        'initialValue': 0, 
                        'in': {
                        '$add': [
                            '$$value', {
                            '$cond': [
                                {
                                '$or': [
                                    '$$this.meta.marks'
                                ]
                                }, '$$this.meta.marks', 0
                            ]
                            }
                        ]
                        }
                    }
                    }
                ]
                }
            }
            }, {
            '$addFields': {
                'scoring': {
                '$map': {
                    'input': '$score', 
                    'in': {
                    '$cond': {
                        'if': {
                        '$eq': [
                            {
                            '$type': '$$this.correct'
                            }, 'array'
                        ]
                        }, 
                        'then': {
                        '$multiply': [
                            {
                            '$divide': [
                                {
                                '$size': {
                                    '$setIntersection': [
                                    {
                                        '$ifNull': [
                                        '$$this.correct', []
                                        ]
                                    }, {
                                        '$ifNull': [
                                        '$$this.value', []
                                        ]
                                    }
                                    ]
                                }
                                }, {
                                '$cond': [
                                    {
                                    '$eq': [
                                        {
                                        '$size': '$$this.correct'
                                        }, 0
                                    ]
                                    }, 1, {
                                    '$size': '$$this.correct'
                                    }
                                ]
                                }
                            ]
                            }, '$$this.marks'
                        ]
                        }, 
                        'else': {
                        '$cond': {
                            'if': {
                            '$eq': [
                                {
                                '$type': '$$this.correct'
                                }, 'object'
                            ]
                            }, 
                            'then': {
                            '$cond': {
                                'if': {
                                '$eq': [
                                    '$$this.value', '$$this.correct'
                                ]
                                }, 
                                'then': '$$this.marks', 
                                'else': 0
                            }
                            }, 
                            'else': {
                            '$cond': {
                                'if': {
                                '$and': [
                                    {
                                    '$eq': [
                                        '$$this.value', '$$this.correct'
                                    ]
                                    }, {
                                    '$ifNull': [
                                        '$$this.correct', false
                                    ]
                                    }
                                ]
                                }, 
                                'then': '$$this.marks', 
                                'else': 0
                            }
                            }
                        }
                        }
                    }
                    }
                }
                }
            }
            }, {
            '$addFields': {
                'score': {
                '$reduce': {
                    'input': '$scoring', 
                    'initialValue': 0, 
                    'in': {
                    '$add': [
                        '$$this', '$$value'
                    ]
                    }
                }
                }, 
                'questions': {
                '$map': {
                    'input': '$questions', 
                    'in': {
                    '$arrayToObject': {
                        '$concatArrays': [
                        {
                            '$objectToArray': '$$this'
                        }, [
                            {
                            'k': 'score', 
                            'v': {
                                '$arrayElemAt': [
                                '$scoring', {
                                    '$indexOfArray': [
                                    '$questions', '$$this'
                                    ]
                                }
                                ]
                            }
                            }
                        ]
                        ]
                    }
                    }
                }
                }
            }
            }, {
            '$unset': 'scoring'
            }, {
            '$addFields': {
                'externalQuestions': {
                '$map': {
                    'input': '$externalQuestions', 
                    'as': 'item', 
                    'in': {
                    '$mergeObjects': [
                        '$$item', {
                        'externalQuestion': true, 
                        'order': -1
                        }
                    ]
                    }
                }
                }
            }
            }, {
            '$addFields': {
                'questions': {
                '$concatArrays': [
                    '$externalQuestions', '$questions'
                ]
                }
            }
            }, {
            '$addFields': {
                'DRAG_DROP': {
                '$reduce': {
                    'input': '$questions', 
                    'initialValue': [], 
                    'in': {
                    '$cond': {
                        'if': {
                        '$eq': [
                            '$$this.type', 'DRAG_DROP'
                        ]
                        }, 
                        'then': {
                        '$concatArrays': [
                            '$$value', [
                            '$$this'
                            ]
                        ]
                        }, 
                        'else': '$$value'
                    }
                    }
                }
                }, 
                'TEXT_QUESTIONS': {
                '$reduce': {
                    'input': '$questions', 
                    'initialValue': [], 
                    'in': {
                    '$cond': {
                        'if': {
                        '$or': [
                            {
                            '$eq': [
                                '$$this.type', 'SINGLE_ROW_TEXT'
                            ]
                            }, {
                            '$eq': [
                                '$$this.type', 'EMAIL_ADDRESS'
                            ]
                            }, {
                            '$eq': [
                                '$$this.type', 'COMMENT_BOX'
                            ]
                            }, {
                            '$eq': [
                                '$$this.type', 'CONTACT_INFO'
                            ]
                            }
                        ]
                        }, 
                        'then': {
                        '$concatArrays': [
                            '$$value', {
                            '$map': {
                                'input': '$$this.meta.fields', 
                                'as': 'f', 
                                'in': {
                                'label': '$$f.label', 
                                'value': '$$f.value', 
                                'o': '$$this.order', 
                                's': '$$this.score', 
                                'ex': '$$this.externalQuestion'
                                }
                            }
                            }
                        ]
                        }, 
                        'else': '$$value'
                    }
                    }
                }
                }, 
                'SELECT_ONE': {
                '$reduce': {
                    'input': '$questions', 
                    'initialValue': [], 
                    'in': {
                    '$cond': {
                        'if': {
                        '$or': [
                            {
                            '$eq': [
                                '$$this.type', 'SELECT_ONE'
                            ]
                            }, {
                            '$eq': [
                                '$$this.type', 'DROPDOWN_MENU'
                            ]
                            }, {
                            '$eq': [
                                '$$this.type', 'SELECT_ONE_IMAGE'
                            ]
                            }, {
                            '$eq': [
                                '$$this.type', 'SMILE_RATING'
                            ]
                            }, {
                            '$eq': [
                                '$$this.type', 'CALENDER'
                            ]
                            }
                        ]
                        }, 
                        'then': {
                        '$concatArrays': [
                            '$$value', [
                            '$$this'
                            ]
                        ]
                        }, 
                        'else': '$$value'
                    }
                    }
                }
                }, 
                'SELECT_MANY': {
                '$reduce': {
                    'input': '$questions', 
                    'initialValue': [], 
                    'in': {
                    '$cond': {
                        'if': {
                        '$or': [
                            {
                            '$eq': [
                                '$$this.type', 'SELECT_MANY'
                            ]
                            }, {
                            '$eq': [
                                '$questionType', 'SELECT_MANY_IMAGE'
                            ]
                            }
                        ]
                        }, 
                        'then': {
                        '$concatArrays': [
                            '$$value', [
                            '$$this'
                            ]
                        ]
                        }, 
                        'else': '$$value'
                    }
                    }
                }
                }, 
                'STAR_RATING': {
                '$reduce': {
                    'input': '$questions', 
                    'initialValue': [], 
                    'in': {
                    '$cond': {
                        'if': {
                        '$or': [
                            {
                            '$eq': [
                                '$$this.type', 'STAR_RATING'
                            ]
                            }
                        ]
                        }, 
                        'then': {
                        '$concatArrays': [
                            '$$value', [
                            '$$this'
                            ]
                        ]
                        }, 
                        'else': '$$value'
                    }
                    }
                }
                }
            }
            }, {
            '$addFields': {
                'DRAG_DROP': {
                '$map': {
                    'input': '$DRAG_DROP', 
                    'as': 'd', 
                    'in': {
                    'cvs': {
                        '$map': {
                        'input': '$$d.meta.orderedFields', 
                        'in': {
                            'm': {
                            '$cond': {
                                'if': {
                                '$ne': [
                                    {
                                    '$size': '$$d.meta.orderedFields'
                                    }, 0
                                ]
                                }, 
                                'then': {
                                '$cond': {
                                    'if': {
                                    '$ne': [
                                        {
                                        '$size': '$$d.meta.orderedFields'
                                        }, 0
                                    ]
                                    }, 
                                    'then': {
                                    '$divide': [
                                        '$$d.meta.marks', {
                                        '$size': '$$d.meta.orderedFields'
                                        }
                                    ]
                                    }, 
                                    'else': 0
                                }
                                }, 
                                'else': 0
                            }
                            }, 
                            'k': {
                            '$concat': [
                                '$$d.questionText', '| Position:', '$$this.value'
                            ]
                            }, 
                            'o': '$$d.order', 
                            'c': {
                            '$concat': [
                                '$$this.correct', ': ', '$$this.label'
                            ]
                            }, 
                            'v': '$$this.label', 
                            's': {
                            '$eq': [
                                '$$this.value', '$$this.correct'
                            ]
                            }, 
                            'ex': '$$this.externalQuestion'
                        }
                        }
                    }
                    }
                }
                }, 
                'TEXT_QUESTIONS': {
                '$map': {
                    'input': '$TEXT_QUESTIONS', 
                    'in': {
                    'k': '$$this.label', 
                    'v': '$$this.value', 
                    'o': '$$this.o', 
                    'c': '$$this.c', 
                    's': {
                        '$ne': [
                        '$$this.s', 0
                        ]
                    }, 
                    'm': '$$this.marks', 
                    'ex': '$$this.ex'
                    }
                }
                }, 
                'SELECT_ONE': {
                '$map': {
                    'input': '$SELECT_ONE', 
                    'in': {
                    'k': '$$this.questionText', 
                    'v': '$$this.meta.value', 
                    'o': '$$this.order', 
                    'c': '$$this.meta.correct', 
                    's': {
                        '$ne': [
                        '$$this.score', 0
                        ]
                    }, 
                    'm': '$$this.meta.marks', 
                    'ex': '$$this.externalQuestion'
                    }
                }
                }, 
                'SELECT_MANY': {
                '$map': {
                    'input': '$SELECT_MANY', 
                    'in': {
                    'k': '$$this.questionText', 
                    'v': {
                        '$reduce': {
                        'input': '$$this.meta.value', 
                        'initialValue': {
                            'concatenated': '', 
                            'index': 0
                        }, 
                        'in': {
                            'concatenated': {
                            '$cond': [
                                {
                                '$eq': [
                                    '$$value.index', 0
                                ]
                                }, '$$this', {
                                '$concat': [
                                    '$$value.concatenated', ',', '$$this'
                                ]
                                }
                            ]
                            }, 
                            'index': {
                            '$add': [
                                '$$value.index', 1
                            ]
                            }
                        }
                        }
                    }, 
                    'o': '$$this.order', 
                    's': {
                        '$ne': [
                        '$$this.score', 0
                        ]
                    }, 
                    'm': {
                        '$cond': {
                        'if': {
                            '$ne': [
                            {
                                '$size': '$$this.meta.value'
                            }, 0
                            ]
                        }, 
                        'then': {
                            '$divide': [
                            '$$this.meta.marks', {
                                '$size': '$$this.meta.value'
                            }
                            ]
                        }, 
                        'else': 0
                        }
                    }, 
                    'ex': '$$this.externalQuestion'
                    }
                }
                }, 
                'STAR_RATING': {
                '$map': {
                    'input': '$STAR_RATING', 
                    'as': 'star', 
                    'in': {
                    '$reduce': {
                        'input': '$$star.meta.fields', 
                        'initialValue': [], 
                        'in': {
                        '$concatArrays': [
                            '$$value', [
                            {
                                'k': {
                                '$concat': [
                                    '$$star.questionText', ': ', '$$this.label'
                                ]
                                }, 
                                'v': '$$this.value', 
                                'o': '$$star.order', 
                                's': {
                                '$eq': [
                                    '$$this.value', '$$this.correct'
                                ]
                                }, 
                                'm': {
                                '$cond': {
                                    'if': {
                                    '$ne': [
                                        {
                                        '$size': '$$star.meta.fields'
                                        }, 0
                                    ]
                                    }, 
                                    'then': {
                                    '$divide': [
                                        '$$star.meta.marks', {
                                        '$size': '$$star.meta.fields'
                                        }
                                    ]
                                    }, 
                                    'else': 0
                                }
                                }, 
                                'ex': '$$this.externalQuestion'
                            }
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
                'SELECT_MANY': {
                '$map': {
                    'input': '$SELECT_MANY', 
                    'in': {
                    'k': '$$this.k', 
                    'v': '$$this.v.concatenated', 
                    'o': '$$this.o', 
                    's': '$$this.s', 
                    'ex': '$$this.ex'
                    }
                }
                }, 
                'STAR_RATING': {
                '$reduce': {
                    'input': '$STAR_RATING', 
                    'initialValue': [], 
                    'in': {
                    '$concatArrays': [
                        '$$value', '$$this'
                    ]
                    }
                }
                }, 
                'DRAG_DROP': {
                '$reduce': {
                    'input': '$DRAG_DROP.cvs', 
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
            '$lookup': {
                'from': 'survey-attendances', 
                'localField': 'surveyId', 
                'foreignField': 'surveyId', 
                'let': {
                'userEmail': '$email'
                }, 
                'as': 'attendance', 
                'pipeline': [
                {
                    '$unwind': '$attendance'
                }, {
                    '$replaceRoot': {
                    'newRoot': '$attendance'
                    }
                }, {
                    '$addFields': {
                    'uEmail': {
                        '$cond': {
                        'if': {
                            '$eq': [
                            '$$userEmail', '$email'
                            ]
                        }, 
                        'then': 1, 
                        'else': 0
                        }
                    }
                    }
                }, {
                    '$match': {
                    'uEmail': 1
                    }
                }
                ]
            }
            }, {
            '$project': {
                '_id': 0, 
                'externalName': 1, 
                'email': 1, 
                'attendance': {
                '$first': '$attendance.status'
                }, 
                'question': {
                '$concatArrays': [
                    '$TEXT_QUESTIONS', '$SELECT_ONE', '$SELECT_MANY', '$STAR_RATING', '$DRAG_DROP'
                ]
                }, 
                'score': 1, 
                'totalmarks': 1, 
                'assessmentId': 1, 
                'externalFields': 1
            }
            }, {
            '$unwind': {
                'path': '$question', 
                'preserveNullAndEmptyArrays': true
            }
            }, {
            '$sort': {
                'question.o': 1
            }
            }, {
            '$group': {
                '_id': '$email', 
                'question': {
                '$push': '$question'
                }, 
                'score': {
                '$sum': {
                    '$cond': [
                    '$question.s', '$question.m', 0
                    ]
                }
                }, 
                'total': {
                '$first': '$totalmarks'
                }, 
                'c_score': {
                '$sum': {
                    '$cond': [
                    {
                        '$and': [
                        '$question.s', {
                            '$not': '$question.ex'
                        }
                        ]
                    }, 1, 0
                    ]
                }
                }, 
                'c_total_1': {
                '$sum': 1
                }, 
                'c_total_2': {
                '$sum': {
                    '$cond': [
                    '$question.ex', 1, 0
                    ]
                }
                }, 
                'assessmentId': {
                '$first': '$assessmentId'
                }, 
                'externalName': {
                '$first': '$externalName'
                }, 
                'externalFields': {
                '$first': '$externalFields'
                }
            }
            }, {
            '$project': {
                '_id': 0, 
                'email': '$_id', 
                'externalFields': 1, 
                'question': {
                '$map': {
                    'input': '$question', 
                    'in': [
                    {
                        'k': {
                        '$ifNull': [
                            '$$this.k', 'k'
                        ]
                        }, 
                        'v': {
                        '$ifNull': [
                            '$$this.v', null
                        ]
                        }
                    }, {
                        '$cond': {
                        'if': {
                            '$or': [
                            {
                                '$eq': [
                                '$$this.m', 0
                                ]
                            }, {
                                '$eq': [
                                '$$this.ex', true
                                ]
                            }
                            ]
                        }, 
                        'then': null, 
                        'else': {
                            'k': {
                            '$ifNull': [
                                {
                                '$concat': [
                                    '[Answer]: ', '$$this.k'
                                ]
                                }, 'k'
                            ]
                            }, 
                            'v': {
                            '$ifNull': [
                                {
                                '$cond': [
                                    '$$this.s', 'TRUE', 'FALSE'
                                ]
                                }, 'FALSE'
                            ]
                            }
                        }
                        }
                    }
                    ]
                }
                }, 
                'answers': {
                '$concat': [
                    {
                    '$toString': '$c_score'
                    }, '/', {
                    '$toString': {
                        '$subtract': [
                        '$c_total_1', '$c_total_2'
                        ]
                    }
                    }
                ]
                }, 
                'score': 1, 
                'total': 1, 
                'assessmentId': 1, 
                'externalName': 1
            }
            }, {
            '$addFields': {
                'question': {
                '$reduce': {
                    'input': '$question', 
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
                'question': {
                '$reduce': {
                    'input': '$question', 
                    'initialValue': [], 
                    'in': {
                    '$cond': {
                        'if': {
                        '$ne': [
                            '$$this', null
                        ]
                        }, 
                        'then': {
                        '$concatArrays': [
                            '$$value', [
                            '$$this'
                            ]
                        ]
                        }, 
                        'else': '$$value'
                    }
                    }
                }
                }
            }
            }, {
            '$addFields': {
                'question': {
                '$arrayToObject': '$question'
                }
            }
            }, {
            '$lookup': {
                'from': 'users', 
                'localField': 'email', 
                'foreignField': 'email', 
                'as': 'users', 
                'pipeline': [
                {
                    '$project': {
                    '_id': 0, 
                    'name': {
                        '$concat': [
                        '$name.first', ' ', '$name.middle', ' ', '$name.last'
                        ]
                    }
                    }
                }
                ]
            }
            }, {
            '$addFields': {
                'externalName': {
                '$ifNull': [
                    {
                    '$first': '$users.name'
                    }, '$externalName'
                ]
                }
            }
            }, {
            '$unset': 'users'
            }, {
            '$addFields': {
                'percentage': {
                '$round': [{
                    '$multiply': [
                    {
                        '$cond': {
                        'if': {
                            '$ne': [
                            '$total', 0
                            ]
                        }, 
                        'then': {
                            '$divide': [
                            '$score', '$total'
                            ]
                        }, 
                        'else': 0
                        }
                    }, 100
                    ]
                }, 0]
                }
            }
            }, {
            '$lookup': {
                'from': 'assessments', 
                'localField': 'assessmentId', 
                'foreignField': '_id', 
                'as': 'percentageCriteria', 
                'pipeline': [
                {
                    '$project': {
                    'percentageCriteria': 1
                    }
                }, {
                    '$unwind': '$percentageCriteria'
                }, {
                    '$replaceRoot': {
                    'newRoot': '$percentageCriteria'
                    }
                }
                ]
            }
            }, {
            '$addFields': {
                'percentageCriteria': {
                '$reduce': {
                    'input': '$percentageCriteria', 
                    'initialValue': 'default', 
                    'in': {
                    '$cond': [
                        {
                        '$and': [
                            {
                            '$gte': [
                                '$percentage', '$$this.from'
                            ]
                            }, {
                            '$lte': [
                                '$percentage', '$$this.to'
                            ]
                            }
                        ]
                        }, '$$this.title', '$$value'
                    ]
                    }
                }
                }
            }
            }, {
            '$project': {
                'assessmentId': '$assessmentId', 
                'externalName': '$externalName', 
                'email': '$email', 
                'score': '$score', 
                'total': '$total', 
                'percentage': '$percentage', 
                'percentageCriteria': '$percentageCriteria', 
                'question': '$question'
            }
            }
        ]
        return await this.cacheModal.aggregate(pipe).exec();  
    }

    delete(surveyId: string, email: string): Promise<any> {
        return this.cacheModal.deleteOne({ 'data._id': surveyId, 'data.email': email });
    }
}