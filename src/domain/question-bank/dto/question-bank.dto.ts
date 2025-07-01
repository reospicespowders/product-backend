import { IntersectionType } from "@nestjs/swagger";
import { User } from "src/domain/user-auth/dto/user-type..dto";




export class QuestionBankDto {
    name: string;
    tag: string;
    active?: boolean;
    type:string
    createdBy: User | string
}

export class UpdateQuestionBankDto extends IntersectionType(QuestionBankDto) {
    _id: string;
}

export class GenerateQuestionsDto {
    QBs: string[];
    Types: string[];
    Levels: string[];
    Service: string[];
    limit: number;
}