
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSMeasuringType, UpdateMSMeasuringType } from 'src/domain/mystory-shopper/dto/children/ms-measuring-types.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSMeasuringTypeService } from 'src/usecase/services/mystory-shopper/children/ms-measuring-type.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Myasuring Type Controllers
 *
 * @export
 * @class MSMeasuringTypeController
 */
@Controller('ms-criteria')
@ApiTags('Mystory Shopper Criteria')
@ApiBearerAuth()
export class MSMeasuringTypeController {

    /**
     * Creates an instance of MSMeasuringTypeController.
     * @param {MSMeasuringTypeService} msMeasuringTypeService
     * @memberof MSMeasuringTypeController
     */
    constructor(private msMeasuringTypeService: MSMeasuringTypeService) { }

    /**
     *Create a new measuring type
     *
     * @param {MSMeasuringType} msMeasuringTypeDto
     * @return {*}  {Promise<GenericResponse<MSMeasuringType>>}
     * @memberof MSMeasuringTypeController
     */
    @Post('/')
    @Secured()
    async create(@Body() msMeasuringTypeDto: MSMeasuringType): Promise<GenericResponse<MSMeasuringType>> {
        return this.msMeasuringTypeService.create(msMeasuringTypeDto);
    }

    /**
     *Get an existing measuring type by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSMeasuringTypeController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msMeasuringTypeService.get(id);
    }

    /**
     *Get all measuring types paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof MSMeasuringTypeController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msMeasuringTypeService.getAll(page, size, tags);
    }

    /**
     *Update an existing measuring type
     *
     * @param {string} id
     * @param {UpdateMSMeasuringType} msMeasuringTypeDto
     * @return {*}  {Promise<GenericResponse<UpdateMSMeasuringType>>}
     * @memberof MSMeasuringTypeController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() msMeasuringTypeDto: UpdateMSMeasuringType): Promise<GenericResponse<UpdateMSMeasuringType>> {
        return this.msMeasuringTypeService.update(id, msMeasuringTypeDto);
    }

    /**
     *Delete an existing measuring type by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSMeasuringType>>}
     * @memberof MSMeasuringTypeController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSMeasuringType>> {
        return this.msMeasuringTypeService.delete(id);
    }
}
