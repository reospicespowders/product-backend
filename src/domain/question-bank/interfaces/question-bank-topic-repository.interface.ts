import { UpdateWriteOpResult } from "mongoose";
import { QuestionBankTopicDto, UpdateQuestionBankTopicDto  } from "../dto/question-bank-topic.dto";



export interface QuestionBankTopicRepository {
    create(questionBankTopicDto: QuestionBankTopicDto): Promise<QuestionBankTopicDto>;
    
    findById(id: string): Promise<QuestionBankTopicDto | null>;
   
    findAll(questionbankId: string): Promise<QuestionBankTopicDto[]>;
  
    update(id: string, questionBankTopicDto: UpdateQuestionBankTopicDto): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
}