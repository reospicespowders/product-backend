import { Controller, Get, Put, Post, Delete, Query, Body, UsePipes, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Data, UpdateData } from 'src/domain/data/dto/data.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { DataService } from 'src/usecase/services/data/data.service';
import { activeInactiveValidator, createDateTemplateValidator, getValidator, signDataValidator, updateDataValidator } from './data.validations';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { AdvaneSearchDto } from 'src/domain/organizational-unit/dto/advance-search-dto';
import { DataFromOuAndType } from 'src/domain/data/dto/dataFromOuAndType.dto';




/**
 *Data Controllers
 *
 * @export
 * @class DataController
 */
@Controller('data')
@ApiTags('Data')
@ApiBearerAuth()
export class DataController {

    constructor(private DataService: DataService) { }


    /**
     *Create new data
     *
     * @param {Data} data
     * @return {*}  {Promise<GenericResponse<Data>>}
     * @memberof DataController
     */
    @Post('')
    @Secured('DATA', 'a')
    @UsePipes(new JoiValidationPipe(createDateTemplateValidator)) //validating the object
    public async create(@Body() data: Data): Promise<GenericResponse<Data>> {
        return this.DataService.create(data);
    }

    @Post('advance-search')
    @Secured()
    public async advanceSearch(@Body() query: AdvaneSearchDto, @Req() req: any): Promise<GenericResponse<any>> {
        return this.DataService.advanceSearch(query, req.user.uid);
    }


    /**
     *Get data sequence
     *
     * @return {*}  {Promise<GenericResponse<Data[]>>}
     * @memberof DataController
     */
    @Get('/sequence')
    @Secured('DATA', 'a')
    public async getSequence(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<Data[]>> {
        return this.DataService.getSequence(offset, page);
    }

    /**
     * Use Text Search
     *
     * @param textSearch: String
     * @param ou?: number 
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof DataController
     */
    @Post('/textSearch')
    @Secured()
    public async textSearch(@Query('text') textSearch: string, @Req() req: any, @Body() data: { ous: string[], signedArray?: string[], unsignedArray?: string[] }, @Query('ou') ou?: number): Promise<GenericResponse<any>> {
        // console.log(data.ous);
        if (ou) {
            return this.DataService.textSearch(textSearch, req.user.uid, ou, data.ous, data.signedArray, data.unsignedArray)
        } else {
            return this.DataService.textSearch(textSearch, req.user.uid, null, data.ous, data.signedArray, data.unsignedArray)
        }

    }

    @Get('/one/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getOneEnhanced(@Param('id') id: number): Promise<GenericResponse<any>> {
        return this.DataService.getOneEnhanced(id);
    }


    /**
     *Bulk upload data
     *
     * @param {Array<Data>} data
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof DataController
     */
    @Post('/bulkupload')
    @Secured('DATA_BULK', 'a')
    public async bulkUpload(@Body() data: Array<Data>): Promise<GenericResponse<any>> {
        return this.DataService.bulkUpload(data);
    }

    /**
     * Get data item names from ou and type
     *
     * @param {ou: number, type: string}
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof DataController
     */
    @Post('/dataFromOuType')
    @Secured()
    public async getDataFromOuAndType(@Body() data: DataFromOuAndType): Promise<GenericResponse<any>> {
        return this.DataService.getDataFromOuAndType(data.ou, data.type);
    }

    /**
     * Get data item names from ou and type
     *
     * @param {ou: number}
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof DataController
     */
    @Get('/dataFromOuId')
    @Secured()
    public async getDataFromOuId(@Query('id') ou: number): Promise<GenericResponse<any>> {
        return this.DataService.getDataFromOuId(ou);
    }


    /**
     * Get data item names from ou and type signed filtered
     *
     * @param {ou: number}
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof DataController
     */
    @Post('/dataFromOuId/signed')
    @Secured()
    public async getDataFromOuIdAndSigned(@Query('id') ou: number, @Body() data: { signedArray?: string[], unsignedArray?: string[] }): Promise<GenericResponse<any>> {
        return this.DataService.getDataFromOuId(ou, data.signedArray, data.unsignedArray);
    }


    /**
     *Get Data View
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<Data[]>>}
     * @memberof DataController
     */
    @Get('/data-view')
    @Secured('CONTENT', 'r')
    public async getViewData(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<Data[]>> {
        return this.DataService.getViewData(page, offset);
    }

    /**
     *Get Filtered Data View
     *
     * @param {any} query
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<Data[]>>}
     * @memberof DataController
     */
    @Post('/data-view')
    @Secured()
    public async getFilteredViewData(@Body() query: any, @Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<Data[]>> {
        return this.DataService.getFilteredViewData(query, page, offset);
    }

    @Post('/data-view-export')
    @Secured()
    public async getExportViewData(@Body() query: any, @Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<Data[]>> {
        return this.DataService.getExportViewData(query, page, offset);
    }


    /**
     *Get Content Update Logs
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<Data[]>>}
     * @memberof DataController
     */
    @Get('/view-content-updates')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured('CONTENT_UPDATE_LOGS', 'r')
    public async getContentUpdateView(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<Data[]>> {
        return this.DataService.getContentUpdateView(page, offset);
    }


    @Put('')
    @UsePipes(new JoiValidationPipe(updateDataValidator))
    @Secured()
    public async update(@Body() updateData: UpdateData): Promise<GenericResponse<Data>> {
        return this.DataService.update(updateData);
    }


    @Put('/sign-data')
    @UsePipes(new JoiValidationPipe(signDataValidator))
    @Secured()
    public async signData(@Body() updateData: UpdateData): Promise<GenericResponse<Data>> {
        return this.DataService.signData(updateData);
    }

    @Put('/temp-inactive')
    @UsePipes(new JoiValidationPipe(activeInactiveValidator))
    @Secured()
    public async changeTempActivationStatus(@Body() data: any): Promise<GenericResponse<Data>> {
        return this.DataService.changeTempActivationStatus(data);
    }

    @Get('service-count')
    @UsePipes(new JoiValidationPipe(updateDataValidator))
    @Secured()
    public async serviceCount(): Promise<GenericResponse<Data>> {
        return this.DataService.servieCount();
    }

    @Post('service-count')
    @Secured()
    public async serviceCountPost(@Body() query: any): Promise<GenericResponse<Data>> {
        return this.DataService.servieCountPost(query);
    }

    @Post('ou-clean')
    @Secured()
    public async cleanOu(@Body() query: any): Promise<GenericResponse<Data>> {
        return this.DataService.ouClean(query);
    }

    @Get('/sign-hostory/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getSignHistory(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.DataService.getSignHistory(id);
    }

    @Post('data-states')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async dataStates(@Body() data: any): Promise<GenericResponse<any>> {
        return this.DataService.dataStates(data);
    }

    @Post('update-favorite/:id')
    @Secured()
    public async updateFavorite(@Param('id') id: number , @Req() req: any): Promise<GenericResponse<any>> {
        return this.DataService.updateFavorite(id, req.user.uid);
    }

}
