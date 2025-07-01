
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSEnquiry, UpdateMSEnquiry } from 'src/domain/mystory-shopper/dto/children/ms-enquiries.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSEnquiryService } from 'src/usecase/services/mystory-shopper/children/ms-enquiries.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Enquiry Controllers
 *
 * @export
 * @class MSEnquiryController
 */
@Controller('ms-enquiry')
@ApiTags('Mystory Shopper Enquiry')
@ApiBearerAuth()
export class MSEnquiryController {

    /**
     * Creates an instance of MSEnquiryController.
     * @param {MSEnquiryService} msEnquiryService
     * @memberof MSEnquiryController
     */
    constructor(private msEnquiryService: MSEnquiryService) { }

    /**
     *Create a new enquiry
     *
     * @param {MSEnquiry} msEnquiryDto
     * @return {*}  {Promise<GenericResponse<MSEnquiry>>}
     * @memberof MSEnquiryController
     */
    @Post('/')
    @Secured()
    async create(@Body() msEnquiryDto: MSEnquiry): Promise<GenericResponse<MSEnquiry>> {
        return this.msEnquiryService.create(msEnquiryDto);
    }

    /**
     *Get an existing enquiry by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSEnquiryController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msEnquiryService.get(id);
    }

    /**
     *Get all enquiries paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof MSEnquiryController
     */
    @Get(':page/:size/:tags')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10,
        @Param('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
        return this.msEnquiryService.getAll(page, size, tags);
    }

    /**
     *Get all enquiries by project id paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string} projectId
     * @return {*} 
     * @memberof MSEnquiryController
     */
    @Get('project/:page/:size/:projectId')
    @Secured()
    public async getByProject(@Param('page') page: number = 1, @Param('size') size: number = 10, @Param('projectId') projectId: string) {
        return this.msEnquiryService.getByProject(page, size, projectId);
    }

    /**
     *Update an existing enquiry
     *
     * @param {string} id
     * @param {UpdateMSEnquiry} msEnquiryDto
     * @return {*}  {Promise<GenericResponse<UpdateMSEnquiry>>}
     * @memberof MSEnquiryController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() msEnquiryDto: UpdateMSEnquiry): Promise<GenericResponse<UpdateMSEnquiry>> {
        return this.msEnquiryService.update(id, msEnquiryDto);
    }

    /**
     *Delete an existing enquiry
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSEnquiry>>}
     * @memberof MSEnquiryController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSEnquiry>> {
        return this.msEnquiryService.delete(id);
    }
}
