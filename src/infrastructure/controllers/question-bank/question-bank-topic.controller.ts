
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuestionBankTopicDto, UpdateQuestionBankTopicDto } from 'src/domain/question-bank/dto/question-bank-topic.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { QuestionBankTopicService } from 'src/usecase/services/question-bank/question-bank-topic.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


@Controller('topic')
@ApiTags('Question Bank Topic')
@ApiBearerAuth()
export class QuestionBankTopicController {

    constructor(private questionBankTopicService: QuestionBankTopicService) { }

    @Post()
    @Secured()
    async create(@Body() questionBankTopicDto: QuestionBankTopicDto): Promise<GenericResponse<QuestionBankTopicDto>> {
        return this.questionBankTopicService.create(questionBankTopicDto);
    }

    @Get('id/:id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.questionBankTopicService.get(id);
    }

    @Get('/questionbank/:questionbankId')
    @Secured()
    public async getAll(@Param('questionbankId') questionbankId: string): Promise<GenericResponse<QuestionBankTopicDto[]>> {
        return this.questionBankTopicService.getAll(questionbankId);
    }

    @Put()
    @Secured()
    async update(@Body() questionBankTopicDto: UpdateQuestionBankTopicDto): Promise<GenericResponse<UpdateQuestionBankTopicDto>> {
        return this.questionBankTopicService.update(questionBankTopicDto);
    }

    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<QuestionBankTopicDto>> {
        return this.questionBankTopicService.delete(id);
    }
}
