
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSEvaluation, UpdateMSEvaluation } from 'src/domain/mystory-shopper/dto/ms-evaluation.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSEvaluationService } from 'src/usecase/services/mystory-shopper/ms-evaluation.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Evaluation Controllers
 *
 * @export
 * @class MSEvaluationController
 */
@Controller('ms-evaluation')
@ApiTags('Mystory Shopper Evaluation')
@ApiBearerAuth()
export class MSEvaluationController {

    /**
     * Creates an instance of MSEvaluationController.
     * @param {MSEvaluationService} msEvaluationService
     * @memberof MSEvaluationController
     */
    constructor(private msEvaluationService: MSEvaluationService) { }

    /**
     *Create a new evaluation
     *
     * @param {MSEvaluation} msEvaluationDto
     * @return {*}  {Promise<GenericResponse<MSEvaluation>>}
     * @memberof MSEvaluationController
     */
    @Post('/')
    @Secured()
    async create(@Body() msEvaluationDto: MSEvaluation): Promise<GenericResponse<MSEvaluation>> {
        return this.msEvaluationService.create(msEvaluationDto);
    }

    /**
     *Get an existing evaluation by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSEvaluationController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msEvaluationService.get(id);
    }

    /**
     *Get all evaluations paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof MSEvaluationController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msEvaluationService.getAll(page, size, tags);
    }

    /**
     *Get all evaluations project wise
     *
     * @param {string} projectId
     * @return {*} 
     * @memberof MSEvaluationController
     */
    @Get('project/:projectId')
    @Secured()
    public async getByProjectId(@Param('projectId') projectId: string) {
        return this.msEvaluationService.getByProject(projectId);
    }

    /**
     *Update an existing evaluation
     *
     * @param {string} id
     * @param {UpdateMSEvaluation} msEvaluationDto
     * @return {*}  {Promise<GenericResponse<UpdateMSEvaluation>>}
     * @memberof MSEvaluationController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() msEvaluationDto: UpdateMSEvaluation): Promise<GenericResponse<UpdateMSEvaluation>> {
        return this.msEvaluationService.update(id, msEvaluationDto);
    }

    /**
     *Delete an existing evaluation
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSEvaluation>>}
     * @memberof MSEvaluationController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSEvaluation>> {
        return this.msEvaluationService.delete(id);
    }

    @Get('/factor-view/:projectId')
    @Secured()
    public async getFactorView(@Param('projectId') projectId: string, @Query('isJunior') isJunior: string, @Req() req: any): Promise<GenericResponse<any>> {
        return this.msEvaluationService.getFactorView(projectId, isJunior === 'true' ? req.user.uid : null);
    }
}
