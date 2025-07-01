import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Program, UpdateProgram } from 'src/domain/course/dto/program.dto';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { ProgramService } from 'src/usecase/services/course/program.service';
import { getValidator } from '../data/data.validations';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';

@Controller('program')
@ApiTags('Program')
@ApiBearerAuth()
export class ProgramController {

    constructor(private ProgramService: ProgramService) { }

    /**
     *
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @return {*} 
     * @memberof ProgramController
     */
    @Get('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10) {
        return this.ProgramService.getAll(page,size);
    }

    /**
     *
     *
     * @param {Program} Program
     * @return {*} 
     * @memberof ProgramController
     */
    @Post('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async create(@Body() Program: Program) {
        return this.ProgramService.create(Program);
    }

    /**
     *
     *
     * @param {UpdateProgram} Program
     * @return {*} 
     * @memberof ProgramController
     */
    @Put('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async update(@Body() Program: UpdateProgram) {
        return this.ProgramService.update(Program);
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*} 
     * @memberof ProgramController
     */
    @Delete('/:id')
    @Secured()
    public async delete(@Param('id') _id: string) {
        return this.ProgramService.delete(_id);
    }
}
