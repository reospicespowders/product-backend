import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { Survey, UpdateSurveyDto } from "../dto/survey.dto";
import { SurveyRepository } from "../interfaces/survey-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { SurveyTag } from "../dto/survey-type.dto";


/**
 *Survey Repository
 *
 * @export
 * @class SurveyRepositoryImpl
 * @implements {SurveyRepository}
 */
@Injectable()
export class SurveyRepositoryImpl implements SurveyRepository {


    /**
     * Creates an instance of SurveyRepositoryImpl.
     * @param {Model<Survey>} surveyModel
     * @memberof SurveyRepositoryImpl
     */
    constructor(
        @InjectModel('survey') private readonly surveyModel: Model<Survey>,
        @InjectModel('survey-tags') private readonly surveyTagsModel: Model<SurveyTag>
    ) { }


    getAllTagsFiltered(tags: string[], trainingTypeId: string): Promise<Survey[]> {
        let pipe = [
            {
                '$match': {
                    'tag': {
                        '$in': tags
                    },
                }
            }, {
                '$lookup': {
                    'from': 'survey-types',
                    'localField': '_id',
                    'foreignField': 'tag',
                    'as': 'survey-types'
                }
            }, {
                '$unwind': {
                    'path': '$survey-types'
                }
            }, {
                '$lookup': {
                    'from': 'surveys',
                    'localField': 'survey-types._id',
                    'foreignField': 'type',
                    'as': 'surveys',
                    pipeline: (trainingTypeId) ? [
                        {
                            $match: {
                                trainingTypeId: new mongoose.Types.ObjectId(trainingTypeId),
                                'cloneParentId': null
                            },
                        },
                    ] : [],
                }
            }, {
                '$unwind': {
                    'path': '$surveys'
                }
            }, {
                '$replaceRoot': {
                    'newRoot': '$surveys'
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': '_id',
                    'foreignField': 'createdBy',
                    'as': 'createdBy'
                }
            }, {
                '$unwind': {
                    'path': '$createdBy',
                    'preserveNullAndEmptyArrays': true
                }
            },{
                '$lookup': {
                'from': 'survey-attempts', 
                'localField': '_id', 
                'foreignField': 'surveyId', 
                'as': 'attempts', 
                'pipeline': [
                    {
                    '$count': 'count'
                    }
                ]
                }
            }, {
                '$addFields': {
                'attempts': {
                    '$first': '$attempts.count'
                }
                }
            }
        ];

        return this.surveyTagsModel.aggregate(pipe);
    }

    getAllTagsFiltered2(tags: string[], trainingTypeId: string): Promise<Survey[]> {
        let pipe = [
            {
                '$match': {
                    'tag': {
                        '$in': tags
                    },
                }
            }, {
                '$lookup': {
                    'from': 'survey-types',
                    'localField': '_id',
                    'foreignField': 'tag',
                    'as': 'survey-types'
                }
            }, {
                '$unwind': {
                    'path': '$survey-types'
                }
            }, {
                '$lookup': {
                    'from': 'surveys',
                    'localField': 'survey-types._id',
                    'foreignField': 'type',
                    'as': 'surveys',
                    pipeline: (trainingTypeId) ? [
                        {
                            $match: {
                                trainingTypeId: new mongoose.Types.ObjectId(trainingTypeId),
                                'cloneParentId': null
                            },
                        },
                    ] : [],
                }
            }, {
                '$unwind': {
                    'path': '$surveys'
                }
            }, {
                '$replaceRoot': {
                    'newRoot': '$surveys'
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': '_id',
                    'foreignField': 'createdBy',
                    'as': 'createdBy'
                }
            }, {
                '$unwind': {
                    'path': '$createdBy',
                    'preserveNullAndEmptyArrays': true
                }
            },
        ];

        return this.surveyTagsModel.aggregate(pipe);
    }


    /**
     *Get all unattempted surveys
     *
     * @param {string} uid
     * @return {*}  {Promise<Survey[]>}
     * @memberof SurveyRepositoryImpl
     */
    getUnAttempted(uid: string, email: string): Promise<Survey[]> {
        let oId = new mongoose.Types.ObjectId(uid)
        let pipe: any = [
            {
                $lookup: {
                    from: "survey-attempts",
                    localField: "_id",
                    foreignField: "surveyId",
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

        return this.surveyModel.aggregate(pipe);
    }

    /**
     *Get all attempted surveys
     *
     * @param {string} uid
     * @return {*}  {Promise<Survey[]>}
     * @memberof SurveyRepositoryImpl
     */
    getAllAttempted(uid: string, email: string): Promise<Survey[]> {
        let oId = new mongoose.Types.ObjectId(uid)
        let pipe: any = [
            {
                $lookup: {
                    from: "survey-attempts",
                    localField: "_id",
                    foreignField: "surveyId",
                    as: "matchedDocument",
                    pipeline: [
                        {
                            $match: {
                                email: email
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "assessment-results",
                    localField: "_id",
                    foreignField: "surveyId",
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
                                $in: ["$_id", "$matchedDocument.surveyId"]
                            }
                        },
                        {
                            status: { $in: ['Active', 'Closed'] }
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

        return this.surveyModel.aggregate(pipe);
    }


    deleteByType(type: string): Promise<any> {
        return this.surveyModel.deleteMany({ type: type });
    }


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
      },{
        '$lookup': {
        'from': 'survey-types', 
        'localField': 'type', 
        'foreignField': '_id', 
        'as': 'type'
        }
       },{
        '$unwind': {
        'path': '$type', 
        'preserveNullAndEmptyArrays': true
        }
       },{
        '$addFields': {
          'currentDate': '$$NOW', 
          'secondsUntilStartDate': {
            '$dateDiff': {
              'startDate': '$$NOW', 
              'endDate': {
                '$dateFromString': {
                  'dateString': '$startDate', 
                  'format': '%d-%m-%Y %H:%M:%S'
                }
              }, 
              'unit': 'second'
            }
          }, 
          'secondsUntilEndDate': {
            '$dateDiff': {
              'startDate': '$$NOW', 
              'endDate': {
                '$dateFromString': {
                  'dateString': '$endDate', 
                  'format': '%d-%m-%Y %H:%M:%S'
                }
              }, 
              'unit': 'second'
            }
          }
        }
      }
    ]
    
        let result = await this.surveyModel.aggregate(pipe).exec()
    
        if(result[0]) {
            return result[0]
        } else {
            return {}
        }
    }

    /**
     *Create a new survey
     *
     * @param {Survey} survey
     * @return {*}  {Promise<Survey>}
     * @memberof SurveyRepositoryImpl
     */
    create(survey: Survey, uid: string): Promise<Survey> {
        // let [startdatePart, starttimePart] = survey.startDate.split(' ');
        // let [enddatePart, endtimePart] = survey.endDate.split(' ');

        // let [startDay, startMonth, startYear] = startdatePart.split('-');
        // let [startHour, startMinute] = starttimePart.split(':');

        // let [endDay, endMonth, endYear] = enddatePart.split('-');
        // let [endHour, endMinute] = endtimePart.split(':');

        // let today = new Date();

        // let startDate = new Date(Number(startYear), Number(startMonth) - 1, Number(startDay), Number(startHour), Number(startMinute));
        // let endDate = new Date(Number(endYear), Number(endMonth) - 1, Number(endDay), Number(endHour), Number(endMinute));

        // if (today >= startDate && today <= endDate) {
        //     survey.status = 'Active';
        // } else if (today > endDate) {
        //     survey.status = 'Closed';
        // } else {
        //     survey.status = 'Pending';
        // }
        survey.status = 'Active';
        survey.createdBy = uid;
        return this.surveyModel.create(survey);
    }

    /**
     *Update an existing survey
     *
     * @param {UpdateSurveyDto} survey
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof SurveyRepositoryImpl
     */
    update(survey: UpdateSurveyDto): Promise<UpdateWriteOpResult> {
        return this.surveyModel.updateOne({ _id: survey._id }, { $set: survey })
    }

    async incrementAttempt(_id: string): Promise<UpdateWriteOpResult> {
        let survey = await this.surveyModel.findById(_id);
        return this.surveyModel.updateOne({ _id }, { $set: { attempts: (survey.attempts + 1) } })
    }

    /**
     *Delete an existing survey
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof SurveyRepositoryImpl
     */
    delete(_id: string): Promise<any> {
        return this.surveyModel.deleteOne({ _id })
    }

    bulkDelete(ids: string[]): Promise<any> {
        return this.surveyModel.deleteMany({ _id: { $in: ids } });
    }

    /**
     *Get all surveys
     *
     * @return {*}  {Promise<Survey[]>}
     * @memberof SurveyRepositoryImpl
     */
    getAll(): Promise<Survey[]> {
        return this.surveyModel.find({ cloneParentId: null }).populate('type').populate('attendees').populate('createdBy');
    }

}