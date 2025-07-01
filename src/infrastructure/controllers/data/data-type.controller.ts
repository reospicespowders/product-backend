import { Controller, Get, Put, Post, Delete, Query, Body, UsePipes, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { createDataTypeValidator, updateDataTypeValidator } from './data.validations';
import { DataTypeService } from 'src/usecase/services/data/data-type.service';
import { DataType, UpdateDataType } from 'src/domain/data/dto/data-type.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


@Controller('data-type')
@ApiTags('Data Type')
@ApiBearerAuth()
export class DataTypeController {

    constructor(private DataTypeService: DataTypeService) { }


    /**
     *Create a new data type
     *
     * @param {DataType} data
     * @return {*}  {Promise<GenericResponse<DataType>>}
     * @memberof DataTypeController
     */
    @Post('')
    @UsePipes(new JoiValidationPipe(createDataTypeValidator)) //validating the object
    @Secured('DATA_TYPE', 'c')
    public async create(@Body() data: DataType): Promise<GenericResponse<DataType>> {
        return this.DataTypeService.create(data);
    }


    /**
     *Get all available data types
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<DataType[]>>}
     * @memberof DataTypeController
     */
    @Post('/get')
    @Secured()
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<DataType[]>> {
        return this.DataTypeService.getAll(page, offset);
    }


    /**
     *Get specific data type by id
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<DataType>>}
     * @memberof DataTypeController
     */
    @Get('/:id')
    @Secured()
    public async getOne(@Param('id') _id: string): Promise<GenericResponse<DataType>> {
        return this.DataTypeService.getOne(_id);
    }


    /**
     *Update an existing data type
     *
     * @param {UpdateDataType} updateDataType
     * @return {*}  {Promise<GenericResponse<DataType>>}
     * @memberof DataTypeController
     */
    @Put('')
    @Secured('DATA_TYPE', 'u')
    @UsePipes(new JoiValidationPipe(updateDataTypeValidator)) //validating the object
    public async update(@Body() updateDataType: UpdateDataType): Promise<GenericResponse<DataType>> {
        return this.DataTypeService.update(updateDataType);
    }


    /**
     *Delete an existing data type
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof DataTypeController
     */
    @Delete('/:id')
    @Secured('DATA_TYPE', 'd')
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.DataTypeService.delete(id);
    }

}
