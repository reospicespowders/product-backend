import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { QuestionBankDto, GenerateQuestionsDto } from "../dto/question-bank.dto";
import { QuestionBankRepository } from "../interfaces/question-bank-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrintQuestionDTO } from "../dto/print-questions.dto";


/**
 *Assessment Repository
 *
 * @export
 * @class QuestionBankRepositoryImpl
 * @implements {QuestionBankRepository}
 */
@Injectable()
export class QuestionBankRepositoryImpl implements QuestionBankRepository {

    /**
     * Creates an instance of QuestionBankRepositoryImpl.
     * @param {Model<QuestionBank>} questionBankModel
     * @memberof QuestionBankRepositoryImpl
     */
    constructor(@InjectModel('question-bank') private readonly questionBankModel: Model<QuestionBankDto>) { }



    async getPrintableData(printPayload: PrintQuestionDTO) {
        let tagsMatch = {};

        let ministries = printPayload.ministriesWithCount.map(e => {
            return new mongoose.Types.ObjectId(e.ministryId)
        })

        if (!printPayload.tags.includes("MASTER_TAG")) {
            tagsMatch = {
                'tag.tag': {
                    '$in': [...printPayload.tags]
                }
            }
        }

        let pipe = [
            {
                '$lookup': {
                    'from': 'survey-tags',
                    'localField': 'tag',
                    'foreignField': '_id',
                    'as': 'tag'
                }
            }, {
                '$unwind': {
                    'path': '$tag'
                }
            }, {
                '$match': tagsMatch
            }, {
                '$lookup': {
                    'from': 'question-bank-topics',
                    'localField': '_id',
                    'foreignField': 'questionBankId',
                    'as': 'topics',
                    'pipeline': [
                        {
                            '$match': {
                                'type': 'Service'
                            }
                        }
                    ]
                }
            }, {
                '$unwind': {
                    'path': '$topics'
                }
            }, {
                '$group': {
                    '_id': '$topics._id',
                    'data': {
                        '$addToSet': '$$ROOT'
                    }
                }
            }, {
                '$unwind': {
                    'path': '$data'
                }
            }, {
                '$replaceRoot': {
                    'newRoot': '$data.topics'
                }
            }, {
                '$addFields': {
                    'serviceId': {
                        '$toInt': '$service'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'data',
                    'localField': 'serviceId',
                    'foreignField': 'id',
                    'as': 'serviceDetails',
                    'pipeline': [
                        {
                            '$graphLookup': {
                                'from': 'organization-units',
                                'startWith': '$ous',
                                'connectFromField': 'parent',
                                'connectToField': '_id',
                                'depthField': 'depth',
                                'as': 'allous'
                            }
                        }, {
                            '$addFields': {
                                'allous': {
                                    '$reduce': {
                                        'input': '$allous',
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
                        }, {
                            '$addFields': {
                                'ministry': {
                                    '_id': '$allous._id',
                                    'label': '$allous.name',
                                    'id': '$allous.id',
                                    'icon': '$allous.image_sq',
                                    'depth': '$allous.depth'
                                }
                            }
                        }, {
                            '$unset': [
                                'allous'
                            ]
                        }
                    ]
                }
            }, {
                '$unwind': {
                    'path': '$serviceDetails'
                }
            }, {
                '$match': {
                    'serviceDetails.ministry._id': {
                        '$in': [...ministries]
                    }
                }
            },
        ];

        return this.questionBankModel.aggregate(pipe);
    }


    async create(questionBankDto: QuestionBankDto, uid: string): Promise<QuestionBankDto> {

        // const existingQuestionBank = await this.questionBankModel.findOne({ name: questionBankDto.name }).exec();

        // if (existingQuestionBank) {
        //     throw new BadRequestException('Question bank with the same name already exists');
        // }

        // if (!mongoose.Types.ObjectId.isValid(questionBankDto.tag)) {
        //     throw new BadRequestException('Invalid Tag ObjectId');
        // }
        questionBankDto.createdBy = uid;
        const createdQuestionBank = new this.questionBankModel(questionBankDto);
        return createdQuestionBank.save();
    }

    async findById(id: string): Promise<any> {
        const pipe: any[] =
            [
                {
                    '$match': {
                        'type': 'QB',
                        '_id': new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    '$lookup': {
                        'from': 'assessments',
                        'localField': '_id',
                        'foreignField': 'questionBankId',
                        'as': 'assessments'
                    }
                }, {
                    '$lookup': {
                        'from': 'question-bank-topics',
                        'localField': '_id',
                        'foreignField': 'questionBankId',
                        'as': 'topics',
                        'pipeline': [
                            {
                                '$addFields': {
                                    'dataId': {
                                        '$convert': {
                                            'input': '$service',
                                            'to': 'int'
                                        }
                                    }
                                }
                            }, {
                                '$lookup': {
                                    'from': 'data',
                                    'localField': 'dataId',
                                    'foreignField': 'id',
                                    'as': 'data',
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
                                '$lookup': {
                                    'from': 'question-banks',
                                    'localField': 'topic',
                                    'foreignField': '_id',
                                    'as': 'questionBankTopic'
                                }
                            },
                            {
                                '$sort': {
                                    'createdAt': -1
                                }
                            }
                        ]
                    }
                }, 
                {
                    '$sort': {
                        'createdAt': -1
                    }
                }
            ];
        return await this.questionBankModel.aggregate(pipe).exec();
    }

    async findAll(page: number, size: number, tags: string[]): Promise<any> {
        const skip = (page - 1) * size;
        const pipeCount: any = [
            {
                '$lookup': {
                'from': 'assessments', 
                'localField': '_id', 
                'foreignField': 'questionBankId', 
                'as': 'assessments', 
                'pipeline': [
                    {
                    '$match': {
                        'cloneParentId': null
                    }
                    }, {
                    '$lookup': {
                        'from': 'question-banks', 
                        'localField': 'questionBankId', 
                        'foreignField': '_id', 
                        'as': 'questionBank'
                    }
                    }, {
                    '$unwind': {
                        'path': '$questionBank', 
                        'preserveNullAndEmptyArrays': false
                    }
                    }, {
                    '$lookup': {
                        'from': 'users', 
                        'localField': 'createdBy', 
                        'foreignField': '_id', 
                        'as': 'createdBy'
                    }
                    }, {
                    '$unwind': {
                        'preserveNullAndEmptyArrays': true, 
                        'path': '$createdBy'
                    }
                    }
                ]
                }
            }, {
                '$lookup': {
                'from': 'question-bank-topics', 
                'localField': '_id', 
                'foreignField': 'questionBankId', 
                'as': 'topics', 
                'pipeline': [
                    {
                    '$addFields': {
                        'dataId': {
                        '$convert': {
                            'input': '$service', 
                            'to': 'int'
                        }
                        }
                    }
                    }, {
                    '$lookup': {
                        'from': 'data', 
                        'localField': 'dataId', 
                        'foreignField': 'id', 
                        'as': 'data', 
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
                    '$lookup': {
                        'from': 'question-banks', 
                        'localField': 'topic', 
                        'foreignField': '_id', 
                        'as': 'questionBankTopic'
                    }
                    },
                    {
                        $sort: {
                            createdAt: -1
                        }
                    }
                ]
                }
            }, {
                '$lookup': {
                'from': 'survey-tags', 
                'localField': 'tag', 
                'foreignField': '_id', 
                'as': 'tag'
                }
            }, {
                '$unwind': {
                'path': '$tag', 
                'preserveNullAndEmptyArrays': false
                }
            }, {
                '$lookup': {
                'from': 'users', 
                'localField': 'createdBy', 
                'foreignField': '_id', 
                'as': 'createdBy'
                }
            }, {
                '$unwind': {
                'preserveNullAndEmptyArrays': true, 
                'path': '$createdBy'
                }
            }
        ];

        if (!tags.includes('MASTER_TAG')) {
            pipeCount.push({
                '$match': {
                    'tag.tag': {
                        '$in': tags
                    }
                }
            },)
        }

        if (!tags.includes('GENERAL_QB')) {
            pipeCount.push({
                '$match': {
                    'tag.tag': {
                        '$ne': 'GENERAL_QB'
                    }
                }
            })
        }

        pipeCount.push({
            '$count': 'total'
        })


        // console.log("pipeCount", pipeCount);

        const dataCount = await this.questionBankModel.aggregate(pipeCount).exec();
        const totalCount = dataCount.length > 0 ? dataCount[0].total : 0;
        const pipeData = [
            ...pipeCount.slice(0, -1),
            {
                '$skip': Number(skip)
            },
            {
                '$limit': Number(size)
            }
        ];

        // console.log(pipeData);

        const data = await this.questionBankModel.aggregate(pipeData).exec();

        return { documentCount: totalCount, data };
    }


    async findAllQB(tags: string[]): Promise<any> {
        const pipe: any = [
            {
                '$lookup': {
                'from': 'survey-tags', 
                'localField': 'tag', 
                'foreignField': '_id', 
                'as': 'tag'
                }
            }, {
                '$unwind': {
                'path': '$tag', 
                'preserveNullAndEmptyArrays': false
                }
            }, 
            {
                '$lookup': {
                'from': 'users', 
                'localField': 'createdBy', 
                'foreignField': '_id', 
                'as': 'createdBy'
                }
            }, {
                '$unwind': {
                'preserveNullAndEmptyArrays': true, 
                'path': '$createdBy'
                }
            }
        ];

        if (!tags.includes('MASTER_TAG')) {
            pipe.push({
                '$match': {
                    'tag.tag': {
                        '$in': tags
                    }
                }
            },)
        }

        if (!tags.includes('GENERAL_QB')) {
            pipe.push({
                '$match': {
                    'tag.tag': {
                        '$ne': 'GENERAL_QB'
                    }
                }
            })
        }

        return await this.questionBankModel.aggregate(pipe).exec();
    }

    async getAllTopics(page: number, size: number): Promise<any> {
        const skip = (page - 1) * size;
        return await this.questionBankModel.find({ 'type': "Topic" }).skip(skip).limit(size).exec();
    }

    async update(id: string, questionBankDto: QuestionBankDto): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        // const existingQuestionBank = await this.questionBankModel.findOne({ name: questionBankDto.name, _id: { $ne: id } }).exec();
        // if (existingQuestionBank) {
        //     throw new BadRequestException('Question bank with the same name already exists');
        // }
        return this.questionBankModel.updateOne({ _id: id }, { $set: questionBankDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.questionBankModel.deleteOne({ _id: id });
    }

    async generateQuestions(id: string, generateQuestionsDto: GenerateQuestionsDto): Promise<any> {
        let limit = generateQuestionsDto.limit;
    
        // Ensure the limit is always positive
        if (limit <= 0) {
            throw new Error('The limit must be a positive number.');
        }
    
        let QBIds = generateQuestionsDto.QBs.map(id => new mongoose.Types.ObjectId(id));
        let Service = generateQuestionsDto.Service.map(id => new mongoose.Types.ObjectId(id));
        let numServices = Service.length;
    
        // Base aggregation pipeline
        const pipe: any = [
            {
                '$lookup': {
                    'from': 'question-bank-topics',
                    'localField': '_id',
                    'foreignField': 'questionBankId',
                    'as': 'topic',
                    'pipeline': [
                        {
                            '$addFields': {
                                'serviceId': {
                                    '$toInt': '$service'
                                }
                            }
                        },
                        {
                            '$lookup': {
                                'from': 'data',
                                'localField': 'serviceId',
                                'foreignField': 'id',
                                'as': 'ous',
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
                                    },
                                    {
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
                                    },
                                    {
                                        '$unwind': {
                                            'path': '$breadcrumbs',
                                            'preserveNullAndEmptyArrays': true
                                        }
                                    },
                                    {
                                        '$replaceRoot': {
                                            'newRoot': '$breadcrumbs'
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                '$unwind': {
                    'path': '$topic',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$unwind': {
                    'path': '$topic.questions',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$addFields': {
                    'question': '$topic.questions'
                }
            },
            {
                '$unset': 'topic.questions'
            }
        ];

        if (generateQuestionsDto.Types.length > 0) {
            pipe.push({
                '$match': {
                    'questions.type': {
                        '$in': generateQuestionsDto.Types
                    }
                }
            });
        }
    
        if (QBIds.length > 0) {
            pipe.push({
                '$match': {
                    'topic._id': {
                        '$in': QBIds
                    }
                }
            });
        }
    
        if (generateQuestionsDto.Levels.length > 0) {
            pipe.push({
                '$match': {
                    'questions.meta.difficultyLevel': {
                        '$in': generateQuestionsDto.Levels
                    }
                }
            });
        }
    
        // If there are services provided, add the $facet stage
        if (numServices > 0) {
            let baseLimit = Math.floor(limit / numServices);
            let remainder = limit % numServices;
    
            pipe.push(
                {
                    '$facet': {
                        ...Service.reduce((facets, serviceId, index) => {
                            facets[`service_${index}`] = [
                                {
                                    '$match': {
                                        'topic.ous._id': serviceId
                                    }
                                },
                                {
                                    '$limit': baseLimit + (remainder > index ? 1 : 0) // Add 1 if index is within the remainder count
                                }
                            ];
                            return facets;
                        }, {})
                    }
                },
                {
                    '$project': {
                        'questions': {
                            '$reduce': {
                                'input': { '$objectToArray': '$$ROOT' },
                                'initialValue': [],
                                'in': { '$concatArrays': ['$$value', '$$this.v'] }
                            }
                        }
                    }
                },
                {
                    '$unwind': {
                        'path': '$questions',
                        'preserveNullAndEmptyArrays': true
                    }
                }
            );
        } else {
            // If no services are provided, simply limit the number of questions
            pipe.push({
                '$limit': limit
            });
        }
    
        
    
        return await this.questionBankModel.aggregate(pipe).exec();
    }
}    