
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSStep, UpdateMSStep } from 'src/domain/mystory-shopper/dto/ms-step.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSStepService } from 'src/usecase/services/mystory-shopper/ms-step.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Steps Controllers
 *
 * @export
 * @class MSStepController
 */
@Controller('ms-step')
@ApiTags('Mystory Shopper Step')
@ApiBearerAuth()
export class MSStepController {

    /**
     * Creates an instance of MSStepController.
     * @param {MSStepService} msStepService
     * @memberof MSStepController
     */
    constructor(private msStepService: MSStepService) { }

    /**
     *Create a new step
     *
     * @param {MSStep} msStepDto
     * @return {*}  {Promise<GenericResponse<MSStep>>}
     * @memberof MSStepController
     */
    @Post('/')
    @Secured()
    async create(@Body() msStepDto: MSStep): Promise<GenericResponse<MSStep>> {
        return this.msStepService.create(msStepDto);
    }

    /**
     *Get an existing step by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSStepController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msStepService.get(id);
    }

    @Get('/project/:id/:type/:vendorType')
    @Secured()
    async getByProject(@Param('id') id: string,@Param('type') type: string,@Param('vendorType') vendorType: string): Promise<any> {
        return this.msStepService.getByProject(id,type,vendorType);
    }

    @Get('/session/:id/:sessionId/:type/:vendorType')
    @Secured()
    async getByProjectSession(@Param('id') id: string,@Param('sessionId') sessionId: string,@Param('type') type: string,@Param('vendorType') vendorType: string): Promise<any> {
        return this.msStepService.getByProjectSession(id,sessionId,type,vendorType);
    }

    @Get('/project/:id')
    @Secured()
    async getAllByProject(@Param('id') id: string,): Promise<any> {
        return this.msStepService.getAllByProject(id);
    }

    /**
     *Get all steps paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof MSStepController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msStepService.getAll(page, size, tags);
    }

    /**
     *Update an existing step
     *
     * @param {string} id
     * @param {UpdateMSStep} msStepDto
     * @return {*}  {Promise<GenericResponse<UpdateMSStep>>}
     * @memberof MSStepController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() msStepDto: UpdateMSStep): Promise<GenericResponse<UpdateMSStep>> {
        return this.msStepService.update(id, msStepDto);
    }

    /**
     *Delete an existing step by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSStep>>}
     * @memberof MSStepController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSStep>> {
        return this.msStepService.delete(id);
    }
}
