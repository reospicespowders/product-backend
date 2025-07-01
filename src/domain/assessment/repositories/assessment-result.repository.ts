import mongoose, { Model, UpdateWriteOpResult, PipelineStage } from "mongoose";
import { AssessmentResult, UpdateAssessmentResultDto } from "../dto/assessment-result.dto";
import { Assessment } from 'src/domain/assessment/dto/assessment.dto';
import { AssessmentAttempt } from 'src/domain/assessment/dto/assessment-attempt.dto';
import { AssessmentResultRepository } from "../interfaces/assessment-result-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *Assessment Repository
 *
 * @export
 * @class AssessmentRepositoryImpl
 * @implements {AssessmentResultRepository}
 */
@Injectable()
export class AssessmentResultRepositoryImpl implements AssessmentResultRepository {


    /**
     * Creates an instance of AssessmentRepositoryImpl.
     * @param {Model<AssessmentResult>} assessmentResultModel
     * @memberof AssessmentResultRepositoryImpl
     */
    constructor(
        @InjectModel('assessment-results') private readonly assessmentResultModel: Model<AssessmentResult>,
        @InjectModel('assessment') private readonly assessmentModel: Model<Assessment>,
        @InjectModel('assessment-attempts') private readonly assessmentAttemptModel: Model<AssessmentAttempt>,
    ) { }

    /**
     *Get all assessments paginated
     *
     * @param {number} page
     * @param {number} size
     * @return {*}  {Promise<Assessment[]>}
     * @memberof AssessmentRepositoryImpl
     */
     public async getAssessmentResults(id: string, page: number, size: number, external:string, searchText:string): Promise<any> {
        const skip = (page - 1) * size;

        let matchFilter: any = {};

        if (external) {
            matchFilter['external'] = (external == 'true') ? true: false;
        }

       var SearchTextName = searchText

       if (searchText && typeof searchText === "string") {

         const ogText = searchText.replaceAll(/['"]/g, '');
         const a_b_relation = [
           { a: "ا", b: "أ" },
           { a: "ا", b: "إ" },
           { a: "ا", b: "ى" },
           { a: "أ", b: "ى" },
           { a: "أ", b: "إ" },
           { a: "إ", b: "ى" },
           { a: "ه", b: "ة" },
           { a: "و", b: "ؤ" },
           { a: "ت", b: "ة" },
           { a: "ض", b: "ظ" },
           { a: "ئ", b: "ء" },
         ];

         const SearchTerm = new Set();

         function handleA_B_Relation(item) {
           a_b_relation.forEach((rel) => {
             SearchTerm.add(item.replace(rel.a, rel.b));
             SearchTerm.add(item.replaceAll(rel.a, rel.b));
             SearchTerm.add(item.replaceAll(rel.b, rel.a));
             SearchTerm.add(item.replace(rel.b, rel.a));
           });
         }

         ogText.split(" ").forEach((item) => {
           SearchTerm.add(item);
           handleA_B_Relation(item);
         });

         // Duplicate the terms without Arabic prefixes
         const tempTerms = [...SearchTerm];
         tempTerms.forEach((item) => {
           handleA_B_Relation(item);
         });

         SearchTerm.add(ogText);

         SearchTextName = [...SearchTerm].join("|");

       }

       // console.log("Search Query: ", SearchTextName)


        
        if (searchText) {
            matchFilter['$or'] = [
                {
                  'name': {
                    '$regex': SearchTextName,
                    '$options': 'i'
                  }
                },
                {
                  'name.first': {
                    '$regex': SearchTextName, 
                    '$options': 'i'
                  }
                },
                {
                  'name.middle': {
                    '$regex': SearchTextName, 
                    '$options': 'i'
                  }
                },
                {
                  'name.last': {
                    '$regex': SearchTextName, 
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
                '_id': new mongoose.Types.ObjectId(id)
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
            },{
              '$match': matchFilter
            },{
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

        const [result] = await this.assessmentModel.aggregate(addedUsersAggregation).exec();
        const inviteesCount = result.countResult.length > 0 ? result.countResult[0].total : 0;
        const inviteesResult = result.paginatedResult;

        let userResultsAggregation = [
          {
            '$match': {
            'assessmentId': new mongoose.Types.ObjectId(id)
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
                'from': 'assessments', 
                'localField': 'assessmentId', 
                'foreignField': '_id', 
                'as': 'assessments'
              }
            }, {
              '$unwind': {
                'path': '$assessments', 
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
                    'else': '$externalGender'
                  }
                }, 
                'score': '$score', 
                'totalMarks': '$totalmarks', 
                'criteria': '$assessments.percentageCriteria', 
                'questions': '$questions', 
                'resultId': '$_id', 
                'isScoreMarked': '$isScoreMarked', 
                'externalFields': 1,
                'attemptStartDate': '$attemptStartDate', // Include start date
                'attemptEndDate': '$attemptEndDate', // Include end date
                'timeTaken': {
                  $concat: [
                    {
                      $cond: [
                        { $lt: [{ $floor: { $divide: ["$timeTaken", 3600] } }, 10] },
                        { $concat: ["0", { $toString: { $floor: { $divide: ["$timeTaken", 3600] } } }] },
                        { $toString: { $floor: { $divide: ["$timeTaken", 3600] } } }
                      ]
                    },
                    ":",
                    {
                      $cond: [
                        { $lt: [{ $floor: { $mod: [{ $divide: ["$timeTaken", 60] }, 60] } }, 10] },
                        { $concat: ["0", { $toString: { $floor: { $mod: [{ $divide: ["$timeTaken", 60] }, 60] } } }] },
                        { $toString: { $floor: { $mod: [{ $divide: ["$timeTaken", 60] }, 60] } } }
                      ]
                    },
                    ":",
                    {
                      $cond: [
                        { $lt: [{ $floor: { $mod: ["$timeTaken", 60] } }, 10] },
                        { $concat: ["0", { $toString: { $floor: { $mod: ["$timeTaken", 60] } } }] },
                        { $toString: { $floor: { $mod: ["$timeTaken", 60] } } }
                      ]
                    }
                  ]
                }
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
              "$addFields": {
                "percentage": {
                  "$floor": [
                    {
                      "$add": [
                        {
                          "$multiply": [
                            {
                              "$cond": {
                                "if": { "$ne": ["$totalMarks", 0] },
                                "then": { "$divide": ["$score", "$totalMarks"] },
                                "else": 0
                              }
                            },
                            100
                          ]
                        },
                        0.51
                      ]
                    }
                  ]
                }
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

        let [results] = await this.assessmentResultModel.aggregate(userResultsAggregation).exec();
        const userResultsCount = results.countResult.length > 0 ? results.countResult[0].total : 0;
        const userResults = results.paginatedResult;

        return {inviteesResult,inviteesCount, userResultsCount,userResults }
    }

    /**
     *Get all assessments results by Email
     *
     * @param {string} id
     * @param {string} email
     * @return {*}  {Promise<Assessment[]>}
     * @memberof AssessmentRepositoryImpl
     */
     public async getAssessmentResultsByEmail(id: string, email:string): Promise<any> {
     
      let userResultsAggregation = [
        {
          '$match': {
          'assessmentId': new mongoose.Types.ObjectId(id),
          'email': email
          }
        },  {
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
              'from': 'assessments', 
              'localField': 'assessmentId', 
              'foreignField': '_id', 
              'as': 'assessments'
            }
          }, {
            '$unwind': {
              'path': '$assessments', 
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
              'score': '$score', 
              'totalMarks': '$totalmarks', 
              'criteria': '$assessments.percentageCriteria', 
              'questions': '$questions',
              'resultId': '$_id', 
              'isScoreMarked': '$isScoreMarked',
              'attemptStartDate': '$attemptStartDate', // Include start date
              'attemptEndDate': '$attemptEndDate' // Include end date
            }
          }, {
            "$addFields": {
              "percentage": {
                "$floor": [
                  {
                    "$add": [
                      {
                        "$multiply": [
                          {
                            "$cond": {
                              "if": { "$ne": ["$totalMarks", 0] },
                              "then": { "$divide": ["$score", "$totalMarks"] },
                              "else": 0
                            }
                          },
                          100
                        ]
                      },
                      0.51
                    ]
                  }
                ]
              }
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
      ];

      let results = await this.assessmentResultModel.aggregate(userResultsAggregation).exec();
      return results;
  }

    public async getBulkResults(ids: string[],page : number,size: number, filtering?: string): Promise<any> {
      

      // Convert string IDs to ObjectIDs
      let assessmentIds = ids.map((id: string) => new mongoose.Types.ObjectId(id));

      // console.log("THIS IS THE BULK DATA FOR RESULT", assessmentIds)

      let sortFilter : any[] = []
      switch (filtering) {
        case 'Highest':
          sortFilter = [{
            '$sort': {
              'results.email': 1, 
              'results.percentage': -1
            }
          }];
          break;
        case 'Lowest':
          sortFilter = [{
            '$sort': {
              'results.email': 1, 
              'results.percentage': 1
            }
          }];
          break;
        case 'Latest':
          sortFilter = [{
            '$sort': {
              'results.email': 1, 
              'results._id': -1
            }
          }];
          break;
        case 'Earliest':
          sortFilter = [{
            '$sort': {
              'results.email': 1, 
              'results._id': 1
            }
          }];
          break;
        default:
          // console.log('No matching condition for filtering');
          break;

      }

      let filteringPipe: any [] = [{
        '$unwind': {
          'path': '$results', 
          'preserveNullAndEmptyArrays': true
        }
      }, ...sortFilter, {
        '$group': {
          '_id': '$results.email', 
          'highestScoreResult': {
            '$first': '$$ROOT'
          }
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$highestScoreResult'
        }
      }, {
        '$group': {
          '_id': '$_id', 
          'root': {
            '$first': '$$ROOT'
          }, 
          'results': {
            '$push': '$results'
          }
        }
      }, {
        '$addFields': {
          'root.results': '$results'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$root'
        }
      }]

      let bulkPipe : PipelineStage[] = [
        {
          '$match': {
            '_id': {
              '$in': assessmentIds
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
              'from': 'assessment-results', 
              'localField': '_id', 
              'foreignField': 'assessmentId', 
              'let': {
                'criteria': '$percentageCriteria'
              }, 
              'as': 'results', 
              'pipeline': [
                {
                  "$addFields": {
                    "validTotalMarks": {
                      "$cond": {
                        "if": { "$gt": [{ "$ifNull": ["$totalMarks", 0] }, 0] },
                        "then": "$totalMarks",
                        "else": "$totalmarks"
                      }
                    }
                  }
                },
                {
                  '$addFields': {
                      "percentage": {
                        "$floor": [
                          {
                            "$add": [
                              {
                                "$multiply": [
                                  {
                                    "$cond": {
                                      "if": { "$ne": ["$validTotalMarks", 0] },
                                      "then": { "$divide": ["$score", "$validTotalMarks"] },
                                      "else": 0
                                    }
                                  },
                                  100
                                ]
                              },
                              0.51
                            ]
                          }
                        ]
                      }
                    , 
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
          }, ...filteringPipe , {
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
                  '$unset': [
                    'percentageCriteria._id', 'percentageCriteria.certificateText'
                  ]
                }, {
                  '$addFields': {
                    'stingGroup': {
                      '$reduce': {
                        'input': '$percentageCriteria', 
                        'initialValue': '', 
                        'in': {
                          '$cond': [
                            {
                              '$eq': [
                                '$$value', ''
                              ]
                            }, {
                              '$concat': [
                                {
                                  '$toString': '$$this.to'
                                }, {
                                  '$toString': '$$this.from'
                                }
                              ]
                            }, {
                              '$concat': [
                                '$$value', ' | ', {
                                  '$toString': '$$this.to'
                                }, {
                                  '$toString': '$$this.from'
                                }
                              ]
                            }
                          ]
                        }
                      }
                    }
                  }
                }, {
                  '$group': {
                    '_id': '$stingGroup', 
                    'percentageCriteria': {
                      '$first': '$percentageCriteria'
                    }, 
                    'data': {
                      '$addToSet': '$name'
                    }
                  }
                }, {
                  '$project': {
                    '_id': {
                      '$reduce': {
                        'input': '$data', 
                        'initialValue': '', 
                        'in': {
                          '$cond': [
                            {
                              '$eq': [
                                '$$value', ''
                              ]
                            }, '$$this', {
                              '$concat': [
                                '$$value', ' \n ', '$$this'
                              ]
                            }
                          ]
                        }
                      }
                    }, 
                    'data': '$percentageCriteria'
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
                    'results.questions.assessmentName': '$name', 
                    'results.questions.assessmentId': '$_id'
                  }
                }, {
                  '$replaceRoot': {
                    'newRoot': '$results.questions'
                  }
                }, {
                  '$match': {
                    'meta.marks': {
                      '$ne': 0
                    }
                  }
                }, {
                  '$addFields': {
                    '_id': {
                      '$toObjectId': '$_id'
                    }
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
                  '$addFields': {
                    'incorrect_age': {
                      '$divide': [
                        {
                          '$subtract': [
                            '$count', '$correct'
                          ]
                        }, '$count'
                      ]
                    }
                  }
                }, {
                  '$match': {
                    'incorrect_age': {
                      '$gt': 0.69
                    }
                  }
                }, {
                  '$limit': 5
                }
              ], 
              'att': [
                {
                  '$unwind': {
                    'path': '$results'
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'value': {
                      '$avg': '$results.timeTaken'
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0, 
                    'value': {
                      '$concat': [
                        {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$divide': [
                                      '$value', 3600
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$divide': [
                                        '$value', 3600
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$divide': [
                                    '$value', 3600
                                  ]
                                }
                              }
                            }
                          ]
                        }, ':', {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$mod': [
                                      {
                                        '$divide': [
                                          '$value', 60
                                        ]
                                      }, 60
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$mod': [
                                        {
                                          '$divide': [
                                            '$value', 60
                                          ]
                                        }, 60
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$mod': [
                                    {
                                      '$divide': [
                                        '$value', 60
                                      ]
                                    }, 60
                                  ]
                                }
                              }
                            }
                          ]
                        }, ':', {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$mod': [
                                      '$value', 60
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$mod': [
                                        '$value', 60
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$mod': [
                                    '$value', 60
                                  ]
                                }
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              ], 
              'at': [
                {
                  '$project': {
                    '_id': 0, 
                    'value': {
                      '$multiply': [
                        {
                          '$toInt': '$attemptTime'
                        }, 60
                      ]
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0, 
                    'value': {
                      '$concat': [
                        {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$divide': [
                                      '$value', 3600
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$divide': [
                                        '$value', 3600
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$divide': [
                                    '$value', 3600
                                  ]
                                }
                              }
                            }
                          ]
                        }, ':', {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$mod': [
                                      {
                                        '$divide': [
                                          '$value', 60
                                        ]
                                      }, 60
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$mod': [
                                        {
                                          '$divide': [
                                            '$value', 60
                                          ]
                                        }, 60
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$mod': [
                                    {
                                      '$divide': [
                                        '$value', 60
                                      ]
                                    }, 60
                                  ]
                                }
                              }
                            }
                          ]
                        }, ':', {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$mod': [
                                      '$value', 60
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$mod': [
                                        '$value', 60
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$mod': [
                                    '$value', 60
                                  ]
                                }
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              ], 
              'lowt': [
                {
                  '$unwind': {
                    'path': '$results'
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'value': {
                      '$min': '$results.timeTaken'
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0, 
                    'value': {
                      '$concat': [
                        {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$divide': [
                                      '$value', 3600
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$divide': [
                                        '$value', 3600
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$divide': [
                                    '$value', 3600
                                  ]
                                }
                              }
                            }
                          ]
                        }, ':', {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$mod': [
                                      {
                                        '$divide': [
                                          '$value', 60
                                        ]
                                      }, 60
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$mod': [
                                        {
                                          '$divide': [
                                            '$value', 60
                                          ]
                                        }, 60
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$mod': [
                                    {
                                      '$divide': [
                                        '$value', 60
                                      ]
                                    }, 60
                                  ]
                                }
                              }
                            }
                          ]
                        }, ':', {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$mod': [
                                      '$value', 60
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$mod': [
                                        '$value', 60
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$mod': [
                                    '$value', 60
                                  ]
                                }
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              ], 
              'hight': [
                {
                  '$unwind': {
                    'path': '$results'
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'value': {
                      '$max': '$results.timeTaken'
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0, 
                    'value': {
                      '$concat': [
                        {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$divide': [
                                      '$value', 3600
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$divide': [
                                        '$value', 3600
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$divide': [
                                    '$value', 3600
                                  ]
                                }
                              }
                            }
                          ]
                        }, ':', {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$mod': [
                                      {
                                        '$divide': [
                                          '$value', 60
                                        ]
                                      }, 60
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$mod': [
                                        {
                                          '$divide': [
                                            '$value', 60
                                          ]
                                        }, 60
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$mod': [
                                    {
                                      '$divide': [
                                        '$value', 60
                                      ]
                                    }, 60
                                  ]
                                }
                              }
                            }
                          ]
                        }, ':', {
                          '$cond': [
                            {
                              '$lt': [
                                {
                                  '$floor': {
                                    '$mod': [
                                      '$value', 60
                                    ]
                                  }
                                }, 10
                              ]
                            }, {
                              '$concat': [
                                '0', {
                                  '$toString': {
                                    '$floor': {
                                      '$mod': [
                                        '$value', 60
                                      ]
                                    }
                                  }
                                }
                              ]
                            }, {
                              '$toString': {
                                '$floor': {
                                  '$mod': [
                                    '$value', 60
                                  ]
                                }
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              ], 
              'oap': [
                {
                  '$unwind': {
                    'path': '$results'
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'value': {
                      '$avg': '$results.percentage'
                    }
                  }
                }
              ], 
              'oam': [
                {
                  '$unwind': {
                    'path': '$results'
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'value': {
                      '$avg': '$results.score'
                    }
                  }
                }
              ], 
              'avgcriteria': [
                {
                  '$unwind': {
                    'path': '$results'
                  }
                }, {
                  '$group': {
                    '_id': '$percentageCriteria', 
                    'percentage': {
                      '$avg': '$results.percentage'
                    }
                  }
                },
                {
                  '$addFields': {
                    'percentage': { '$round': ['$percentage', 0] }
                  }
                },
                {
                  '$addFields': {
                    'value': {
                      '$reduce': {
                        'input': '$_id', 
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
              ],
              'totalmarks': [
                {
                  '$project': {
                    'marks': '$questions.meta.marks'
                  }
                }, {
                  '$project': {
                    'Total_marks': {
                      '$reduce': {
                        'input': '$marks', 
                        'initialValue': 0, 
                        'in': {
                          '$sum': [
                            '$$this', '$$value'
                          ]
                        }
                      }
                    }
                  }
                }, {
                  '$group': {
                    '_id': '$Total_marks'
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'marks': {
                      '$avg': '$_id'
                    }
                  }
                }
              ]
            }
          }, {
            '$project': {
              'Total Marks': { 'value' :{
                '$first': '$totalmarks.marks'
              }},
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
              'Minimum number of questions in an assessment': {
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
              'Worst Performing Questions': '$wpq', 
              'Overall average for the assessment in percentage': {
                'value': {
                  '$round': [
                    {
                      '$first': '$oap.value'
                    }, 2
                  ]
                }
              }, 
              'Overall average for the assessment in marks': {
                'value': {
                  '$round': [
                    {
                      '$first': '$oam.value'
                    }, 2
                  ]
                }
              }, 
              'Overall average for the assessment in grades': {
                '$first': '$avgcriteria'
              },
              'Average Time Taken': {
                'value': {
                  '$first': '$att.value'
                }
              }, 
              'Total Time': {
                'value': {
                  '$first': '$at.value'
                }
              }, 
              'Lowest Time': {
                'value': {
                  '$first': '$lowt.value'
                }
              }, 
              'Highest Time': {
                'value': {
                  '$first': '$hight.value'
                }
              }, 
              
            }
          }
        ]

        let domainAnswers: any = [
          {
            '$match': {
              'assessmentId': {
                '$in': assessmentIds
              }
            }
          }, {
            '$unwind': {
              'path': '$questions'
            }
          }, {
            '$project': {
              '_id': '$questions.questionCode', 
              'score': '$questions.score', 
              'marks': '$questions.meta.marks', 
              'topic': '$questions.meta.selectedTopic'
            }
          }, {
            '$match': {
              'marks': {
                '$gt': 0
              }
            }
          }, {
            '$group': {
              '_id': '$topic', 
              'score': {
                '$sum': '$score'
              }, 
              'marks': {
                '$sum': '$marks'
              }
            }
          }, {
            '$addFields': {
              'percentage': {
                '$multiply': [
                  {
                    '$divide': [
                      '$score', '$marks'
                    ]
                  }, 100
                ]
              }
            }
          }, {
            '$addFields': {
              'percentage': {
                '$trunc': [
                  '$percentage', 2
                ]
              }
            }
          }, {
            '$project': {
              '_id': 1, 
              'correct': '$percentage', 
              'incorrect': {
                '$trunc': [
                  {
                    '$subtract': [
                      100, '$percentage'
                    ]
                  }, 2
                ]
              }
            }
          }, {
            '$project': {
              'labels': [
                'الصحيحة', 'الخاطئة'
              ], 
              'datasets': [
                {
                  'data': [
                    '$correct', '$incorrect'
                  ]
                }
              ]
            }
          }
        ]

        let listOfMuliTakersPipe: any = [
          {
            '$match': {
              'assessmentId': {
                '$in': assessmentIds
              }
            }
          }, {
            '$lookup': {
              'from': 'assessments', 
              'localField': 'assessmentId', 
              'foreignField': '_id', 
              'as': 'name', 
              'pipeline': [
                {
                  '$project': {
                    'name': 1
                  }
                }
              ]
            }
          }, {
            '$group': {
              '_id': '$email', 
              'sum': {
                '$sum': 1
              }, 
              'name': {
                '$first': '$externalName'
              }, 
              'assessments': {
                '$push': {
                  '$first': '$name.name'
                }
              }
            }
          }, {
            '$match': {
              'sum': {
                '$gt': 1
              }
            }
          }
        ]

        let listOfMuliTakers = await this.assessmentResultModel.aggregate(listOfMuliTakersPipe).exec();

        let domainAnswersResult = await this.assessmentResultModel.aggregate(domainAnswers).exec();

        let result = await this.assessmentModel.aggregate(bulkPipe).exec();

        result[0].domainAnswers = domainAnswersResult;
        result[0].listOfMuliTakers = listOfMuliTakers;
      
        return result; 
    }

    /**
     *Get all assessments paginated
     *
     * @return {*}  {Promise<AssessmentResults[]>}
     * @memberof AssessmentRepositoryImpl
     */
    public async generateResults(): Promise<any> {
        let resultsAggregation : PipelineStage[] = 
        [
          {
            '$lookup': {
              'from': 'assessment-results', 
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
                                            '$$this.meta.orderedFields.value', []
                                          ]
                                        }, '$$this.meta.orderedFields.value', 'No Value'
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
                                    }, '$$this.meta.fields.field.correct', {
                                      '$cond': [
                                        {
                                          '$ne': [
                                            '$$this.meta.orderedFields.correct', []
                                          ]
                                        }, '$$this.meta.orderedFields.correct', 'No Correct Value'
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
                                  '$filter': {
                                    'input': {
                                      '$range': [
                                        0, {
                                          '$size': '$$this.value'
                                        }
                                      ]
                                    }, 
                                    'as': 'index', 
                                    'cond': {
                                      '$eq': [
                                        {
                                          '$arrayElemAt': [
                                            '$$this.value', '$$index'
                                          ]
                                        }, {
                                          '$arrayElemAt': [
                                            '$$this.correct', '$$index'
                                          ]
                                        }
                                      ]
                                    }
                                  }
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
            '$merge': {
              'into': 'assessment-results', 
              'on': '_id', 
              'whenMatched': 'replace', 
              'whenNotMatched': 'insert'
            }
          }
        ];
        return await this.assessmentAttemptModel.aggregate(resultsAggregation).exec();
    }

    /**
     *Get all assessments paginated
     *
     * @return {*}  {Promise<AssessmentResults[]>}
     * @memberof AssessmentRepositoryImpl
     */
     public async getGraphData(id: string): Promise<any> {
        let graphAggregation : PipelineStage[] = 
        [
          {
            '$match': {
              'assessmentId': new mongoose.Types.ObjectId(id)
            }
          }, {
              '$unwind': {
                'path': '$questions'
              }
            }, {
              '$match': {
                'questions.meta.marks': {
                  '$ne': 0
                }
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
                      '$or': [
                        {
                          '$eq': [
                            '$questionType', 'SELECT_ONE_IMAGE'
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
                            '$questionType', 'SELECT_ONE_IMAGE'
                          ]
                        }
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
                      '$or': [
                        {
                          '$eq': [
                            '$questionType', 'SELECT_MANY'
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
                            '$questionType', 'SELECT_MANY'
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
                          'values': {
                            '$reduce': {
                              'input': '$meta.value', 
                              'initialValue': [], 
                              'in': {
                                '$concatArrays': [
                                  '$$value', '$$this'
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
                                    'input': '$meta.value', 
                                    'initialValue': [], 
                                    'in': {
                                      '$concatArrays': [
                                        '$$value', '$$this'
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
                      '$or': [
                        {
                          '$eq': [
                            '$questionType', 'DRAG_DROP'
                          ]
                        }
                      ]
                    }, 'multibar', '$type'
                  ]
                }, 
                'data': {
                  '$cond': [
                    {
                      '$or': [
                        {
                          '$eq': [
                            '$questionType', 'DRAG_DROP'
                          ]
                        }
                      ]
                    }, {
                      'labels': {
                        '$first': '$meta.orderedFields.label'
                      }, 
                      'datasets': [
                        {
                          'label': 'Correct', 
                          'backgroundColor': true, 
                          'data': {
                            '$map': {
                              'input': {
                                '$first': '$meta.orderedFields.label'
                              }, 
                              'as': 'meta', 
                              'in': {
                                '$reduce': {
                                  'input': {
                                    '$reduce': {
                                      'input': {
                                        '$concatArrays': '$meta.orderedFields'
                                      }, 
                                      'initialValue': [], 
                                      'in': {
                                        '$concatArrays': [
                                          '$$this', '$$value'
                                        ]
                                      }
                                    }
                                  }, 
                                  'initialValue': 0, 
                                  'in': {
                                    '$cond': [
                                      {
                                        '$and': [
                                          {
                                            '$eq': [
                                              '$$meta', '$$this.label'
                                            ]
                                          }, {
                                            '$eq': [
                                              '$$this.correct', '$$this.value'
                                            ]
                                          }
                                        ]
                                      }, {
                                        '$add': [
                                          '$$value', 1
                                        ]
                                      }, '$$value'
                                    ]
                                  }
                                }
                              }
                            }
                          }
                        }, {
                          'label': 'Incorrect', 
                          'backgroundColor': false, 
                          'data': {
                            '$map': {
                              'input': {
                                '$first': '$meta.orderedFields.label'
                              }, 
                              'as': 'meta', 
                              'in': {
                                '$reduce': {
                                  'input': {
                                    '$reduce': {
                                      'input': {
                                        '$concatArrays': '$meta.orderedFields'
                                      }, 
                                      'initialValue': [], 
                                      'in': {
                                        '$concatArrays': [
                                          '$$this', '$$value'
                                        ]
                                      }
                                    }
                                  }, 
                                  'initialValue': 0, 
                                  'in': {
                                    '$cond': [
                                      {
                                        '$and': [
                                          {
                                            '$eq': [
                                              '$$meta', '$$this.label'
                                            ]
                                          }, {
                                            '$ne': [
                                              '$$this.correct', '$$this.value'
                                            ]
                                          }
                                        ]
                                      }, {
                                        '$add': [
                                          '$$value', 1
                                        ]
                                      }, '$$value'
                                    ]
                                  }
                                }
                              }
                            }
                          }
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
                            '$questionType', 'SELECT_MANY_IMAGE'
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
                            '$questionType', 'SELECT_MANY_IMAGE'
                          ]
                        }
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
                              'input': '$meta.value', 
                              'initialValue': [], 
                              'in': {
                                '$concatArrays': [
                                  '$$value', '$$this'
                                ]
                              }
                            }
                          }, 
                          'count': {
                            '$size': {
                              '$filter': {
                                'input': {
                                  '$reduce': {
                                    'input': '$meta.value', 
                                    'initialValue': [], 
                                    'in': {
                                      '$concatArrays': [
                                        '$$value', '$$this'
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
                      '$or': [
                        {
                          '$eq': [
                            '$questionType', 'STAR_RATING'
                          ]
                        }
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
                      '$or': [
                        {
                          '$eq': [
                            '$questionType', 'SMILE_RATING'
                          ]
                        }
                      ]
                    }, 'smile', '$type'
                  ]
                }, 
                'data': {
                  '$cond': [
                    {
                      '$or': [
                        {
                          '$eq': [
                            '$questionType', 'SMILE_RATING'
                          ]
                        }
                      ]
                    }, {
                      '$map': {
                        'input': {
                          '$first': '$meta.fields'
                        }, 
                        'as': 'option', 
                        'in': {
                          'label': '$$option.label', 
                          'url': '$$option.image', 
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
            }, {
              '$addFields': {
                'type': {
                  '$cond': [
                    {
                      '$or': [
                        {
                          '$eq': [
                            '$type', 'multibar'
                          ]
                        }
                      ]
                    }, 'bar', '$type'
                  ]
                }
              }
            }, {
              '$addFields': {
                'data.correctWrongData': {
                  '$let': {
                    'vars': {
                      'zipped': {
                        '$zip': {
                          'inputs': [
                            '$data.datasets.data', '$data.datasets.backgroundColor'
                          ]
                        }
                      }
                    }, 
                    'in': {
                      'label': [
                        'الإجابات الصحيحة', 'الإجابات الخاطئة'
                      ], 
                      'datasets': {
                        'data': [
                          {
                            '$reduce': {
                              'input': {
                                '$filter': {
                                  'input': '$$zipped', 
                                  'as': 'item', 
                                  'cond': {
                                    '$eq': [
                                      {
                                        '$arrayElemAt': [
                                          '$$item', 1
                                        ]
                                      }, true
                                    ]
                                  }
                                }
                              }, 
                              'initialValue': 0, 
                              'in': {
                                '$add': [
                                  '$$value', {
                                    '$arrayElemAt': [
                                      '$$this', 0
                                    ]
                                  }
                                ]
                              }
                            }
                          }, {
                            '$reduce': {
                              'input': {
                                '$filter': {
                                  'input': '$$zipped', 
                                  'as': 'item', 
                                  'cond': {
                                    '$eq': [
                                      {
                                        '$arrayElemAt': [
                                          '$$item', 1
                                        ]
                                      }, false
                                    ]
                                  }
                                }
                              }, 
                              'initialValue': 0, 
                              'in': {
                                '$add': [
                                  '$$value', {
                                    '$arrayElemAt': [
                                      '$$this', 0
                                    ]
                                  }
                                ]
                              }
                            }
                          }
                        ], 
                        'label': '$questionText', 
                        'backgroundColor': [
                          true, false
                        ]
                      }
                    }
                  }
                }
              }
            }, {
              '$project': {
                '_id': 1, 
                'questionType': 1, 
                'questionText': 1, 
                'order': 1, 
                'type': 1, 
                'data': 1, 
                'correctWrongData': '$data.correctWrongData'
              }
            }
          ]
        return await this.assessmentResultModel.aggregate(graphAggregation);
    }

    /**
     *Get all assessments paginated
     *
     * @return {*}  {Promise<AssessmentResults[]>}
     * @memberof AssessmentRepositoryImpl
     */
     public async update(assessmentResult: UpdateAssessmentResultDto): Promise<any> {

        let _id = assessmentResult._id;
        delete assessmentResult._id;

        // console.log(_id);

        await this.assessmentResultModel.updateOne({ _id }, { $set: { questions: assessmentResult.questions, isScoreMarked: true } });

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
                'into': 'assessment-results', 
                'on': '_id', 
                'whenMatched': 'replace', 
                'whenNotMatched': 'insert'
                }
            }
        ];
        return await this.assessmentResultModel.aggregate(updateResult);
    }

    /**
     *Get all assessments paginated
     *
     * @return {*}  {Promise<AssessmentResults[]>}
     * @memberof AssessmentRepositoryImpl
     */
    public async findIdByEmail(assessmentId:string, email:string): Promise<any> {
      // console.log("assessmentId", assessmentId);
        return await this.assessmentResultModel.findOne({ email: email, assessmentId: assessmentId }).exec();
    }

    public async findByAssessmentId(assessmentId:string): Promise<any> {
      return await this.assessmentResultModel.find({ assessmentId: assessmentId }).exec();
    }

    async delete(assessmentId: string, email:string): Promise<any> {
      return this.assessmentResultModel.deleteOne({ assessmentId: assessmentId, email:email });
    }


    public async generateExcel(idsArray: string[]): Promise<any> {

      let assessmentIds = idsArray.map((id: string) => new mongoose.Types.ObjectId(id));

      let resultsAggregation : PipelineStage[] =
      [
          {
            '$match': {
              'assessmentId': {
                      '$in': assessmentIds
              }
            }
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
                      '$toString': '$score'
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
                "percentage": {
                  "$floor": [
                    {
                      "$add": [
                        {
                          "$multiply": [
                            {
                              "$cond": {
                                "if": { "$ne": ["$total", 0] },
                                "then": { "$divide": ["$score", "$total"] },
                                "else": 0
                              }
                            },
                            100
                          ]
                        },
                        0.51
                      ]
                    }
                  ]
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
            }
          ];
      return await this.assessmentResultModel.aggregate(resultsAggregation).exec();
    }

    public async generateBulkExcel(idsArray: string[]): Promise<any> {

      let assessmentIds = idsArray.map((id: string) => new mongoose.Types.ObjectId(id));

      let resultsAggregation : PipelineStage[] =
      [
          {
              '$match': {
                  'assessmentId': {
                      '$in': assessmentIds
                  }
              }
          }, {
              '$unwind': {
                'path': '$questions'
              }
            }, {
              '$addFields': {
                'questions.assessmentId': '$assessmentId'
              }
            }, {
              '$replaceRoot': {
                'newRoot': '$questions'
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
                      'name': '$name', 
                      'questionBank': '$questionBankId'
                    }
                  }, {
                    '$lookup': {
                      'from': 'question-banks', 
                      'localField': 'questionBank', 
                      'foreignField': '_id', 
                      'as': 'questionBank'
                    }
                  }, {
                    '$unwind': {
                      'path': '$questionBank'
                    }
                  }
                ]
              }
            }, {
              '$unwind': {
                'path': '$assessment', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$group': {
                '_id': '$questionText', 
                'correct': {
                  '$sum': {
                    '$cond': [
                      {
                        '$eq': [
                          '$score', '$meta.marks'
                        ]
                      }, 1, 0
                    ]
                  }
                }, 
                'incorrect': {
                  '$sum': {
                    '$cond': [
                      {
                        '$ne': [
                          '$score', '$meta.marks'
                        ]
                      }, 1, 0
                    ]
                  }
                }, 
                'order': {
                  '$first': '$order'
                }, 
                'topic': {
                  '$first': '$meta.selectedTopic'
                }, 
                'assessments': {
                  '$addToSet': '$assessment.name'
                }, 
                'type': {
                  '$addToSet': '$assessment.questionBank.name'
                }
              }
            }, {
              '$addFields': {
                'assessments': {
                  '$reduce': {
                    'input': '$assessments', 
                    'initialValue': '', 
                    'in': {
                      '$concat': [
                        {
                          '$cond': [
                            {
                              '$eq': [
                                '$$value', ''
                              ]
                            }, '', {
                              '$concat': [
                                '$$value', ', '
                              ]
                            }
                          ]
                        }, '$$this'
                      ]
                    }
                  }
                }, 
                'type': {
                  '$reduce': {
                    'input': '$type', 
                    'initialValue': '', 
                    'in': {
                      '$concat': [
                        {
                          '$cond': [
                            {
                              '$eq': [
                                '$$value', ''
                              ]
                            }, '', {
                              '$concat': [
                                '$$value', ', '
                              ]
                            }
                          ]
                        }, '$$this'
                      ]
                    }
                  }
                }
              }
            }, {
              '$sort': {
                'order': 1
              }
            }, {
              '$project': {
                '_id': 0, 
                'question': '$_id', 
                'topic': '$topic', 
                'correct': '$correct', 
                'incorrect': '$incorrect', 
                'assessments': '$assessments', 
                'type': '$type'
              }
            }
          ]
      return await this.assessmentResultModel.aggregate(resultsAggregation).exec();
    }

    public async generatePdf(idsArray: string[]): Promise<any> {

      let assessmentIds = idsArray.map((id: string) => new mongoose.Types.ObjectId(id));

      let userResultsAggregation = [
        {
          '$match': {
            'assessmentId': {
              '$in': assessmentIds
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
              'from': 'assessments', 
              'localField': 'assessmentId', 
              'foreignField': '_id', 
              'as': 'assessments'
            }
          }, {
            '$unwind': {
              'path': '$assessments', 
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
                  'else': '$externalGender'
                }
              }, 
              'score': '$score', 
              'totalMarks': '$totalmarks', 
              'criteria': '$assessments.percentageCriteria', 
              'questions': '$questions',
              'resultId': '$_id', 
              'isScoreMarked': '$isScoreMarked', 
              'externalFields': 1,
              'timeTaken': {
                $concat: [
                  {
                    $cond: [
                      { $lt: [{ $floor: { $divide: ["$timeTaken", 3600] } }, 10] },
                      { $concat: ["0", { $toString: { $floor: { $divide: ["$timeTaken", 3600] } } }] },
                      { $toString: { $floor: { $divide: ["$timeTaken", 3600] } } }
                    ]
                  },
                  ":",
                  {
                    $cond: [
                      { $lt: [{ $floor: { $mod: [{ $divide: ["$timeTaken", 60] }, 60] } }, 10] },
                      { $concat: ["0", { $toString: { $floor: { $mod: [{ $divide: ["$timeTaken", 60] }, 60] } } }] },
                      { $toString: { $floor: { $mod: [{ $divide: ["$timeTaken", 60] }, 60] } } }
                    ]
                  },
                  ":",
                  {
                    $cond: [
                      { $lt: [{ $floor: { $mod: ["$timeTaken", 60] } }, 10] },
                      { $concat: ["0", { $toString: { $floor: { $mod: ["$timeTaken", 60] } } }] },
                      { $toString: { $floor: { $mod: ["$timeTaken", 60] } } }
                    ]
                  }
                ]
              }
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
            "$addFields": {
              "percentage": {
                "$floor": [
                  {
                    "$add": [
                      {
                        "$multiply": [
                          {
                            "$cond": {
                              "if": { "$ne": ["$totalMarks", 0] },
                              "then": { "$divide": ["$score", "$totalMarks"] },
                              "else": 0
                            }
                          },
                          100
                        ]
                      },
                      0.51
                    ]
                  }
                ]
              }
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
      ];
      return await this.assessmentResultModel.aggregate(userResultsAggregation).exec();
    }

    public async generateBulkUserExcel(idsArray: string[]): Promise<any> {

      let assessmentIds = idsArray.map((id: string) => new mongoose.Types.ObjectId(id));

      // console.log("assessmentIds",assessmentIds);

      let aggre : any = 
        [
          {
            '$match': {
              'assessmentId': {
                '$in': assessmentIds
              }
            }
          },
          {
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
              "percentage": {
                "$floor": [
                  {
                    "$add": [
                      {
                        "$multiply": [
                          {
                            "$cond": {
                              "if": { "$ne": ["$total", 0] },
                              "then": { "$divide": ["$score", "$total"] },
                              "else": 0
                            }
                          },
                          100
                        ]
                      },
                      0.51
                    ]
                  }
                ]
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
          }
        ];

      return await this.assessmentResultModel.aggregate(aggre).exec();

    }


    public async getBulkGraph(ids: string[]): Promise<any> {

      // console.log("this is it",ids);

      let assessmentIds = ids.map((id: string) => new mongoose.Types.ObjectId(id));

      let graphAggregation : PipelineStage[] = 
      [
        {
          '$match': {
            'assessmentId': {
              '$in': assessmentIds
            }
          }
        }, {
            '$unwind': {
              'path': '$questions'
            }
          }, {
            '$match': {
              'questions.meta.marks': {
                '$ne': 0
              }
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
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'SELECT_ONE_IMAGE'
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
                          '$questionType', 'SELECT_ONE_IMAGE'
                        ]
                      }
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
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'SELECT_MANY'
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
                          '$questionType', 'SELECT_MANY'
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
                        'values': {
                          '$reduce': {
                            'input': '$meta.value', 
                            'initialValue': [], 
                            'in': {
                              '$concatArrays': [
                                '$$value', '$$this'
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
                                  'input': '$meta.value', 
                                  'initialValue': [], 
                                  'in': {
                                    '$concatArrays': [
                                      '$$value', '$$this'
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
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'DRAG_DROP'
                        ]
                      }
                    ]
                  }, 'multibar', '$type'
                ]
              }, 
              'data': {
                '$cond': [
                  {
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'DRAG_DROP'
                        ]
                      }
                    ]
                  }, {
                    'labels': {
                      '$first': '$meta.orderedFields.label'
                    }, 
                    'datasets': [
                      {
                        'label': 'Correct', 
                        'backgroundColor': true, 
                        'data': {
                          '$map': {
                            'input': {
                              '$first': '$meta.orderedFields.label'
                            }, 
                            'as': 'meta', 
                            'in': {
                              '$reduce': {
                                'input': {
                                  '$reduce': {
                                    'input': {
                                      '$concatArrays': '$meta.orderedFields'
                                    }, 
                                    'initialValue': [], 
                                    'in': {
                                      '$concatArrays': [
                                        '$$this', '$$value'
                                      ]
                                    }
                                  }
                                }, 
                                'initialValue': 0, 
                                'in': {
                                  '$cond': [
                                    {
                                      '$and': [
                                        {
                                          '$eq': [
                                            '$$meta', '$$this.label'
                                          ]
                                        }, {
                                          '$eq': [
                                            '$$this.correct', '$$this.value'
                                          ]
                                        }
                                      ]
                                    }, {
                                      '$add': [
                                        '$$value', 1
                                      ]
                                    }, '$$value'
                                  ]
                                }
                              }
                            }
                          }
                        }
                      }, {
                        'label': 'Incorrect', 
                        'backgroundColor': false, 
                        'data': {
                          '$map': {
                            'input': {
                              '$first': '$meta.orderedFields.label'
                            }, 
                            'as': 'meta', 
                            'in': {
                              '$reduce': {
                                'input': {
                                  '$reduce': {
                                    'input': {
                                      '$concatArrays': '$meta.orderedFields'
                                    }, 
                                    'initialValue': [], 
                                    'in': {
                                      '$concatArrays': [
                                        '$$this', '$$value'
                                      ]
                                    }
                                  }
                                }, 
                                'initialValue': 0, 
                                'in': {
                                  '$cond': [
                                    {
                                      '$and': [
                                        {
                                          '$eq': [
                                            '$$meta', '$$this.label'
                                          ]
                                        }, {
                                          '$ne': [
                                            '$$this.correct', '$$this.value'
                                          ]
                                        }
                                      ]
                                    }, {
                                      '$add': [
                                        '$$value', 1
                                      ]
                                    }, '$$value'
                                  ]
                                }
                              }
                            }
                          }
                        }
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
                          '$questionType', 'SELECT_MANY_IMAGE'
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
                          '$questionType', 'SELECT_MANY_IMAGE'
                        ]
                      }
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
                            'input': '$meta.value', 
                            'initialValue': [], 
                            'in': {
                              '$concatArrays': [
                                '$$value', '$$this'
                              ]
                            }
                          }
                        }, 
                        'count': {
                          '$size': {
                            '$filter': {
                              'input': {
                                '$reduce': {
                                  'input': '$meta.value', 
                                  'initialValue': [], 
                                  'in': {
                                    '$concatArrays': [
                                      '$$value', '$$this'
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
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'STAR_RATING'
                        ]
                      }
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
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'SMILE_RATING'
                        ]
                      }
                    ]
                  }, 'smile', '$type'
                ]
              }, 
              'data': {
                '$cond': [
                  {
                    '$or': [
                      {
                        '$eq': [
                          '$questionType', 'SMILE_RATING'
                        ]
                      }
                    ]
                  }, {
                    '$map': {
                      'input': {
                        '$first': '$meta.fields'
                      }, 
                      'as': 'option', 
                      'in': {
                        'label': '$$option.label', 
                        'url': '$$option.image', 
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
          }, {
            '$addFields': {
              'type': {
                '$cond': [
                  {
                    '$or': [
                      {
                        '$eq': [
                          '$type', 'multibar'
                        ]
                      }
                    ]
                  }, 'bar', '$type'
                ]
              }
            }
          }, {
            '$addFields': {
              'data.correctWrongData': {
                '$let': {
                  'vars': {
                    'zipped': {
                      '$zip': {
                        'inputs': [
                          '$data.datasets.data', '$data.datasets.backgroundColor'
                        ]
                      }
                    }
                  }, 
                  'in': {
                    'label': [
                      'الإجابات الصحيحة', 'الإجابات الخاطئة'
                    ], 
                    'datasets': {
                      'data': [
                        {
                          '$reduce': {
                            'input': {
                              '$filter': {
                                'input': '$$zipped', 
                                'as': 'item', 
                                'cond': {
                                  '$eq': [
                                    {
                                      '$arrayElemAt': [
                                        '$$item', 1
                                      ]
                                    }, true
                                  ]
                                }
                              }
                            }, 
                            'initialValue': 0, 
                            'in': {
                              '$add': [
                                '$$value', {
                                  '$arrayElemAt': [
                                    '$$this', 0
                                  ]
                                }
                              ]
                            }
                          }
                        }, {
                          '$reduce': {
                            'input': {
                              '$filter': {
                                'input': '$$zipped', 
                                'as': 'item', 
                                'cond': {
                                  '$eq': [
                                    {
                                      '$arrayElemAt': [
                                        '$$item', 1
                                      ]
                                    }, false
                                  ]
                                }
                              }
                            }, 
                            'initialValue': 0, 
                            'in': {
                              '$add': [
                                '$$value', {
                                  '$arrayElemAt': [
                                    '$$this', 0
                                  ]
                                }
                              ]
                            }
                          }
                        }
                      ], 
                      'label': '$questionText', 
                      'backgroundColor': [
                        true, false
                      ]
                    }
                  }
                }
              }
            }
          }, {
            '$project': {
              '_id': 1, 
              'questionType': 1, 
              'questionText': 1, 
              'order': 1, 
              'type': 1, 
              'data': 1, 
              'correctWrongData': '$data.correctWrongData'
            }
          }
      ]
      return await this.assessmentResultModel.aggregate(graphAggregation).exec();

    }

    public async regenerateResults(id: string): Promise<any> {

      await this.assessmentResultModel.deleteMany({ assessmentId: new mongoose.Types.ObjectId(id) }).exec();

      let res = await this.generateResults();

      return res;

    }
}