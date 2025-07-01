import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { QuestionBankDto, UpdateQuestionBankDto, GenerateQuestionsDto } from 'src/domain/question-bank/dto/question-bank.dto';
import { QuestionBankRepository } from 'src/domain/question-bank/interfaces/question-bank-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { PrintQuestionDTO } from 'src/domain/question-bank/dto/print-questions.dto';


/**
 *QuestionBank Service
 *
 * @export
 * @class QuestionBankService
 */
@Injectable()
export class QuestionBankService {

    /**
     * Creates an instance of QuestionBankService.
     * @param {QuestionBankRepository} QuestionBankRepository
     * @memberof QuestionBankService
     */
    constructor(
        @Inject('QuestionBankRepository') private questionBankRepository: QuestionBankRepository,
    ) { }

    async create(questionBankDto: QuestionBankDto, uid: string): Promise<GenericResponse<QuestionBankDto>> {
        const createdQuestionBank = await this.questionBankRepository.create(questionBankDto, uid);
        return {
            success: true,
            message: 'QuestionBank created successfully.',
            data: createdQuestionBank
        };
    }

    async get(id: string): Promise<GenericResponse<QuestionBankDto>> {
        const questionBank = await this.questionBankRepository.findById(id);
        if (!questionBank) {
            throw new NotFoundException('QuestionBank not found');
        }
        return {
            success: true,
            message: 'QuestionBank retrieved successfully.',
            data: questionBank
        };
    }

    async generateQuestions(id: string, generateQuestionsDto: GenerateQuestionsDto): Promise<GenericResponse<QuestionBankDto>> {
        const createdQuestionBank = await this.questionBankRepository.generateQuestions(id, generateQuestionsDto);
        return {
            success: true,
            message: 'Questions Creted successfully.',
            data: createdQuestionBank
        };
    }

    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const questionBanks = await this.questionBankRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'QuestionBanks retrieved successfully.',
            data: questionBanks
        };
    }

    async getAllQB(tags: string[]): Promise<GenericResponse<any>> {
        const questionBanks = await this.questionBankRepository.findAllQB(tags);
        return {
            success: true,
            message: 'QuestionBanks retrieved successfully.',
            data: questionBanks
        };
    }

    async getAllTopics(page: number, size: number): Promise<GenericResponse<any>> {
        const questionBanks = await this.questionBankRepository.getAllTopics(page, size);
        return {
            success: true,
            message: 'Topics retrieved successfully.',
            data: questionBanks
        };
    }


    async update(id: string, questionBankDto: UpdateQuestionBankDto): Promise<GenericResponse<UpdateQuestionBankDto>> {
        const questionBank = await this.questionBankRepository.findById(id);
        if (!questionBank) {
            throw new NotFoundException('QuestionBank not found');
        }
        const updatedQuestionBank = await this.questionBankRepository.update(id, questionBankDto);
        return {
            success: true,
            message: 'QuestionBank updated successfully.',
            data: null
        };
    }

    async delete(id: string): Promise<GenericResponse<any>> {
        const questionBank = await this.questionBankRepository.findById(id);
        if (!questionBank) {
            throw new NotFoundException('QuestionBank not found');
        }
        const deletedQuestionBank = await this.questionBankRepository.delete(id);
        if (!deletedQuestionBank) {
            throw new NotFoundException('QuestionBank not found');
        }

        return {
            success: true,
            message: 'QuestionBank deleted successfully.',
            data: ''
        };
    }


    async getPrintableQuestions(printPayload: PrintQuestionDTO): Promise<GenericResponse<any>> {
        let data = await this.questionBankRepository.getPrintableData(printPayload);

        const payload: any[] = [];

        printPayload.ministriesWithCount.forEach(e => {
            let questions = data.filter(q => q.serviceDetails?.ministry?._id == e.ministryId);
            if (questions.length > 0) {
                let structuredData = this.getRandomElements(questions, e.count).map(r => {
                    return {
                        name: r.name,
                        description: r.description,
                        serviceId: r.serviceId,
                        ministry: questions[0].serviceDetails?.ministry,
                    }
                });
                payload.push({
                    ministry: questions[0].serviceDetails?.ministry,
                    data: structuredData
                })
            }
        })

        return {
            success: true,
            message: 'QuestionBanks fetched successfully.',
            data: payload
        };
    }

    private getRandomElements(array: any[], numElements: number): any[] {
        if (numElements >= array.length) {
            return array;
        }

        const shuffledArray = array.slice().sort(() => Math.random() - 0.5);
        return shuffledArray.slice(0, numElements);
    }
}
