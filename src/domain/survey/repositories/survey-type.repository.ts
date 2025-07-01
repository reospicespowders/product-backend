import { Model, UpdateWriteOpResult } from "mongoose";
import { SurveyTag, SurveyType, UpdateSurveyTagDto, UpdateSurveyTypeDto } from "../dto/survey-type.dto";
import { SurveyTypeRepository } from "../interfaces/survey-type-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Inject, Injectable } from "@nestjs/common";
import { SurveyRepository } from "../interfaces/survey-repository.interface";


/**
 *Survey Type Repository
 *
 * @export
 * @class SurveyTypeRepositoryImpl
 * @implements {SurveyTypeRepository}
 */
@Injectable()
export class SurveyTypeRepositoryImpl implements SurveyTypeRepository {


    /**
     * Creates an instance of SurveyTypeRepositoryImpl.
     * @param {Model<SurveyType>} surveyTypeModel
     * @memberof SurveyTypeRepositoryImpl
     */
    constructor(
        @InjectModel('survey-type') private readonly surveyTypeModel: Model<SurveyType>,
        @Inject('SurveyRepository') private surveyRepository: SurveyRepository,
        @InjectModel('survey-tags') private readonly tagModel: Model<SurveyTag>
    ) { }


    async createSurveyTag(tag: SurveyTag): Promise<SurveyTag> {
        let count = await this.tagModel.countDocuments()
        tag.tag = `TAG_${count}`
        return this.tagModel.create(tag);
    }

    deleteSurveyTag(_id: string): Promise<any> {
        return this.tagModel.deleteOne({ _id })
    }


    async getSurveyTags(type: string): Promise<SurveyTag[]> {

        if (type != 'ASSESSMENT') {
            return this.tagModel.find({ type });
        }
        else {
            const pipe: any =
                [
                    {
                        "$lookup": {
                            "from": "question-banks",
                            "localField": "_id",
                            "foreignField": "tag",
                            "as": "questionbanks"
                        }
                    },
                    {
                        "$match": {
                            "type": "ASSESSMENT"
                        }
                    },
                    {
                        "$addFields": {
                            "questionbank_names": {
                                "$reduce": {
                                    "input": "$questionbanks",
                                    "initialValue": "",
                                    "in": {
                                        "$concat": [
                                            "$$value",
                                            {
                                                "$cond": [
                                                    {
                                                        "$eq": [
                                                            "$$value",
                                                            ""
                                                        ]
                                                    },
                                                    "",
                                                    ", "
                                                ]
                                            },
                                            "$$this.name"
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ];

            return await this.tagModel.aggregate(pipe).exec();
        }
    }


    updateSurveyTag(updateTagDto: UpdateSurveyTagDto): Promise<UpdateWriteOpResult> {
        return this.tagModel.updateOne({ _id: updateTagDto._id }, { $set: { arabic: updateTagDto.arabic } })
    }

    async getAllCategorized(tags: string[]) {
        let pipe: any = [
            {
                '$lookup': {
                'from': 'surveys', 
                'localField': '_id', 
                'foreignField': 'type', 
                'as': 'surveys', 
                'pipeline': [
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
                    }, {
                    '$sort': {
                        'createdAt': -1
                    }
                    }, {
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
                        '$ifNull': [
                            {
                            '$first': '$attempts.count'
                            }, 0
                        ]
                        }
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
                'as': 'createdBy', 
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
                '$unwind': {
                'path': '$createdBy', 
                'preserveNullAndEmptyArrays': true
                }
            }
        ]
       
        if (!tags.includes('MASTER_TAG')) {
            pipe.push({
                '$match': {
                    'tag.tag': {
                        $in: tags
                    }
                }
            })
        }
        return this.surveyTypeModel.aggregate(pipe);
    }



    /**
     *Create a new survey type
     *
     * @param {SurveyType} surveyType
     * @return {*}  {Promise<SurveyType>}
     * @memberof SurveyTypeRepositoryImpl
     */
    create(surveyType: SurveyType, uid: string): Promise<SurveyType> {
        surveyType.createdBy = uid;
        return this.surveyTypeModel.create(surveyType)
    }


    /**
     *Update an existing survey type
     *
     * @param {UpdateSurveyTypeDto} surveyType
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof SurveyTypeRepositoryImpl
     */
    update(surveyType: UpdateSurveyTypeDto): Promise<UpdateWriteOpResult> {
        let _id = surveyType._id;
        delete surveyType._id;
        return this.surveyTypeModel.updateOne({ _id }, { $set: surveyType })
    }


    /**
     *Delete an existing survey type
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof SurveyTypeRepositoryImpl
     */
    async delete(_id: string): Promise<any> {
        this.surveyRepository.deleteByType(_id);
        return this.surveyTypeModel.deleteOne({ _id });
    }

    getById(_id: string): Promise<SurveyType> {
        return this.surveyTypeModel.findById(_id);
    }

    async getAll() {
        return this.surveyTypeModel.find()
    }

    /**
     *Get all survey types
     *
     * @return {*}  {Promise<SurveyType[]>}
     * @memberof SurveyTypeRepositoryImpl
     */
    getAllTagged(tags: string[]): Promise<SurveyType[]> {
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
                    'path': '$tag',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$match': {
                    'tag.tag': {
                        '$in': tags
                    }
                }
            }
        ];
        return this.surveyTypeModel.aggregate(pipe);
    }

}