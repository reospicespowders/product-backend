
import { Body, Controller, Delete, Get, Param, Post, Put, Req, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Announcement, UpdateAnnouncement } from 'src/domain/announcement/dto/announcement.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { AnnouncementService } from 'src/usecase/services/announcement/announcement.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Announcement controllers
 *
 * @export
 * @class AnnouncementController
 */
@Controller('announcement')
@ApiTags('Announcement')
@ApiBearerAuth()
export class AnnouncementController {

    /**
     * Creates an instance of AnnouncementController.
     * @param {AnnouncementService} announcementService
     * @memberof AnnouncementController
     */
    constructor(private announcementService: AnnouncementService) { }

    /**
     *Create a new sub criteria
     *
     * @param {Announcement} announcementDto
     * @return {*}  {Promise<GenericResponse<Announcement>>}
     * @memberof AnnouncementController
     */
    @Post('/')
    @Secured()
    async create(@Body() announcementDto: Announcement, @Req() req: any): Promise<GenericResponse<Announcement>> {
        console.log("announcementDto",announcementDto);
        return this.announcementService.create(announcementDto, req.user.uid);
    }

    @Get('/allActive')
    @Secured()
    public async getAllActive(@Req() req: any) {
        console.log("req",req);
        return this.announcementService.getAllActive(req.user.uid);
    }

    @Get('/getResults/:id')
    @Secured()
    public async getResults(@Param('id') id: string) {
        return this.announcementService.getResults(id);
    }

    @Post('/UpdateSeenBy/:id')
    @Secured()
    async UpdateSeenBy(@Param('id') id: string, @Req() req: any): Promise<any> {
        return this.announcementService.UpdateSeenBy(id, req.user.uid);
    }

    @Post('/UpdateIgnoredBy/:id')
    @Secured()
    async UpdateIgnoredBy(@Param('id') id: string, @Req() req: any): Promise<any> {
        return this.announcementService.UpdateIgnoredBy(id, req.user.uid);
    }

    /**
     *Get an existing sub criteria by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof AnnouncementController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.announcementService.get(id);
    }

    /**
     *Get all sub criterias  paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof AnnouncementController
     */
    @Get(':page/:size')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10) {
        return this.announcementService.getAll(page, size);
    }

    /**
     *Update an existing sub criteria
     *
     * @param {string} id
     * @param {UpdateAnnouncement} announcementDto
     * @return {*}  {Promise<GenericResponse<UpdateAnnouncement>>}
     * @memberof AnnouncementController
     */
    @Put('')
    @Secured()
    async update(@Body() announcementDto: UpdateAnnouncement): Promise<GenericResponse<UpdateAnnouncement>> {
        return this.announcementService.update(announcementDto);
    }

    /**
     *Delete an existing sub criteria
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<Announcement>>}
     * @memberof AnnouncementController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<Announcement>> {
        return this.announcementService.delete(id);
    }
}
