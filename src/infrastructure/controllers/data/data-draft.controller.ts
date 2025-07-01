import { Controller, Get, Put, Post, Delete, Query, Body, UsePipes, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { DataDraft, UpdateDataDraft } from 'src/domain/data/dto/data-draft.dto';
import { createDataDraftValidator, getValidator, updateDataDraftValidator } from './data.validations';
import { DataDraftService } from 'src/usecase/services/data/data-draft.service';


@Controller('draft')
@ApiTags('Data Draft')
@ApiBearerAuth()
export class DataDraftController {

    constructor(private DataDraftService: DataDraftService) { }


    /**
     *Create a new State
     *
     * @param {DataDraft} data
     * @return {*}  {Promise<GenericResponse<DataDraft>>}
     * @memberof DataDraftController
     */
    @Post('')
    @UsePipes(new JoiValidationPipe(createDataDraftValidator)) //validating the object
    @Secured('DATA_TYPE', 'c')
    public async create(@Body() data: DataDraft): Promise<GenericResponse<DataDraft>> {
        return this.DataDraftService.create(data);
    }


    /**
     *Get all available DataDraft
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<DataDraft[]>>}
     * @memberof DataDraftController
     */
    @Post('/get')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<DataDraft[]>> {
        return this.DataDraftService.getAll(page, offset);
    }


    /**
     *Get specific DataDraft by id
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<DataDraft>>}
     * @memberof DataDraftController
     */
    @Get('/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getOne(@Param('id') _id: string): Promise<GenericResponse<DataDraft>> {
        return this.DataDraftService.getOne(_id);
    }


    /**
     *Update an existing State
     *
     * @param {UpdateDataDraft} updateDataDraft
     * @return {*}  {Promise<GenericResponse<DataDraft>>}
     * @memberof DataDraftController
     */
    @Put('')
    @Secured()
    @UsePipes(new JoiValidationPipe(updateDataDraftValidator)) //validating the object
    public async update(@Body() updateDataDraft: UpdateDataDraft): Promise<GenericResponse<DataDraft>> {
        return this.DataDraftService.update(updateDataDraft);
    }


    /**
     *Delete an existing DataDraft
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof DataDraftController
     */
    @Delete('/')
    @Secured()
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.DataDraftService.delete(id);
    }

}
