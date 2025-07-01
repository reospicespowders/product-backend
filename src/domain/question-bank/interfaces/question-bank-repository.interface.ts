import { UpdateWriteOpResult } from "mongoose";
import { QuestionBankDto, UpdateQuestionBankDto, GenerateQuestionsDto } from "../dto/question-bank.dto";
import { PrintQuestionDTO } from "../dto/print-questions.dto";



export interface QuestionBankRepository {
    create(questionBankDto: QuestionBankDto, uid: string): Promise<QuestionBankDto>;

    findById(id: string): Promise<QuestionBankDto | null>;

    findAll(page: number, size: number, tags: string[]): Promise<QuestionBankDto[]>;
    
    findAllQB(tags: string[]): Promise<QuestionBankDto[]>;

    getAllTopics(page: number, size: number): Promise<QuestionBankDto[]>;

    update(id: string, questionBankDto: UpdateQuestionBankDto): Promise<UpdateWriteOpResult>;

    delete(id: string): Promise<UpdateWriteOpResult | null>;

    generateQuestions(id: string, generateQuestionsDto: GenerateQuestionsDto): Promise<QuestionBankDto>;

    getPrintableData(printPayload: PrintQuestionDTO): Promise<any[]>
}