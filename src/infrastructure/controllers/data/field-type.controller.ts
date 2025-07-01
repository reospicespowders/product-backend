import { Controller, Get, Put, Post, Delete, Query, Body, UsePipes, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { createDataFieldTypeValidator, getValidator } from './data.validations';
import { FieldType, UpdateFieldType } from 'src/domain/data/dto/field-type.dto';
import { FieldTypeService } from 'src/usecase/services/data/field-type.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';



/**
 *Data Field Type Controllers
 *
 * @export
 * @class FieldTypeController
 */
@Controller('field-type')
@ApiTags('Field Type')
@ApiBearerAuth()
export class FieldTypeController {


    /**
     * Creates an instance of FieldTypeController.
     * @param {FieldTypeService} FieldTypeService
     * @memberof FieldTypeController
     */
    constructor(private FieldTypeService: FieldTypeService) { }


    /**
     *Create new data field type
     *
     * @param {FieldType} data
     * @return {*}  {Promise<GenericResponse<FieldType>>}
     * @memberof FieldTypeController
     */
    @Post('')
    @Secured('DATA_FIELD_TYPE', 'c')
    @UsePipes(new JoiValidationPipe(createDataFieldTypeValidator)) //validating the object
    public async create(@Body() data: FieldType): Promise<GenericResponse<FieldType>> {
        return this.FieldTypeService.create(data);
    }


    /**
     *get all field types
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<FieldType[]>>}
     * @memberof FieldTypeController
     */
    @Post('/get')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<FieldType[]>> {
        return this.FieldTypeService.getAll(page, offset);
    }



    /**
     *Update an existing data field type
     *
     * @param {UpdateFieldType} updateFieldType
     * @return {*}  {Promise<GenericResponse<FieldType>>}
     * @memberof FieldTypeController
     */
    @Put('')
    @Secured('DATA_FIELD_TYPE', 'u')
    public async update(@Body() updateFieldType: UpdateFieldType): Promise<GenericResponse<FieldType>> {
        return this.FieldTypeService.update(updateFieldType);
    }


    /**
     *Delete an existing data field type
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof FieldTypeController
     */
    @Delete('/:id')
    @Secured('DATA_FIELD_TYPE', 'd')
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.FieldTypeService.delete(id);
    }

}
