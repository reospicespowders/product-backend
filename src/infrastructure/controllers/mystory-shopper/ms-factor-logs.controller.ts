
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSFactorLogs, UpdateMSFactorLogs } from 'src/domain/mystory-shopper/dto/ms-factor-logs.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSFactorLogsService } from 'src/usecase/services/mystory-shopper/ms-factor-logs.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Factor Logs Controllers
 *
 * @export
 * @class MSFactorLogsController
 */
@Controller('ms-factor-logs')
@ApiTags('Mystory Shopper Factor Logs')
@ApiBearerAuth()
export class MSFactorLogsController {

    /**
     * Creates an instance of MSFactorLogsController.
     * @param {MSFactorLogsService} msFactorLogsService
     * @memberof MSFactorLogsController
     */
    constructor(private msFactorLogsService: MSFactorLogsService) { }

    /**
     *Create a new factor log
     *
     * @param {MSFactorLogs} msFactorLogsDto
     * @return {*}  {Promise<GenericResponse<MSFactorLogs>>}
     * @memberof MSFactorLogsController
     */
    @Post('/')
    @Secured()
    async create(@Body() msFactorLogsDto: MSFactorLogs): Promise<GenericResponse<MSFactorLogs>> {
        return this.msFactorLogsService.create(msFactorLogsDto);
    }

    /**
     *Get factor log by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSFactorLogsController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msFactorLogsService.get(id);
    }

    /**
     *Get factor log by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSFactorLogsController
     */
    @Get('factor/:id')
    @Secured()
    async getByFactor(@Param('id') id: string): Promise<any> {
        return this.msFactorLogsService.getByFactor(id);
    }

    /**
     *Get all factor logs paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof MSFactorLogsController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msFactorLogsService.getAll(page, size, tags);
    }

    /**
     *Update an existing factor log
     *
     * @param {string} id
     * @param {UpdateMSFactorLogs} msFactorLogsDto
     * @return {*}  {Promise<GenericResponse<UpdateMSFactorLogs>>}
     * @memberof MSFactorLogsController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() msFactorLogsDto: UpdateMSFactorLogs): Promise<GenericResponse<UpdateMSFactorLogs>> {
        return this.msFactorLogsService.update(id, msFactorLogsDto);
    }

    /**
     *Delete an existing factor log
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSFactorLogs>>}
     * @memberof MSFactorLogsController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSFactorLogs>> {
        return this.msFactorLogsService.delete(id);
    }
}
