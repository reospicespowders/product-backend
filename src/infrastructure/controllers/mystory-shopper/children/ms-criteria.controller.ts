
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSCriteria, UpdateMSCriteria } from 'src/domain/mystory-shopper/dto/children/ms-criteria.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSCriteriaService } from 'src/usecase/services/mystory-shopper/children/ms-criteria.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Criteria Controllers
 *
 * @export
 * @class MSCriteriaController
 */
@Controller('ms-criteria')
@ApiTags('Mystory Shopper Criteria')
@ApiBearerAuth()
export class MSCriteriaController {

    /**
     * Creates an instance of MSCriteriaController.
     * @param {MSCriteriaService} msCriteriaService
     * @memberof MSCriteriaController
     */
    constructor(private msCriteriaService: MSCriteriaService) { }

    /**
     *Create a new Criteria
     *
     * @param {MSCriteria} msCriteriaDto
     * @return {*}  {Promise<GenericResponse<MSCriteria>>}
     * @memberof MSCriteriaController
     */
    @Post('/')
    @Secured()
    async create(@Body() msCriteriaDto: MSCriteria): Promise<GenericResponse<MSCriteria>> {
        return this.msCriteriaService.create(msCriteriaDto);
    }

    /**
     *Get an existing criteria by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSCriteriaController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msCriteriaService.get(id);
    }

    /**
     *Get all criterias paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof MSCriteriaController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msCriteriaService.getAll(page, size, tags);
    }

    /**
     *Get all criterias by project id
     *
     * @param {string} projectId
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @return {*} 
     * @memberof MSCriteriaController
     */
    @Get('project/:projectId/:page/:size')
    @Secured()
    public async getByProjectId(@Param('projectId') projectId: string, @Param('page') page: number = 1, @Param('size') size: number = 10) {
        return this.msCriteriaService.getByProjectId(projectId, page, size);
    }

    /**
     *Update an existing criteria
     *
     * @param {UpdateMSCriteria} msCriteriaDto
     * @return {*}  {Promise<GenericResponse<UpdateMSCriteria>>}
     * @memberof MSCriteriaController
     */
    @Put()
    @Secured()
    async update(@Body() msCriteriaDto: UpdateMSCriteria): Promise<GenericResponse<UpdateMSCriteria>> {
        return this.msCriteriaService.update(msCriteriaDto._id, msCriteriaDto);
    }

    /**
     *Delete en existing criteria
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSCriteria>>}
     * @memberof MSCriteriaController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSCriteria>> {
        return this.msCriteriaService.delete(id);
    }
}
