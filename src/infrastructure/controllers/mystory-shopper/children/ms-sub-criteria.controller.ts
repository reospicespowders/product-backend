
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSSubCriteria, UpdateMSSubCriteria } from 'src/domain/mystory-shopper/dto/children/ms-sub-criteria.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSSubCriteriaService } from 'src/usecase/services/mystory-shopper/children/ms-sub-criteria.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Sub Criteria controllers
 *
 * @export
 * @class MSSubCriteriaController
 */
@Controller('ms-sub-criteria')
@ApiTags('Mystory Shopper Sub Criteria')
@ApiBearerAuth()
export class MSSubCriteriaController {

    /**
     * Creates an instance of MSSubCriteriaController.
     * @param {MSSubCriteriaService} msSubCriteriaService
     * @memberof MSSubCriteriaController
     */
    constructor(private msSubCriteriaService: MSSubCriteriaService) { }

    /**
     *Create a new sub criteria
     *
     * @param {MSSubCriteria} msSubCriteriaDto
     * @return {*}  {Promise<GenericResponse<MSSubCriteria>>}
     * @memberof MSSubCriteriaController
     */
    @Post('/')
    @Secured()
    async create(@Body() msSubCriteriaDto: MSSubCriteria): Promise<GenericResponse<MSSubCriteria>> {
        return this.msSubCriteriaService.create(msSubCriteriaDto);
    }

    /**
     *Get an existing sub criteria by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSSubCriteriaController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msSubCriteriaService.get(id);
    }

    /**
     *Get all sub criterias  paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof MSSubCriteriaController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msSubCriteriaService.getAll(page, size, tags);
    }

    /**
     *Update an existing sub criteria
     *
     * @param {string} id
     * @param {UpdateMSSubCriteria} msSubCriteriaDto
     * @return {*}  {Promise<GenericResponse<UpdateMSSubCriteria>>}
     * @memberof MSSubCriteriaController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() msSubCriteriaDto: UpdateMSSubCriteria): Promise<GenericResponse<UpdateMSSubCriteria>> {
        return this.msSubCriteriaService.update(id, msSubCriteriaDto);
    }

    /**
     *Delete an existing sub criteria
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSSubCriteria>>}
     * @memberof MSSubCriteriaController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSSubCriteria>> {
        return this.msSubCriteriaService.delete(id);
    }
}
