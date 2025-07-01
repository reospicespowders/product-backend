
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSSession, MSSessionVisitDate, UpdateMSSession } from 'src/domain/mystory-shopper/dto/ms-sessions.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSSessionService } from 'src/usecase/services/mystory-shopper/ms-sessions.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Session Controllers
 *
 * @export
 * @class MSSessionController
 */
@Controller('ms-sessions')
@ApiTags('Mystory Shopper Sessions')
@ApiBearerAuth()
export class MSSessionController {

    /**
     * Creates an instance of MSSessionController.
     * @param {MSSessionService} msSessionService
     * @memberof MSSessionController
     */
    constructor(private msSessionService: MSSessionService) { }

    /**
     *Create a new session
     *
     * @param {MSSession} msSessionDto
     * @return {*}  {Promise<GenericResponse<MSSession>>}
     * @memberof MSSessionController
     */
    @Post('/')
    @Secured()
    async create(@Body() msSessionDto: MSSession): Promise<GenericResponse<MSSession>> {
        return this.msSessionService.create(msSessionDto);
    }

    /**
     *Get an existing session by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSSessionController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msSessionService.get(id);
    }

    /**
     *Get all sessions paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof MSSessionController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msSessionService.getAll(page, size, tags);
    }

    /**
     *Get all project sessions paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string} projectId
     * @return {*} 
     * @memberof MSSessionController
     */
    @Get('project/:page/:size/:projectId')
    @Secured()
    public async getByProject(@Param('page') page: number = 1, @Param('size') size: number = 10, @Param("projectId") projectId: string) {
        return this.msSessionService.getByProject(page, size, projectId);
    }

    /**
     *Update an existing session
     *
     * @param {string} id
     * @param {UpdateMSSession} msSessionDto
     * @return {*}  {Promise<GenericResponse<UpdateMSSession>>}
     * @memberof MSSessionController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() msSessionDto: UpdateMSSession): Promise<GenericResponse<UpdateMSSession>> {
        return this.msSessionService.update(id, msSessionDto);
    }

    /**
     *Insert visit in an existing session
     *
     * @param {string} id
     * @param {*} msSessionDto
     * @return {*}  {Promise<GenericResponse<MSSessionVisitDate>>}
     * @memberof MSSessionController
     */
    @Put('/add-visit/:id')
    @Secured()
    async insertSession(@Param('id') id: string, @Body() msSessionDto: any): Promise<GenericResponse<MSSessionVisitDate>> {

        return this.msSessionService.insertSession(id, msSessionDto);
    }

    /**
     *Get structured data for calendar view
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSSessionController
     */
    @Get('calender/:id')
    @Secured()
    async getCalender(@Param('id') id: string): Promise<any> {
        return this.msSessionService.getCalender(id);
    }

    /**
     *Delete an existing session
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSSession>>}
     * @memberof MSSessionController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSSession>> {
        return this.msSessionService.delete(id);
    }

    @Delete('/visit/:sessionId/:visitId')
    @Secured()
    async deleteVisit(@Param('sessionId') sessionId: string, @Param('visitId') visitId: string): Promise<GenericResponse<MSSession>> {
        return this.msSessionService.deleteVisit(sessionId,visitId);
    }

    /**
     *Get all project visits
     *
     * @param {string} projectId
     * @return {*} 
     * @memberof MSSessionController
     */
    @Get('visit/:projectId')
    @Secured()
    public async getVisitDates(@Param("projectId") projectId: string) {
        return this.msSessionService.getVisitDates(projectId);
    }
}
