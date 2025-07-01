
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSChannel, UpdateMSChannel } from 'src/domain/mystory-shopper/dto/ms-channel.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSChannelService } from 'src/usecase/services/mystory-shopper/ms-channel.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Channel Controllers
 *
 * @export
 * @class MSChannelController
 */
@Controller('ms-channel')
@ApiTags('Mystory Shopper Channel')
@ApiBearerAuth()
export class MSChannelController {

    /**
     * Creates an instance of MSChannelController.
     * @param {MSChannelService} msChannelService
     * @memberof MSChannelController
     */
    constructor(private msChannelService: MSChannelService) { }

    /**
     *Create a new channel
     *
     * @param {MSChannel} msChannelDto
     * @return {*}  {Promise<GenericResponse<MSChannel>>}
     * @memberof MSChannelController
     */
    @Post('/')
    @Secured()
    async create(@Body() msChannelDto: MSChannel): Promise<GenericResponse<MSChannel>> {
        return this.msChannelService.create(msChannelDto);
    }

    /**
     *Create multiple channels at once
     *
     * @param {Array<MSChannel>} msChannelDto
     * @return {*}  {Promise<GenericResponse<MSChannel[]>>}
     * @memberof MSChannelController
     */
    @Post('/many')
    @Secured()
    async createMany(@Body() msChannelDto: Array<MSChannel>): Promise<GenericResponse<MSChannel[]>> {
        return this.msChannelService.createMany(msChannelDto);
    }

    /**
     *Get existing channel by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSChannelController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msChannelService.get(id);
    }

    /**
     *Get existing channels by project id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSChannelController
     */
    @Get('project/:projectId')
    @Secured()
    async getByProjectId(@Param('projectId') id: string): Promise<any> {
        // console.log("=das==>", id);
        return this.msChannelService.getByProjectId(id);
    }

    @Get('visit/:projectId/:sessionId')
    @Secured()
    async getVisitProjectId(@Param('projectId') id: string, @Param('sessionId') sessionId: string): Promise<any> {
        return this.msChannelService.getVisitProjectId(id,sessionId);
    }

    /**
     *Get project channels paginated
     *
     * @param {string} id
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @return {*}  {Promise<any>}
     * @memberof MSChannelController
     */
    @Get(':projectId/:page/:size')
    @Secured()
    async getWithCriteria(@Param('projectId') id: string, @Param('page') page: number = 1, @Param('size') size: number = 10,): Promise<any> {
        return this.msChannelService.getChannelsWithCriteria(id, page, size);
    }

    /**
     *Get all channels paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof MSChannelController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msChannelService.getAll(page, size, tags);
    }

    /**
     *Update an existing channel
     *
     * @param {string} id
     * @param {UpdateMSChannel} msChannelDto
     * @return {*}  {Promise<GenericResponse<UpdateMSChannel>>}
     * @memberof MSChannelController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() msChannelDto: UpdateMSChannel): Promise<GenericResponse<UpdateMSChannel>> {
        return this.msChannelService.update(id, msChannelDto);
    }

    /**
     *Delete an existing channel
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSChannel>>}
     * @memberof MSChannelController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSChannel>> {
        return this.msChannelService.delete(id);
    }
}
