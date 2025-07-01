
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSProject, UpdateMSProject } from 'src/domain/mystory-shopper/dto/ms-project.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSProjectService } from 'src/usecase/services/mystory-shopper/ms-project.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Project Controllers
 *
 * @export
 * @class MSProjectController
 */
@Controller('ms-project')
@ApiTags('Mystory Shopper Project')
@ApiBearerAuth()
export class MSProjectController {

    /**
     * Creates an instance of MSProjectController.
     * @param {MSProjectService} msProjectService
     * @memberof MSProjectController
     */
    constructor(private msProjectService: MSProjectService) { }

    /**
     *Create a new project
     *
     * @param {MSProject} msProjectDto
     * @return {*}  {Promise<GenericResponse<MSProject>>}
     * @memberof MSProjectController
     */
    @Post('/')
    @Secured()
    async create(@Body() msProjectDto: MSProject): Promise<GenericResponse<MSProject>> {
        return this.msProjectService.create(msProjectDto);
    }

    /**
     *Get an existing project by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSProjectController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msProjectService.get(id);
    }

    /**
     *Get all projects paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @return {*} 
     * @memberof MSProjectController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
    @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msProjectService.getAll(page, size, tags);
    }

    /**
     *Get all vendor projects
     *
     * @param {string} vendorId
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @return {*} 
     * @memberof MSProjectController
     */
    @Get(':vendorId/:page/:size')
    @Secured()
    public async getVendorProjects(@Param('vendorId') vendorId: string, @Param('page') page: number = 1, @Param('size') size: number = 10) {
        return this.msProjectService.getVendorProjects(vendorId, page, size);
    }

    /**
     *Update an existing project
     *
     * @param {UpdateMSProject} msProjectDto
     * @return {*}  {Promise<GenericResponse<MSProject>>}
     * @memberof MSProjectController
     */
    @Put()
    @Secured()
    async update(@Body() msProjectDto: UpdateMSProject): Promise<GenericResponse<MSProject>> {
        return this.msProjectService.update(msProjectDto._id, msProjectDto);
    }

    /**
     *Delete an existing project
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSProject>>}
     * @memberof MSProjectController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSProject>> {
        return this.msProjectService.delete(id);
    }
}
