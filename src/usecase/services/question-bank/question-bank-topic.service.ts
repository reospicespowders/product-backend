import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { QuestionBankTopicDto, UpdateQuestionBankTopicDto } from 'src/domain/question-bank/dto/question-bank-topic.dto';
import { QuestionBankTopicRepository } from 'src/domain/question-bank/interfaces/question-bank-topic-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { UpdateWriteOpResult } from 'mongoose';


/**
 *QuestionBankTopic Service
 *
 * @export
 * @class QuestionBankTopicTopicService
 */
@Injectable()
export class QuestionBankTopicService {

    /**
     * Creates an instance of QuestionBankTopicService.
     * @param {QuestionBankTopicRepository} QuestionBankTopicRepository
     * @memberof QuestionBankTopicService
     */
    constructor(
        @Inject('QuestionBankTopicRepository') private questionBankRepository: QuestionBankTopicRepository,
    ) { }
    
    async create(questionBankTopicDto: QuestionBankTopicDto): Promise<GenericResponse<QuestionBankTopicDto>> {
        const createdQuestionBankTopic = await this.questionBankRepository.create(questionBankTopicDto);
        return {
            success: true,
            message: 'QuestionBankTopic created successfully.', 
            data: createdQuestionBankTopic 
        };
    }

    async get(id: string): Promise<GenericResponse<QuestionBankTopicDto>> {
        const questionBankTopic = await this.questionBankRepository.findById(id);
        if (!questionBankTopic) {
            throw new NotFoundException('QuestionBank not found');
        }
        return {
            success: true,
            message: 'QuestionBank retrieved successfully.', 
            data: questionBankTopic 
        };
    }

    async getAll(questionbankId: string): Promise<GenericResponse<QuestionBankTopicDto[]>> {
        const questionBankTopics = await this.questionBankRepository.findAll(questionbankId);
        return { 
            success: true,
            message: 'QuestionBanks retrieved successfully.', 
            data: questionBankTopics 
        };
    }

    async update(questionBankTopicDto: UpdateQuestionBankTopicDto): Promise<GenericResponse<UpdateQuestionBankTopicDto>> {
        let id = questionBankTopicDto._id;
        const updatedQuestionBank:UpdateWriteOpResult = await this.questionBankRepository.update(id, questionBankTopicDto);
        if (updatedQuestionBank.modifiedCount != 1) {
            return { 
                success: true,
                message: 'Failed to update question bank', 
                data: null 
            };
        }
        return { 
            success: true,
            message: 'QuestionBank updated successfully.', 
            data: null 
        };;
    }

    async delete(id: string): Promise<GenericResponse<any>> {
        const questionBankTopic = await this.questionBankRepository.findById(id);
        if (!questionBankTopic) {
            throw new NotFoundException('QuestionBankTopic not found');
        }
        const deletedQuestionBankTopic = await this.questionBankRepository.delete(id);
        if (!deletedQuestionBankTopic) {
            throw new NotFoundException('QuestionBankTopic not found');
        }

        return { 
            success: true,
            message: 'QuestionBankTopic deleted successfully.',
            data: ''
         };
    }
}
