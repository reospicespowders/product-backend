import mongoose, { Types, Model, UpdateWriteOpResult } from "mongoose";
import { QuestionBankTopicDto } from "../dto/question-bank-topic.dto";
import { QuestionBankTopicRepository } from "../interfaces/question-bank-topic-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, BadRequestException } from "@nestjs/common";


/**
 *Assessment Repository
 *
 * @export
 * @class QuestionBankTopicRepositoryImpl
 * @implements {QuestionBankTopicRepository}
 */
@Injectable()
export class QuestionBankTopicRepositoryImpl implements QuestionBankTopicRepository {

    /**
     * Creates an instance of QuestionBankTopicRepositoryImpl.
     * @param {Model<QuestionBankTopic>} questionBankTopicModel
     * @memberof QuestionBankTopicRepositoryImpl
     */
    constructor(@InjectModel('question-bank-topic') private readonly questionBankTopicModel: Model<QuestionBankTopicDto>) { }

    async create(questionBankTopicDto: QuestionBankTopicDto): Promise<QuestionBankTopicDto> {

        // const existingQuestionBank = await this.questionBankTopicModel.findOne({ name: questionBankTopicDto.name }).exec();
        
        // if (existingQuestionBank) {
        //     throw new BadRequestException('Question Bank Topic with the same name already exists');
        // }

        if (!mongoose.Types.ObjectId.isValid(questionBankTopicDto.questionBankId)) {
            throw new BadRequestException('Invalid Question Bank ObjectId');
        }
        const createdQuestionBank = new this.questionBankTopicModel(questionBankTopicDto);
        return createdQuestionBank.save();
    }

    async findById(id: string): Promise<QuestionBankTopicDto | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.questionBankTopicModel.findById(id).exec();
    }

    async findAll(questionbankId: string): Promise<QuestionBankTopicDto[]> {
        const pipe = [
            {
              "$addFields": {
                "dataId": {
                  "$toInt": "$service"
                }
              }
            },
            {
              "$lookup": {
                "from": "data",
                "localField": "dataId",
                "foreignField": "id",
                "as": "data",
                "pipeline": [
                  {
                    "$graphLookup": {
                      "from": "organization-units",
                      "startWith": "$ous",
                      "connectFromField": "parent",
                      "connectToField": "_id",
                      "depthField": "depth",
                      "as": "breadcrumbs"
                    }
                  },
                  {
                    "$addFields": {
                      "breadcrumbs": {
                        "$map": {
                          "input": "$breadcrumbs",
                          "in": {
                            "_id": "$$this._id",
                            "label": "$$this.name",
                            "id": "$$this.id",
                            "icon": "$$this.image_sq",
                            "depth": "$$this.depth"
                          }
                        }
                      }
                    }
                  },
                  {
                    "$addFields": {
                      "parent": {
                        "$reduce": {
                          "input": "$breadcrumbs",
                          "initialValue": { "depth": 0 },
                          "in": {
                            "$cond": [
                              { "$eq": ["$$this.depth", "$$value.depth"] },
                              "$$this",
                              "$$value"
                            ]
                          }
                        }
                      },
                      "ministry": {
                        "$reduce": {
                          "input": "$breadcrumbs",
                          "initialValue": { "depth": 0 },
                          "in": {
                            "$cond": [
                              { "$gte": ["$$this.depth", "$$value.depth"] },
                              "$$this",
                              "$$value"
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
            },{
                '$lookup': {
                  'from': 'question-banks', 
                  'localField': 'questionBankId', 
                  'foreignField': '_id', 
                  'as': 'questionBank'
                }
            },{
                '$unwind': {
                  'path': '$questionBank', 
                  'preserveNullAndEmptyArrays': false
                }
            },{
              "$match": {
                "questionBankId": new Types.ObjectId(questionbankId),
              }
            }
        ];          
        return this.questionBankTopicModel.aggregate(pipe).exec();
    }

    async update(id: string, questionBankTopicDto: QuestionBankTopicDto): Promise<UpdateWriteOpResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        // const existingQuestionBank = await this.questionBankTopicModel.findOne({ name: questionBankTopicDto.name, _id: { $ne: id } }).exec();
        // if (existingQuestionBank) {
        //     throw new BadRequestException('Question Bank Topic with the same name already exists');
        // }
        if (!mongoose.Types.ObjectId.isValid(questionBankTopicDto.questionBankId)) {
            throw new BadRequestException('Invalid Tag ObjectId');
        }
        return this.questionBankTopicModel.updateOne({ _id: id }, { $set: questionBankTopicDto });
    }

    async delete(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
        return this.questionBankTopicModel.deleteOne({ _id : id });
    }
}