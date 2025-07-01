import mongoose, { Model, PipelineStage } from "mongoose";
import { SurveyResult, UpdateSurveyResultDto } from "../dto/survey-result.dto";
import { Survey } from 'src/domain/survey/dto/survey.dto';
import { SurveyAttempt } from 'src/domain/survey/dto/survey-attempt.dto';
import { SurveyResultRepository } from "../interfaces/survey-result-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


/**
 *Survey Repository
 *
 * @export
 * @class SurveyRepositoryImpl
 * @implements {SurveyResultRepository}
 */
@Injectable()
export class SurveyResultRepositoryImpl implements SurveyResultRepository {


    /**
     * Creates an instance of SurveyRepositoryImpl.
     * @param {Model<SurveyResult>} surveyResultModel
     * @memberof SurveyResultRepositoryImpl
     */
    constructor(
        @InjectModel('survey-results') private readonly surveyResultModel: Model<SurveyResult>,
        @InjectModel('survey') private readonly surveyModel: Model<Survey>,
        @InjectModel('survey-attempts') private readonly surveyAttemptModel: Model<SurveyAttempt>,
    ) { }

    /**
     *Get all surveys paginated
     *
     * @param {number} page
     * @param {number} size
     * @return {*}  {Promise<Survey[]>}
     * @memberof SurveyRepositoryImpl
     */
    public async getSurveyResults(id: string, page: number, size: number,courseId:string, ratingFor:string, ratingForID:string, external:string, searchText:string): Promise<any> {
        const skip = (page - 1) * size;

        let match: any;
        if (courseId && ratingFor && ratingForID)
        {
          match = {
            'surveyId'   : new mongoose.Types.ObjectId(id),
            'courseId'   : new mongoose.Types.ObjectId(courseId),
            'ratingFor'  : ratingFor,
            'ratingForID': ratingForID
          };
        }
        else{
          match = {
            'surveyId': new mongoose.Types.ObjectId(id),
          };
        }

        let matchFilter: any = {};

        if (external) {
            matchFilter['external'] = (external == 'true') ? true: false;
        }
        
        if (searchText) {
            matchFilter['$or'] = [
                {
                  'name': {
                    '$regex': searchText, 
                    '$options': 'i'
                  }
                }, {
                  'email': {
                    '$regex': searchText, 
                    '$options': 'i'
                  }
                }, {
                  'phone': {
                    '$regex': searchText, 
                    '$options': 'i'
                  }
                }
            ];
        }

        let addedUsersAggregation = [
            {
              '$match': {
                '_id': new mongoose.Types.ObjectId(id),
              }
            }, {
              '$project': {
                'attendees': 1, 
                'externals': 1
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
                      'name': 1, 
                      'email': 1, 
                      'phone': 1, 
                      'gender': 1
                    }
                  }
                ]
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'externals', 
                'foreignField': 'email', 
                'as': 'externalregistered', 
                'pipeline': [
                  {
                    '$project': {
                      'name': 1, 
                      'email': 1, 
                      'phone': 1, 
                      'gender': 1
                    }
                  }
                ]
              }
            }, {
              '$addFields': {
                'externals': {
                  '$map': {
                    'input': '$externals', 
                    'in': {
                      'email': '$$this',
                      'external': true
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'invites': {
                  '$concatArrays': [
                    '$attendees', '$externals', '$externalregistered'
                  ]
                }
              }
            }, {
              '$unset': [
                'attendees', 'externals', 'externalregistered'
              ]
            }, {
              '$unwind': {
                'path': '$invites'
              }
            }, {
              '$replaceRoot': {
                'newRoot': '$invites'
              }
            }, {
              '$group': {
                '_id': '$email', 
                '_sid': {
                  '$first': '$_id'
                }, 
                'name': {
                  '$first': '$name'
                }, 
                'phone': {
                  '$first': '$phone'
                }, 
                'gender': {
                  '$first': '$gender'
                },
                'external': {
                  '$first': '$external'
                }
              }
            }, {
              '$project': {
                '_id': '$_sid', 
                'email': '$_id', 
                'name': 1, 
                'phone': 1, 
                'gender': 1,
                'external': {
                '$cond': [
                    {
                        '$eq': [
                            '$external', null
                        ]
                    }, false, '$external'
                ]
            }
                }
            },
            {
              '$match': matchFilter
            },
            {
                '$facet': {
                  'countResult': [
                    { '$count': 'total' }
                  ],
                  'paginatedResult': [
                    { '$skip': Number(skip) },
                    { '$limit': Number(size) }
                  ]
                }
            }
        ];

        const [result] = await this.surveyModel.aggregate(addedUsersAggregation).exec();
        const inviteesCount = result.countResult.length > 0 ? result.countResult[0].total : 0;
        const inviteesResult = result.paginatedResult;

        let userResultsAggregation = [
          {
            '$match': match
          }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'email', 
                'foreignField': 'email', 
                'as': 'user', 
                'pipeline': [
                  {
                    '$unset': [
                      'password', 'browsers', 'accessToken', 'resetPassword'
                    ]
                  }
                ]
              }
            }, {
              '$unwind': {
                'path': '$user', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$lookup': {
                'from': 'surveys', 
                'localField': 'surveyId', 
                'foreignField': '_id', 
                'as': 'surveys'
              }
            }, {
              '$unwind': {
                'path': '$surveys', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$project': {
                '_id': {
                  '$cond': {
                    'if': {
                      '$ifNull': [
                        '$user._id', false
                      ]
                    }, 
                    'then': '$user._id', 
                    'else': ''
                  }
                }, 
                'name': {
                  '$cond': {
                    'if': {
                      '$ifNull': [
                        '$user.name', false
                      ]
                    }, 
                    'then': '$user.name', 
                    'else': '$externalName'
                  }
                }, 
                'email': '$email', 
                'phone': {
                  '$cond': {
                    'if': {
                      '$ifNull': [
                        '$user.phone', false
                      ]
                    }, 
                    'then': '$user.phone', 
                    'else': ''
                  }
                }, 
                'gender': {
                  '$cond': {
                    'if': {
                      '$ifNull': [
                        '$user.gender', false
                      ]
                    }, 
                    'then': '$user.gender', 
                    'else': ''
                  }
                }, 
                'questions': '$questions',
                'resultId': '$_id', 
                'externalFields': '$externalFields',
                'attemptEndDate': '$attemptEndDate'
              }
            }, {
                '$addFields': {
                    'external': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$_id', ''
                                ]
                            }, true, false
                        ]
                    }
                }
            }, {
                '$match': matchFilter
            }, {
                '$facet': {
                  'countResult': [
                    { '$count': 'total' }
                  ],
                  'paginatedResult': [
                    { '$skip': Number(skip) },
                    { '$limit': Number(size) }
                  ]
                }
              }
          ];

        let [results] = await this.surveyResultModel.aggregate(userResultsAggregation).exec();
        const userResultsCount = results.countResult.length > 0 ? results.countResult[0].total : 0;
        const userResults = results.paginatedResult;

        return {inviteesResult,inviteesCount, userResultsCount,userResults }
    }

   

    /**
     *Get all surveys paginated
     *
     * @return {*}  {Promise<SurveyResults[]>}
     * @memberof SurveyRepositoryImpl
     */
    public async generateResults(): Promise<any> {
        let resultsAggregation : PipelineStage[] = [
          {
            '$lookup': {
              'from': 'survey-results', 
              'localField': '_id', 
              'foreignField': '_id', 
              'as': 'isalreadycreated'
            }
          }, {
            '$match': {
              'isalreadycreated': {
                '$size': 0
              }
            }
          }, {
            '$merge': {
              'into': 'survey-results', 
              'on': '_id', 
              'whenMatched': 'replace', 
              'whenNotMatched': 'insert'
            }
          }
        ];
        return await this.surveyAttemptModel.aggregate(resultsAggregation).exec();
    }

    /**
     *Get all surveys paginated
     *
     * @return {*}  {Promise<SurveyResults[]>}
     * @memberof SurveyRepositoryImpl
     */
     public async getGraphData(id: string, courseId:string, ratingFor:string, ratingForID:string): Promise<any> {
        let match: any;
        if (courseId && ratingFor && ratingForID)
        {
          match = {
            'surveyId'   : new mongoose.Types.ObjectId(id),
            'courseId'   : new mongoose.Types.ObjectId(courseId),
            'ratingFor'  : ratingFor,
            'ratingForID': ratingForID
          };
        }
        else{
          match = {
            'surveyId': new mongoose.Types.ObjectId(id),
          };
        }

        let graphAggregation : PipelineStage[] = [
          {
            '$match': match
          }, {
            '$unwind': {
              'path': '$questions'
            }
          }, {
            '$group': {
              '_id': '$questions.questionCode', 
              'questionType': {
                '$first': '$questions.type'
              }, 
              'questionText': {
                '$first': '$questions.questionText'
              }, 
              'order': {
                '$first': '$questions.order'
              }, 
              'meta': {
                '$push': '$questions.meta'
              }
            }
          }, {
            '$sort': {
              'order': 1
            }
          }, {
            '$addFields': {
              'type': {
                '$cond': [
                  {
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'SINGLE_ROW_TEXT'
                        ]
                      }, {
                        '$eq': [
                          '$questionType', 'EMAIL_ADDRESS'
                        ]
                      }, {
                        '$eq': [
                          '$questionType', 'COMMENT_BOX'
                        ]
                      }, {
                        '$eq': [
                          '$questionType', 'CONTACT_INFO'
                        ]
                      }
                    ]
                  }, 'text', '$type'
                ]
              }, 
              'data': {
                '$cond': [
                  {
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'SINGLE_ROW_TEXT'
                        ]
                      }, {
                        '$eq': [
                          '$questionType', 'EMAIL_ADDRESS'
                        ]
                      }, {
                        '$eq': [
                          '$questionType', 'COMMENT_BOX'
                        ]
                      }, {
                        '$eq': [
                          '$questionType', 'CONTACT_INFO'
                        ]
                      }
                    ]
                  }, {
                    'labels': {
                      '$first': '$meta.fields.label'
                    }, 
                    'datasets': [
                      {
                        'data': '$meta.fields.value'
                      }
                    ]
                  }, '$data'
                ]
              }
            }
          }, {
            '$addFields': {
              'type': {
                '$cond': [
                  {
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'SELECT_ONE'
                        ]
                      }, {
                        '$eq': [
                          '$questionType', 'DROPDOWN_MENU'
                        ]
                      }
                    ]
                  }, 'bar', '$type'
                ]
              }, 
              'data': {
                '$cond': [
                  {
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'SELECT_ONE'
                        ]
                      }, {
                        '$eq': [
                          '$questionType', 'DROPDOWN_MENU'
                        ]
                      }
                    ]
                  }, {
                    '$map': {
                      'input': {
                        '$first': '$meta.fields.label'
                      }, 
                      'as': 'option', 
                      'in': {
                        'label': '$$option', 
                        'count': {
                          '$size': {
                            '$filter': {
                              'input': '$meta.value', 
                              'as': 'val', 
                              'cond': {
                                '$eq': [
                                  '$$val', '$$option'
                                ]
                              }
                            }
                          }
                        }, 
                        'correct': {
                          '$cond': [
                            {
                              '$eq': [
                                '$$option', {
                                  '$first': '$meta.correct'
                                }
                              ]
                            }, true, false
                          ]
                        }
                      }
                    }
                  }, '$data'
                ]
              }
            }
          }, {
            '$addFields': {
              'type': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'SELECT_ONE_IMAGE'
                    ]
                  }, 'bar', '$type'
                ]
              }, 
              'data': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'SELECT_ONE_IMAGE'
                    ]
                  }, {
                    '$map': {
                      'input': {
                        '$first': '$meta.fields'
                      }, 
                      'as': 'option', 
                      'in': {
                        'label': '$$option.label', 
                        'url': '$$option.url', 
                        'count': {
                          '$size': {
                            '$filter': {
                              'input': '$meta.value', 
                              'as': 'val', 
                              'cond': {
                                '$eq': [
                                  '$$val', '$$option.label'
                                ]
                              }
                            }
                          }
                        }, 
                        'correct': {
                          '$cond': [
                            {
                              '$eq': [
                                '$$option.label', {
                                  '$first': '$meta.correct'
                                }
                              ]
                            }, true, false
                          ]
                        }
                      }
                    }
                  }, '$data'
                ]
              }
            }
          }, {
            '$addFields': {
              'type': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'SELECT_MANY'
                    ]
                  }, 'bar', '$type'
                ]
              }, 
              'data': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'SELECT_MANY'
                    ]
                  }, {
                    '$map': {
                      'input': {
                        '$first': '$meta.fields.label'
                      }, 
                      'as': 'option', 
                      'in': {
                        'label': '$$option', 
                        'values': {
                          '$reduce': {
                            'input': {
                              '$cond': {
                                'if': {
                                  '$isArray': '$meta.value'
                                }, 
                                'then': '$meta.value', 
                                'else': [
                                  '$meta.value'
                                ]
                              }
                            }, 
                            'initialValue': [], 
                            'in': {
                              '$concatArrays': [
                                '$$value', {
                                  '$cond': {
                                    'if': {
                                      '$isArray': '$$this'
                                    }, 
                                    'then': '$$this', 
                                    'else': [
                                      '$$this'
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        }, 
                        'correct': {
                          '$cond': [
                            {
                              '$in': [
                                '$$option', {
                                  '$first': '$meta.correct'
                                }
                              ]
                            }, true, false
                          ]
                        }, 
                        'count': {
                          '$size': {
                            '$filter': {
                              'input': {
                                '$reduce': {
                                  'input': {
                                    '$cond': {
                                      'if': {
                                        '$isArray': '$meta.value'
                                      }, 
                                      'then': '$meta.value', 
                                      'else': [
                                        '$meta.value'
                                      ]
                                    }
                                  }, 
                                  'initialValue': [], 
                                  'in': {
                                    '$concatArrays': [
                                      '$$value', {
                                        '$cond': {
                                          'if': {
                                            '$isArray': '$$this'
                                          }, 
                                          'then': '$$this', 
                                          'else': [
                                            '$$this'
                                          ]
                                        }
                                      }
                                    ]
                                  }
                                }
                              }, 
                              'as': 'val', 
                              'cond': {
                                '$eq': [
                                  '$$val', '$$option'
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  }, '$data'
                ]
              }
            }
          }, {
            '$addFields': {
              'type': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'SELECT_MANY_IMAGE'
                    ]
                  }, 'bar', '$type'
                ]
              }, 
              'data': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'SELECT_MANY_IMAGE'
                    ]
                  }, {
                    '$map': {
                      'input': {
                        '$first': '$meta.fields'
                      }, 
                      'as': 'option', 
                      'in': {
                        'label': '$$option.label', 
                        'url': '$$option.url', 
                        'values': {
                          '$reduce': {
                            'input': {
                              '$cond': {
                                'if': {
                                  '$isArray': '$meta.value'
                                }, 
                                'then': '$meta.value', 
                                'else': [
                                  '$meta.value'
                                ]
                              }
                            }, 
                            'initialValue': [], 
                            'in': {
                              '$concatArrays': [
                                '$$value', {
                                  '$cond': {
                                    'if': {
                                      '$isArray': '$$this'
                                    }, 
                                    'then': '$$this', 
                                    'else': [
                                      '$$this'
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        }, 
                        'count': {
                          '$size': {
                            '$filter': {
                              'input': {
                                '$reduce': {
                                  'input': {
                                    '$cond': {
                                      'if': {
                                        '$isArray': '$meta.value'
                                      }, 
                                      'then': '$meta.value', 
                                      'else': [
                                        '$meta.value'
                                      ]
                                    }
                                  }, 
                                  'initialValue': [], 
                                  'in': {
                                    '$concatArrays': [
                                      '$$value', {
                                        '$cond': {
                                          'if': {
                                            '$isArray': '$$this'
                                          }, 
                                          'then': '$$this', 
                                          'else': [
                                            '$$this'
                                          ]
                                        }
                                      }
                                    ]
                                  }
                                }
                              }, 
                              'as': 'val', 
                              'cond': {
                                '$eq': [
                                  '$$val', '$$option.label'
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  }, '$data'
                ]
              }
            }
          }, {
            '$addFields': {
              'type': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'STAR_RATING'
                    ]
                  }, 'rate', '$type'
                ]
              }, 
              'data': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'STAR_RATING'
                    ]
                  }, {
                    'label': {
                      '$first': '$meta.fields.label'
                    }, 
                    'count': {
                      '$map': {
                        'input': {
                          '$range': [
                            0, {
                              '$size': {
                                '$first': '$meta.fields.label'
                              }
                            }
                          ]
                        }, 
                        'in': {
                          '$avg': {
                            '$map': {
                              'input': '$meta', 
                              'as': 'm', 
                              'in': {
                                '$arrayElemAt': [
                                  '$$m.fields.value', '$$this'
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  }, '$data'
                ]
              }
            }
          }, {
            '$addFields': {
              'type': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'SMILE_RATING'
                    ]
                  }, 'smile', '$type'
                ]
              }, 
              'data': {
                '$cond': [
                  {
                    '$eq': [
                      '$questionType', 'SMILE_RATING'
                    ]
                  }, {
                    '$map': {
                      'input': {
                        '$first': '$meta.fields'
                      }, 
                      'as': 'option', 
                      'in': {
                        'label': '$$option.label', 
                        'url': '$$option.url', 
                        'count': {
                          '$size': {
                            '$filter': {
                              'input': '$meta.value', 
                              'as': 'val', 
                              'cond': {
                                '$eq': [
                                  '$$val', '$$option.label'
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  }, '$data'
                ]
              }
            }
          }, {
            '$addFields': {
              'data': {
                '$cond': [
                  {
                    '$or': [
                      {
                        '$eq': [
                          '$type', 'bar'
                        ]
                      }, {
                        '$eq': [
                          '$type', 'rate'
                        ]
                      }, {
                        '$eq': [
                          '$type', 'smile'
                        ]
                      }
                    ]
                  }, {
                    'label': '$data.label', 
                    'label_images': '$data.url', 
                    'datasets': {
                      'data': '$data.count', 
                      'label': '$questionText', 
                      'backgroundColor': {
                        '$map': {
                          'input': {
                            '$cond': {
                              'if': {
                                '$isArray': '$data'
                              }, 
                              'then': '$data', 
                              'else': [
                                '$data'
                              ]
                            }
                          }, 
                          'in': {
                            '$cond': [
                              '$$this.correct', true, false
                            ]
                          }
                        }
                      }
                    }
                  }, '$data'
                ]
              }
            }
          }
        ];
        return await this.surveyResultModel.aggregate(graphAggregation);
    }

    public async getBulkResults(ids: string[]): Promise<any> {
      

        // Convert string IDs to ObjectIDs
        let surveyIds = ids.map((id: string) => new mongoose.Types.ObjectId(id));
  
        // console.log("THIS IS THE BULK DATA FOR RESULT", surveyIds)
  
        let bulkPipe : PipelineStage[] = [
          {
            '$match': {
              '_id': {
                '$in': surveyIds
              }
            }
          }, {
              '$lookup': {
                'from': 'question-banks', 
                'localField': 'questionBankId', 
                'foreignField': '_id', 
                'as': 'questionBankDetails', 
                'pipeline': [
                  {
                    '$lookup': {
                      'from': 'survey-tags', 
                      'localField': 'tag', 
                      'foreignField': '_id', 
                      'as': 'tagDetails'
                    }
                  }, {
                    '$unwind': {
                      'path': '$tagDetails'
                    }
                  }
                ]
              }
            }, {
              '$unwind': {
                'path': '$questionBankDetails'
              }
            }, {
              '$lookup': {
                'from': 'survey-results', 
                'localField': '_id', 
                'foreignField': 'surveyId', 
                'let': {
                  'criteria': '$percentageCriteria'
                }, 
                'as': 'results', 
                'pipeline': [
                  {
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
                              'then': '$$this.title', 
                              'else': '$$value'
                            }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }, {
              '$addFields': {
                'resultemails': '$results.email'
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'resultemails', 
                'foreignField': 'email', 
                'as': 'links.internal', 
                'pipeline': [
                  {
                    '$project': {
                      '_id': 1, 
                      'email': 1
                    }
                  }
                ]
              }
            }, {
              '$addFields': {
                'links.external': {
                  '$reduce': {
                    'input': '$resultemails', 
                    'initialValue': [], 
                    'in': {
                      '$cond': [
                        {
                          '$and': [
                            {
                              '$ne': [
                                '$$this', null
                              ]
                            }, {
                              '$not': {
                                '$in': [
                                  '$$this', '$links.internal.email'
                                ]
                              }
                            }
                          ]
                        }, {
                          '$concatArrays': [
                            '$$value', [
                              '$$this'
                            ]
                          ]
                        }, '$$value'
                      ]
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'attendees': {
                  '$concatArrays': [
                    '$attendees', '$links.internal._id'
                  ]
                }, 
                'externals': {
                  '$concatArrays': [
                    '$externals', '$links.external'
                  ]
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
                }, 
                'externals': {
                  '$reduce': {
                    'input': '$externals', 
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
              '$facet': {
                'notoa': [
                  {
                    '$group': {
                      '_id': '$questionBankDetails.name'
                    }
                  }
                ], 
                'noa': [
                  {
                    '$group': {
                      '_id': '$name'
                    }
                  }
                ], 
                'tnoq': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'sum': {
                        '$sum': {
                          '$size': '$questions'
                        }
                      }
                    }
                  }
                ], 
                'mnoqiaa': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'sum': {
                        '$sum': {
                          '$size': '$questions'
                        }
                      }
                    }
                  }, {
                    '$sort': {
                      'sum': 1
                    }
                  }, {
                    '$limit': 1
                  }
                ], 
                'ta': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'sum': {
                        '$sum': {
                          '$add': [
                            {
                              '$size': '$attendees'
                            }, {
                              '$size': '$externals'
                            }
                          ]
                        }
                      }
                    }
                  }
                ], 
                'ia': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'sum': {
                        '$sum': {
                          '$size': '$attendees'
                        }
                      }
                    }
                  }
                ], 
                'iawa': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'sum': {
                        '$sum': {
                          '$size': '$links.internal'
                        }
                      }
                    }
                  }
                ], 
                'ea': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'sum': {
                        '$sum': {
                          '$size': '$externals'
                        }
                      }
                    }
                  }
                ], 
                'eawa': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'sum': {
                        '$sum': {
                          '$size': '$links.external'
                        }
                      }
                    }
                  }
                ], 
                'tnwa': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'sum': {
                        '$sum': {
                          '$size': '$results'
                        }
                      }
                    }
                  }
                ], 
                'tnwm': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'sum': {
                        '$sum': {
                          '$subtract': [
                            {
                              '$add': [
                                {
                                  '$size': '$attendees'
                                }, {
                                  '$size': '$externals'
                                }
                              ]
                            }, {
                              '$size': '$results'
                            }
                          ]
                        }
                      }
                    }
                  }
                ], 
                'Total Grades': [
                  {
                    '$unwind': {
                      'path': '$results'
                    }
                  }, {
                    '$group': {
                      '_id': '$results.criteria', 
                      'sum': {
                        '$count': {}
                      }, 
                      'push': {
                        '$push': '$name'
                      }
                    }
                  }, {
                    '$addFields': {
                      'push': {
                        '$map': {
                          'input': '$push', 
                          'as': 'name', 
                          'in': {
                            'name': '$$name', 
                            'count': {
                              '$size': {
                                '$filter': {
                                  'input': '$push', 
                                  'cond': {
                                    '$eq': [
                                      '$$this', '$$name'
                                    ]
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }, {
                    '$unwind': {
                      'path': '$push'
                    }
                  }, {
                    '$group': {
                      '_id': '$_id', 
                      'sum': {
                        '$first': '$sum'
                      }, 
                      'push': {
                        '$addToSet': '$push'
                      }
                    }
                  }
                ], 
                'Criteria': [
                  {
                    '$group': {
                      '_id': '$name', 
                      'data': {
                        '$first': '$percentageCriteria'
                      }
                    }
                  }
                ], 
                'cq': [
                  {
                    '$unwind': {
                      'path': '$results'
                    }
                  }, {
                    '$unwind': {
                      'path': '$results.questions'
                    }
                  }, {
                    '$group': {
                      '_id': '$name', 
                      'correct': {
                        '$push': '$results.questions'
                      }
                    }
                  }, {
                    '$addFields': {
                      'total': {
                        '$size': '$correct'
                      }, 
                      'correct': {
                        '$reduce': {
                          'input': '$correct', 
                          'initialValue': 0, 
                          'in': {
                            '$cond': [
                              {
                                '$eq': [
                                  '$$this.score', 0
                                ]
                              }, {
                                '$add': [
                                  '$$value', 0
                                ]
                              }, {
                                '$add': [
                                  '$$value', 1
                                ]
                              }
                            ]
                          }
                        }
                      }
                    }
                  }
                ], 
                'wpq': [
                  {
                    '$unwind': {
                      'path': '$results'
                    }
                  }, {
                    '$unwind': {
                      'path': '$results.questions'
                    }
                  }, {
                    '$addFields': {
                      'results.questions.surveyName': '$name', 
                      'results.questions.surveyId': '$_id'
                    }
                  }, {
                    '$replaceRoot': {
                      'newRoot': '$results.questions'
                    }
                  }, {
                    '$group': {
                      '_id': '$_id', 
                      'count': {
                        '$count': {}
                      }, 
                      'correct': {
                        '$sum': {
                          '$cond': [
                            {
                              '$eq': [
                                '$score', 0
                              ]
                            }, 0, 1
                          ]
                        }
                      }, 
                      'score': {
                        '$sum': '$score'
                      }, 
                      'data': {
                        '$first': '$$ROOT'
                      }
                    }
                  }, {
                    '$sort': {
                      'score': 1
                    }
                  }, {
                    '$limit': 5
                  }
                ]
              }
            }, {
              '$project': {
                '⁠Number of types of Assessments': {
                  'value': {
                    '$size': '$notoa'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$notoa', 
                      'in': [
                        '$$this._id'
                      ]
                    }
                  }
                }, 
                'Number of Assessments': {
                  'value': {
                    '$size': '$noa'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$noa', 
                      'in': [
                        '$$this._id'
                      ]
                    }
                  }
                }, 
                'The Number of Questions': {
                  'value': {
                    '$sum': '$tnoq.sum'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$tnoq', 
                      'in': [
                        '$$this._id', '$$this.sum'
                      ]
                    }
                  }
                }, 
                'Minimum number of questions in an survey': {
                  'value': {
                    '$sum': '$mnoqiaa.sum'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$mnoqiaa', 
                      'in': [
                        '$$this._id'
                      ]
                    }
                  }
                }, 
                'Total Attendees': {
                  'value': {
                    '$sum': '$ta.sum'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$ta', 
                      'in': [
                        '$$this._id', '$$this.sum'
                      ]
                    }
                  }
                }, 
                'Total number of who attempted': {
                  'value': {
                    '$sum': '$tnwa.sum'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$tnwa', 
                      'in': [
                        '$$this._id', '$$this.sum'
                      ]
                    }
                  }
                }, 
                'Internal Attendees': {
                  'value': {
                    '$sum': '$ia.sum'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$ia', 
                      'in': [
                        '$$this._id', '$$this.sum'
                      ]
                    }
                  }
                }, 
                'Internal Attendees who attempted': {
                  'value': {
                    '$sum': '$iawa.sum'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$iawa', 
                      'in': [
                        '$$this._id', '$$this.sum'
                      ]
                    }
                  }
                }, 
                'External Attendees': {
                  'value': {
                    '$sum': '$ea.sum'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$ea', 
                      'in': [
                        '$$this._id', '$$this.sum'
                      ]
                    }
                  }
                }, 
                'External Attendees  who attempted': {
                  'value': {
                    '$sum': '$eawa.sum'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$eawa', 
                      'in': [
                        '$$this._id', '$$this.sum'
                      ]
                    }
                  }
                }, 
                'Total number of who missed': {
                  'value': {
                    '$sum': '$tnwm.sum'
                  }, 
                  'data': {
                    '$map': {
                      'input': '$tnwm', 
                      'in': [
                        '$$this._id', '$$this.sum'
                      ]
                    }
                  }
                }, 
                'Total Grades': 1, 
                'Criteria': 1, 
                'CorrectQuestions': {
                  'value': {
                    '$sum': '$cq.correct'
                  }, 
                  'data': '$cq', 
                  'total': {
                    '$sum': '$cq.total'
                  }
                }, 
                'Worst Performing Questions': '$wpq'
              }
            }
          ]
  
        return await this.surveyModel.aggregate(bulkPipe).exec();
  
      }

    /**
     *Get all surveys paginated
     *
     * @return {*}  {Promise<SurveyResults[]>}
     * @memberof SurveyRepositoryImpl
     */
     public async update(surveyResult: UpdateSurveyResultDto): Promise<any> {

        let _id = surveyResult._id;
        delete surveyResult._id;

        // console.log(_id);

        await this.surveyResultModel.updateOne({ _id }, { $set: { questions: surveyResult.questions, isScoreMarked: true } });

        let updateResult : PipelineStage[] = 
        [
            {
              '$match': {
                '_id': new mongoose.Types.ObjectId(_id)
              }
            }, {
              '$addFields': {
                'score': {
                  '$reduce': {
                    'input': {
                      '$map': {
                        'input': '$questions', 
                        'in': {
                          '$multiply': [
                            '$$this.score', 1
                          ]
                        }
                      }
                    }, 
                    'initialValue': 0, 
                    'in': {
                      '$add': [
                        '$$this', '$$value'
                      ]
                    }
                  }
                }, 
                'totalmarks': {
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
              }
            }, {
              '$merge': {
                'into': 'survey-results', 
                'on': '_id', 
                'whenMatched': 'replace', 
                'whenNotMatched': 'insert'
                }
            }
        ];
        return await this.surveyResultModel.aggregate(updateResult);
    }

    /**
     *Get all surveys paginated
     *
     * @return {*}  {Promise<SurveyResults[]>}
     * @memberof SurveyRepositoryImpl
     */
    public async findIdByEmail(surveyId:string, email:string): Promise<any> {
        return await this.surveyResultModel.findOne({ email: email, surveyId: surveyId }).exec();
    }

    async deleteByEmail(surveyId: string, email:string,ratingForID: string): Promise<any> {
      if (ratingForID != '')
      {
        return this.surveyResultModel.deleteOne({ surveyId: surveyId, email:email , ratingForID: ratingForID });
      }
      else{
        return this.surveyResultModel.deleteOne({ surveyId: surveyId, email:email });
      }
    }

    public async findTotalUsers(surveyId:string): Promise<any> {
      return await this.surveyResultModel.countDocuments({ surveyId:surveyId }).exec();
    }

    /**
     *Get all surveys paginated
     *
     * @return {*}  {Promise<SurveyResults[]>}
     * @memberof SurveyRepositoryImpl
     */
    public async generateExcel(idsArray: string[], courseId:string, ratingFor:string, ratingForID:string): Promise<any> {

      let surveyIds = idsArray.map((id: string) => new mongoose.Types.ObjectId(id));

      let match: any;
        if (courseId && ratingFor && ratingForID)
        {
          match = {
            'surveyId': {
              '$in': surveyIds
            },
            'courseId'   : new mongoose.Types.ObjectId(courseId),
            'ratingFor'  : ratingFor,
            'ratingForID': ratingForID
          };
        }
        else{
          match = {
            'surveyId': {
              '$in': surveyIds
            }
          };
        }

      let resultsAggregation : PipelineStage[] =
      [
        {
          '$match': match
        }, {
            '$addFields': {
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
                                'o': '$$this.order'
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
              }, 
              'DATE_TIME': {
                '$reduce': {
                  'input': '$questions', 
                  'initialValue': [], 
                  'in': {
                    '$cond': {
                      'if': {
                        '$or': [
                          {
                            '$eq': [
                              '$$this.type', 'DATE_TIME'
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
              'TEXT_QUESTIONS': {
                '$map': {
                  'input': '$TEXT_QUESTIONS', 
                  'in': {
                    'k': '$$this.label', 
                    'v': '$$this.value', 
                    'o': '$$this.o'
                  }
                }
              }, 
              'SELECT_ONE': {
                '$map': {
                  'input': '$SELECT_ONE', 
                  'in': {
                    'k': '$$this.questionText', 
                    'v': '$$this.meta.value', 
                    'o': '$$this.order'
                  }
                }
              }, 
              'DATE_TIME': {
                '$map': {
                  'input': '$DATE_TIME', 
                  'in': {
                    'k': '$$this.questionText', 
                    'v': {
                      '$concat': [
                        '$$this.meta.value.day', '-', '$$this.meta.value.month', '-', '$$this.meta.value.year'
                      ]
                    }, 
                    'o': '$$this.order'
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
                    'o': '$$this.order'
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
                              'o': '$$star.order'
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
                    'o': '$$this.o'
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
                  '$TEXT_QUESTIONS', '$SELECT_ONE', '$SELECT_MANY', '$STAR_RATING', '$DATE_TIME'
                ]
              }, 
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
              'externalFields': {
                '$first': '$externalFields'
              }
            }
          }, {
            '$project': {
              '_id': 0, 
              'email': '$_id', 
              'question': {
                '$map': {
                  'input': '$question', 
                  'in': {
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
                  }
                }
              }, 
              'externalFields': 1
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
          }
        ];
      return await this.surveyResultModel.aggregate(resultsAggregation).exec();
    }

    public async generatePdf(idsArray: string[]): Promise<any> {

      let surveyIds = idsArray.map((id: string) => new mongoose.Types.ObjectId(id));

      let userResultsAggregation = [
        {
          '$match': {
            'surveyId': {
              '$in': surveyIds
            }
          }
        }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'email', 
              'foreignField': 'email', 
              'as': 'user', 
              'pipeline': [
                {
                  '$unset': [
                    'password', 'browsers', 'accessToken', 'resetPassword'
                  ]
                }
              ]
            }
          }, {
            '$unwind': {
              'path': '$user', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$lookup': {
              'from': 'surveys', 
              'localField': 'surveyId', 
              'foreignField': '_id', 
              'as': 'surveys'
            }
          }, {
            '$unwind': {
              'path': '$surveys', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$project': {
              '_id': {
                '$cond': {
                  'if': {
                    '$ifNull': [
                      '$user._id', false
                    ]
                  }, 
                  'then': '$user._id', 
                  'else': ''
                }
              }, 
              'name': {
                '$cond': {
                  'if': {
                    '$ifNull': [
                      '$user.name', false
                    ]
                  }, 
                  'then': '$user.name', 
                  'else': '$externalName'
                }
              }, 
              'email': '$email', 
              'phone': {
                '$cond': {
                  'if': {
                    '$ifNull': [
                      '$user.phone', false
                    ]
                  }, 
                  'then': '$user.phone', 
                  'else': ''
                }
              }, 
              'gender': {
                '$cond': {
                  'if': {
                    '$ifNull': [
                      '$user.gender', false
                    ]
                  }, 
                  'then': '$user.gender', 
                  'else': ''
                }
              }, 
              'questions': '$questions',
              'resultId': '$_id', 
              'externalFields': '$externalFields'
            }
          }, {
              '$addFields': {
                  'external': {
                      '$cond': [
                          {
                              '$eq': [
                                  '$_id', ''
                              ]
                          }, true, false
                      ]
                  }
              }
          }
        ];

      return await this.surveyResultModel.aggregate(userResultsAggregation).exec();
  }
}