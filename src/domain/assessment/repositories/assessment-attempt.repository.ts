import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { AssessmentAttempt } from "../dto/assessment-attempt.dto";
import { AssessmentAttemptRepository } from "../interfaces/assessment-attempt-repository.interface";


export class AssessmentAttemptRepositoryImpl implements AssessmentAttemptRepository {

    constructor(@InjectModel('assessment-attempts') private readonly attemptModel: Model<AssessmentAttempt>) { }

    async getById(id: string, email: string): Promise<AssessmentAttempt> { 
        let pipe = [
            {
                '$match': {
                    '$and': [
                        {
                            'email': email
                        }, {
                            'assessmentId': new mongoose.Types.ObjectId(id)
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
        return res.length > 0 ? res[0] : [];
    }

    async getMultipleById(id: string, email: string): Promise<any> { 
        let pipe = [
            {
                '$match': {
                    '$and': [
                        {
                            'email': email
                        }, {
                            'assessmentId': new mongoose.Types.ObjectId(id)
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
                    'assessmentId': new mongoose.Types.ObjectId(id)
                }
            },
            {
                '$lookup': {
                    'from': 'assessments',
                    'localField': 'assessmentId',
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
                    'into': 'assessment-attempts',
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

    save(assessmentAttempt: AssessmentAttempt): Promise<AssessmentAttempt> {
        return this.attemptModel.create(assessmentAttempt);
    }

    update(assessmentId: string, email: string, questions:any): Promise<any> {
        return this.attemptModel.updateOne({ assessmentId, email }, { $set: { questions: questions, isRedoAllow: false } });
    }
 
    async checkIfAttempted(email: string, surveyId: string, isRedo: boolean): Promise<boolean> {
        return (await this.attemptModel.countDocuments({ email, assessmentId: surveyId, isRedoAllow: isRedo })) > 0
    }

    async allowRedoByEmailAndAssessmentId(assessmentId: string, email: string, isRedoAllow: boolean): Promise<any>  {
        return await this.attemptModel.updateMany({ assessmentId, email }, { $set: { isRedoAllow: isRedoAllow } });
    }

    async delete(id: string): Promise<any> {
        return this.attemptModel.deleteOne({ _id: id });
    }

    async deleteByEmail(assessmentId: string, email:string): Promise<any> {
        return this.attemptModel.deleteOne({ assessmentId: assessmentId, email:email });
      }

}