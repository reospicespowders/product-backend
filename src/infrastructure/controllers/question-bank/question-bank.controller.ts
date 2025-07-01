
import { Body, Controller, Delete, Get, Param, Post, Put, Req, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuestionBankDto, UpdateQuestionBankDto, GenerateQuestionsDto } from 'src/domain/question-bank/dto/question-bank.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { QuestionBankService } from 'src/usecase/services/question-bank/question-bank.service';
import { PrintQuestionDTO } from 'src/domain/question-bank/dto/print-questions.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


@Controller('question-bank')
@ApiTags('Question Bank')
@ApiBearerAuth()
export class QuestionBankController {

    constructor(private questionBankService: QuestionBankService) { }


    @Post('/')
    @Secured()
    async create(@Body() questionBankDto: QuestionBankDto, @Req() req:any): Promise<GenericResponse<QuestionBankDto>> {
        return this.questionBankService.create(questionBankDto, req.user.uid);
    }

    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.questionBankService.get(id);
    }

    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.questionBankService.getAll(page, size, tags);
    }

    @Post('/getAll/:tags')
    @Secured()
    public async getAllQB(@Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.questionBankService.getAllQB(tags);
    }

    @Post('generate-questions/:id')
    @Secured()
    async generateQuestions(@Param('id') id: string, @Body() generateQuestionsDto: GenerateQuestionsDto): Promise<GenericResponse<QuestionBankDto>> {
        return this.questionBankService.generateQuestions(id, generateQuestionsDto);
    }

    @Get('get-topics/:page/:size/:type')
    @Secured()
    public async getAllTopics(@Param('page') page: number = 1, @Param('size') size: number = 10, @Param('type') type: string = 'Topic') {
        return this.questionBankService.getAllTopics(page, size);
    }

    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() questionBankDto: UpdateQuestionBankDto): Promise<GenericResponse<UpdateQuestionBankDto>> {
        return this.questionBankService.update(id, questionBankDto);
    }

    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<QuestionBankDto>> {
        return this.questionBankService.delete(id);
    }


    @Post('printable')
    @Secured()
    public async getPrintableQuestions(@Body() printPayload: PrintQuestionDTO): Promise<GenericResponse<any>> {
        return this.questionBankService.getPrintableQuestions(printPayload);
    }

}
