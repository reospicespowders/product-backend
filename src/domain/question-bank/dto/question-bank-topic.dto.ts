import { IntersectionType } from "@nestjs/swagger";
import { Question, UpdateQuestionDto } from "src/domain/survey/dto/survey.dto";




export class QuestionBankTopicDto {
    questionBankId:string;
    name: string;
    description: string;
    service: any;
    type:string
    questions?: Array<Question>;
}

export class UpdateQuestionBankTopicDto extends IntersectionType(QuestionBankTopicDto) {
    _id: string;
    questions?: UpdateQuestionDto[];
}