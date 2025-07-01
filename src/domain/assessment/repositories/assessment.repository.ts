import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { Assessment, UpdateAssessmentDto } from "../dto/assessment.dto";
import { AssessmentResult } from "../dto/assessment-result.dto";
import { AssessmentRepository } from "../interfaces/assessment-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


/**
 *Assessment Repository
 *
 * @export
 * @class AssessmentRepositoryImpl
 * @implements {AssessmentRepository}
 */
@Injectable()
export class AssessmentRepositoryImpl implements AssessmentRepository {


  /**
   * Creates an instance of AssessmentRepositoryImpl.
   * @param {Model<Assessment>} assessmentModel
   * @memberof AssessmentRepositoryImpl
   */
  constructor(
    @InjectModel('assessment') private readonly assessmentModel: Model<Assessment>,
    @InjectModel('assessment-results') private readonly assessmentResultModel: Model<AssessmentResult>
  ) { }


  /**
   *Increment attempt count of an assessment
   *
   * @param {string} _id
   * @return {*}  {Promise<UpdateWriteOpResult>}
   * @memberof AssessmentRepositoryImpl
   */
  async incrementAttempt(_id: string): Promise<UpdateWriteOpResult> {
    let survey = await this.assessmentModel.findById(_id);
    return this.assessmentModel.updateOne({ _id }, { $set: { attempts: (survey.attempts + 1) } })
  }


  /**
   *Bulk delete assessments based on ids
   *
   * @param {string[]} ids
   * @return {*}  {Promise<any>}
   * @memberof AssessmentRepositoryImpl
   */
  bulkDelete(ids: string[]): Promise<any> {
    return this.assessmentModel.deleteMany({ _id: { $in: ids } });
  }

    /**
     *Get all unattempted assessments
     *
     * @param {string} uid
     * @return {*}  {Promise<Assessment[]>}
     * @memberof AssessmentRepositoryImpl
     */
    getUnAttempted(uid: string, email: string): Promise<Assessment[]> {
        let oId = new mongoose.Types.ObjectId(uid)
        let pipe: any = [
            {
              $lookup: {
                  from: "assessment-attempts",
                  localField: "_id",
                  foreignField: "assessmentId",
                  as: "matchedDocument",
                  pipeline: [
                      {
                          $match: {
                              email: email
                          }
                      }
                  ]
              }
          },
          {
                $match: {
                    $and: [
                        {
                            attendees: {
                                $in: [oId]
                            },
                        },
                        {
                            status: { $in: ['Active','Pending'] }
                        }
                    ],
                },
            },
          {
            $sort: {
              createdAt: -1
            }
          }
        ]
        return this.assessmentModel.aggregate(pipe);
      }

    getCertificateData(postData: any): Promise<Assessment[]> {

      let match: any;
      if (postData.userTesting) {
        match = {
          '_id': new mongoose.Types.ObjectId(postData.assessmentId),
        };
      }
      else {
        match = {
          'email': postData.email,
          'assessmentId': new mongoose.Types.ObjectId(postData.assessmentId),
        };
      }
      let pipe: any =
        [
          {
            '$match': match
          }, {
            '$unwind': {
              'path': '$questions'
            }
          }, {
            '$replaceRoot': {
              'newRoot': '$questions'
            }
          }, {
            '$match': {
              'meta.QType': 'Service'
            }
          }, {
            '$lookup': {
              'from': 'data',
              'localField': 'meta.service',
              'foreignField': 'id',
              'as': 'service',
              'pipeline': [
                {
                  '$graphLookup': {
                    'from': 'organization-units',
                    'startWith': '$ous',
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
                  '$addFields': {
                    'parent': {
                      '$reduce': {
                        'input': '$breadcrumbs',
                        'initialValue': {
                          'depth': 0
                        },
                        'in': {
                          '$cond': [
                            {
                              '$eq': [
                                '$$this.depth', '$$value.depth'
                              ]
                            }, '$$this', '$$value'
                          ]
                        }
                      }
                    },
                    'ministry': {
                      '$reduce': {
                        'input': '$breadcrumbs',
                        'initialValue': {
                          'depth': 0
                        },
                        'in': {
                          '$cond': [
                            {
                              '$gte': [
                                '$$this.depth', '$$value.depth'
                              ]
                            }, '$$this', '$$value'
                          ]
                        }
                      }
                    }
                  }
                }
              ]
            }
          }, {
            '$unwind': {
              'path': '$service'
            }
          }, {
            '$addFields': {
              'correct': {
                '$ne': [
                  '$score', 0
                ]
              }
            }
          }, {
            '$group': {
              '_id': {
                'ministry': '$service.ministry',
                'correct': '$correct'
              },
              'count': {
                '$count': {}
              }
            }
          }, {
            '$addFields': {
              '_id.ministry.questioncount': '$count'
            }
          }, {
            '$group': {
              '_id': '$_id.correct',
              'set': {
                '$addToSet': '$_id.ministry'
              }
            }
          }
        ]
      if (postData.userTesting) {
        return this.assessmentModel.aggregate(pipe);
      }
      else {
        return this.assessmentResultModel.aggregate(pipe);
      }
    }

  /**
   *Get all attempted assessments
   *
   * @param {string} uid
   * @return {*}  {Promise<Assessment[]>}
   * @memberof AssessmentRepositoryImpl
   */
  getAllAttempted(uid: string, email: string): Promise<Assessment[]> {
    let oId = new mongoose.Types.ObjectId(uid)
    let pipe: any = [
      {
        $lookup: {
          from: "assessment-attempts",
          localField: "_id",
          foreignField: "assessmentId",
          as: "matchedDocument",
          pipeline: [
            {
              $match: {
                email: email
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "assessment-results",
          localField: "_id",
          foreignField: "assessmentId",
          as: "results",
          pipeline: [
            {
              $match: {
                email: email
              }
            }
          ]
        }
      },
      {
        $match: {
          $and: [
            {
              $expr: {
                $in: ["$_id", "$matchedDocument.assessmentId"]
              }
            },
            {
              status: { $in: ["Active", "Closed"] }
            }
          ]
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]
    return this.assessmentModel.aggregate(pipe);
  }


  /**
   *Create a new assessment
   *
   * @param {Assessment} assessment
   * @return {*}  {Promise<Assessment>}
   * @memberof AssessmentRepositoryImpl
   */
  public create(assessment: Assessment, uid: string): Promise<Assessment> {
    assessment.status = 'Active';
    assessment.createdBy = uid;
    return this.assessmentModel.create(assessment);
  }


  /**
   *Get all assessments paginated
   *
   * @param {number} page
   * @param {number} size
   * @return {*}  {Promise<Assessment[]>}
   * @memberof AssessmentRepositoryImpl
   */
  public async getAll(page: number, size: number, tags: string[], trainingTypeId: string): Promise<any> {
    const skip = (page - 1) * size;

    let getDocumentsPipe: any = [
      {
        '$lookup': {
          'from': 'question-banks',
          'localField': 'questionBankId',
          'foreignField': '_id',
          'as': 'qbanks'
        }
      }, {
        '$unwind': {
          'path': '$qbanks',
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$lookup': {
          'from': 'survey-tags',
          'localField': 'qbanks.tag',
          'foreignField': '_id',
          'as': 'tag'
        }
      }, {
        '$unwind': {
          'path': '$tag',
          'preserveNullAndEmptyArrays': false
        }
      }
    ];
    if (trainingTypeId) {
      getDocumentsPipe.push({
        '$match': {
          'tag.tag': { '$in': tags },
          'trainingTypeId': new mongoose.Types.ObjectId(trainingTypeId),
          'cloneParentId': null
        }
      });
    } else {
      getDocumentsPipe.push({
        '$match': {
          'tag.tag': { '$in': tags },
          'cloneParentId': null
        }
      });
    }
    getDocumentsPipe.push(
      {
        '$skip': Number(skip)
      },
      {
        '$limit': Number(size)
      }
    );
    let data = await this.assessmentModel.aggregate(getDocumentsPipe).exec();

    let countDocumentsPipe = [
      {
        '$lookup': {
          'from': 'question-banks',
          'localField': 'questionBankId',
          'foreignField': '_id',
          'as': 'qbanks'
        }
      }, {
        '$unwind': {
          'path': '$qbanks',
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$lookup': {
          'from': 'survey-tags',
          'localField': 'qbanks.tag',
          'foreignField': '_id',
          'as': 'tag'
        }
      }, {
        '$unwind': {
          'path': '$tag',
          'preserveNullAndEmptyArrays': false
        }
      }
    ];
    if (trainingTypeId) {
      getDocumentsPipe.push({
        '$match': {
          'tag.tag': { '$in': tags },
          'trainingTypeId': new mongoose.Types.ObjectId(trainingTypeId),
          'cloneParentId': null
        }
      });
    } else {
      getDocumentsPipe.push({
        '$match': {
          'tag.tag': { '$in': tags },
          'cloneParentId': null
        }
      });
    }
    let documentCount = (await this.assessmentModel.aggregate(countDocumentsPipe)).length;
    // console.log(page, size, skip, tags, data, documentCount);
    return { data, documentCount }
  }


  /**
   *Get single assessment by id
   *
   * @param {string} id
   * @return {*}  {Promise<Assessment>}
   * @memberof AssessmentRepositoryImpl
   */

   public async findById(id: string): Promise<any> {
        var pipe = [
          {
            '$match': {
              '_id': new mongoose.Types.ObjectId(id),
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
                        }
                    ]
                }
            }, {
                '$addFields': {
                    'tags': '$questionBankDetails.tagDetails'
                }
            }, {
                '$addFields': {
                    'currentDate': {
                        '$dateAdd': {
                            'startDate': '$$NOW', 
                            'unit': 'hour', 
                            'amount': 3
                        }
                    }
                }
            }, {
                '$addFields': {
                    'secondsUntilStartDate': {
                        '$dateDiff': {
                            'startDate': '$currentDate', 
                            'endDate': {
                                '$dateFromString': {
                                    'dateString': '$startDate', 
                                    'format': '%d-%m-%Y %H:%M'
                                }
                            }, 
                            'unit': 'second'
                        }
                    }, 
                    'secondsUntilEndDate': {
                        '$dateDiff': {
                            'startDate': '$currentDate', 
                            'endDate': {
                                '$dateFromString': {
                                    'dateString': '$endDate', 
                                    'format': '%d-%m-%Y %H:%M'
                                }
                            }, 
                            'unit': 'second'
                        }
                    }
                }
            }
        ]

    let result = await this.assessmentModel.aggregate(pipe).exec()

    if(result[0]) {
        return result[0]
    } else {
        return {}
      }
  }

  /**
   *Update an existing assessment
   *
   * @param {UpdateAssessmentDto} assessment
   * @return {*}  {Promise<UpdateWriteOpResult>}
   * @memberof AssessmentRepositoryImpl
   */
  public update(assessment: UpdateAssessmentDto): Promise<UpdateWriteOpResult> {
    let _id = assessment._id;
    delete assessment._id;
    return this.assessmentModel.updateOne({ _id }, { $set: assessment })
  }


  /**
   *Delete an existing assessment
   *
   * @param {string} _id
   * @return {*}  {Promise<any>}
   * @memberof AssessmentRepositoryImpl
   */
  public delete(_id: string): Promise<any> {
    return this.assessmentModel.deleteOne({ _id });
  }

  /**
   *Get all assessments paginated
   *
   * @param {number} page
   * @param {number} size
   * @return {*}  {Promise<Assessment[]>}
   * @memberof AssessmentRepositoryImpl
   */
  public async getAssessmentResults(id: string, page: number, size: number): Promise<any> {
    const skip = (page - 1) * size;

    let addedUsersAggregation = [
      {
        "$match": {
          "_id": new mongoose.Types.ObjectId(id)
        }
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "attendees",
          "foreignField": "_id",
          "as": "users"
        }
      },
      {
        "$unwind": {
          "path": "$users",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$project": {
          "invitees": {
            "$setUnion": [
              [
                {
                  "_id": "$users._id",
                  "name": "$users.name",
                  "email": "$users.email",
                  "contact": "$users.phone",
                  "gender": "$users.gender"
                }
              ],
              {
                "$map": {
                  "input": "$externals",
                  "as": "externalEmail",
                  "in": {
                    "_id": "",
                    "name": "",
                    "contact": "",
                    "gender": "",
                    "email": "$$externalEmail"
                  }
                }
              }
            ]
          }
        }
      }
    ];

    let inviteesResult = await this.assessmentModel.aggregate(addedUsersAggregation);
    let invitees = (inviteesResult.length > 0 && Object.keys(inviteesResult[0].invitees[0]).length > 0)
      ? inviteesResult[0].invitees
      : [];

    let userResultsAggregation = [
      {
        '$match': {
          '_id': new mongoose.Types.ObjectId(id)
        }
      }, {
        '$lookup': {
          'from': 'assessment-results',
          'localField': '_id',
          'foreignField': 'assessmentId',
          'as': 'assessmentResults'
        }
      }, {
        '$unwind': {
          'path': '$assessmentResults',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'assessmentResults.email',
          'foreignField': 'email',
          'as': 'user'
        }
      }, {
        '$unwind': {
          'path': '$user',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'assessments',
          'localField': 'assessmentResults.assessmentId',
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
              'else': ''
            }
          },
          'email': '$assessmentResults.email',
          'contact': {
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
          'score': '$assessmentResults.score',
          'totalMarks': '$assessmentResults.totalmarks',
          'criteria': '$assessments.percentageCriteria',
          'questions': '$assessmentResults.questions',
          'resultId': '$assessmentResults._id',
        }
      }, {
        '$addFields': {
          'percentage': {
            '$round': [{
              '$multiply': [
              {
                '$divide': [
                  '$score', '$totalMarks'
                ]
              }, 100
            ]
            }, 
            0]
            
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
                        '$lt': [
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
    let userResults = await this.assessmentModel.aggregate(userResultsAggregation);

    return { invitees, userResults }
  }
}