import { Controller, Get, Put, Post, Delete, Query, Body, UsePipes, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { DataTemplateService } from 'src/usecase/services/data/data.template.service';
import { createDateTemplateValidator, dateTemplateFilterValidator, getValidator, updateDataTemplateValidator } from './data.validations';
import { DataTemplate, UpdateDataTemplate } from 'src/domain/data/dto/data-templates.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';

// #253 Service card Template

@Controller('data-template')
@ApiTags('Data Template')
@ApiBearerAuth()
export class DataTemplateController {

    constructor(private DataTemplateService: DataTemplateService) { }


    /**
     *Create new data template
     *
     * @param {DataTemplate} data
     * @return {*}  {Promise<GenericResponse<DataTemplate>>}
     * @memberof DataTemplateController
     */
    @Post('')
    @UsePipes(new JoiValidationPipe(createDateTemplateValidator)) //validating the object
    @Secured('DATA_TEMPLATE', 'c')
    public async create(@Body() data: DataTemplate): Promise<GenericResponse<DataTemplate>> {
        return this.DataTemplateService.create(data);
    }


    /**
     *Get all data templates
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<DataTemplate[]>>}
     * @memberof DataTemplateController
     */
    @Post('/get')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<DataTemplate[]>> {
        return this.DataTemplateService.getAll(page, offset);
    }

    /**
     *Get populated data templates by filter
     *
     * @param {DataTemplate} filter
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<DataTemplate[]>>}
     * @memberof DataTemplateController
     */
    @Post('/get/populated')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getPopulatedData(
        @Body() filter: DataTemplate,
        @Query('offset') offset: number, @Query('page') page: number
    ): Promise<GenericResponse<DataTemplate[]>> {
        return this.DataTemplateService.getPopulatedData(filter, page, offset);
    }



    /**
     *Get all data templates populated by filter
     *
     * @param {DataTemplate} filter
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<DataTemplate[]>>}
     * @memberof DataTemplateController
     */
    @Post('/get/data')
    @Secured()
    public async getAllDataTemplatesDataCreation(
        @Body() filter: DataTemplate,
        @Query('offset') offset: number, @Query('page') page: number
    ): Promise<GenericResponse<DataTemplate[]>> {
        return this.DataTemplateService.getAllDataTemplatesDataCreation(filter, page, offset);
    }



    /**
     *Get a specific data template by id
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<DataTemplate>>}
     * @memberof DataTemplateController
     */
    @Get('/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getOne(@Param('id') _id: string): Promise<GenericResponse<DataTemplate>> {
        return this.DataTemplateService.getOne(_id);
    }


    /**
     *Update an existing data template
     *
     * @param {UpdateDataTemplate} updateDataTemplate
     * @return {*}  {Promise<GenericResponse<DataTemplate>>}
     * @memberof DataTemplateController
     */
    @Put('')
    @UsePipes(new JoiValidationPipe(updateDataTemplateValidator)) //validating the object
    @Secured('DATA_TEMPLATE', 'u')
    public async update(@Body() updateDataTemplate: UpdateDataTemplate): Promise<GenericResponse<DataTemplate>> {
        return this.DataTemplateService.update(updateDataTemplate);
    }


    /**
     *Delete an existing data template
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof DataTemplateController
     */
    @Delete('/:id')
    @Secured('DATA_TEMPLATE', 'd')
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.DataTemplateService.delete(id);
    }

}
