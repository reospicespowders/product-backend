import { Controller, Get, Put, Post, Delete, Query, Body, UsePipes, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { DataFieldService } from 'src/usecase/services/data/data-fields.service';
import { createDataFiledValidator, getValidator, updateDataFieldValidator } from './data.validations';
import { DataField, UpdateDataField } from 'src/domain/data/dto/data-fields.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Data Field Controllers
 *
 * @export
 * @class DataFieldController
 */
@Controller('data-fields')
@ApiTags('Data Fields')
@ApiBearerAuth()
export class DataFieldController {


    /**
     * Creates an instance of DataFieldController.
     * @param {DataFieldService} dataFieldService
     * @memberof DataFieldController
     */
    constructor(private dataFieldService: DataFieldService) { }


    /**
     *Create a new data field
     *
     * @param {DataField} data
     * @return {*}  {Promise<GenericResponse<DataField>>}
     * @memberof DataFieldController
     */
    @Post('')
    @UsePipes(new JoiValidationPipe(createDataFiledValidator)) //validating the object
    @Secured('DATA_FIELD', 'c')
    public async create(@Body() data: DataField): Promise<GenericResponse<DataField>> {
        return this.dataFieldService.create(data);
    }


    /**
     *Get all data fields
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<DataField[]>>}
     * @memberof DataFieldController
     */
    @Post('/get')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<DataField[]>> {
        return this.dataFieldService.getAll(page, offset);
    }


    /**
     *Get specifig data field by id
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<DataField>>}
     * @memberof DataFieldController
     */
    @Get('/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getOne(@Param('id') _id: string): Promise<GenericResponse<DataField>> {
        return this.dataFieldService.getOne(_id);
    }

    @Get('/type/with-type')
    @Secured()
    public async getFieldsWithType(): Promise<GenericResponse<DataField[]>> {
        return this.dataFieldService.getFieldsWithType();
    }


    /**
     *Update an existing data field
     *
     * @param {UpdateDataField} updateDataField
     * @return {*}  {Promise<GenericResponse<DataField>>}
     * @memberof DataFieldController
     */
    @Put('')
    @UsePipes(new JoiValidationPipe(updateDataFieldValidator)) //validating the object
    @Secured('DATA_FIELD', 'u')
    public async update(@Body() updateDataField: UpdateDataField): Promise<GenericResponse<DataField>> {
        return this.dataFieldService.update(updateDataField);
    }


    /**
     *Delete an existing data field
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof DataFieldController
     */
    @Delete('/:id')
    @Secured('DATA_FIELD', 'd')
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.dataFieldService.delete(id);
    }

}
