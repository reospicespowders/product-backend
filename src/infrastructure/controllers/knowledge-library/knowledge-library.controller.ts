import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { KLibrary, UpdateKLibrary } from 'src/domain/knowledge_library/dto/klibrary.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { KnowledgeLibraryService } from 'src/usecase/services/knowledge-library/knowledge-library.service';
import { getValidator } from '../data/data.validations';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';



/**
 *Knowledge Library Controllers
 *
 * @export
 * @class KnowledgeLibraryController
 */
@Controller('knowledge-library')
@ApiTags('Knowledge Library')
@ApiBearerAuth()
export class KnowledgeLibraryController {

    constructor(
        private kLibraryService: KnowledgeLibraryService
    ) { }


    /**
     *Create new knowledge library
     *
     * @param {KLibrary} kLibrary
     * @return {*}  {Promise<GenericResponse<KLibrary>>}
     * @memberof KnowledgeLibraryController
     */
    @Post()
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async create(@Body() kLibrary: KLibrary, @Req() request: any): Promise<GenericResponse<KLibrary>> {
        return this.kLibraryService.create(kLibrary, request.user.uid);
    }


    /**
     *Get all knowledge libraries
     *
     * @return {*}  {Promise<GenericResponse<KLibrary[]>>}
     * @memberof KnowledgeLibraryController
     */
    @Get()
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<KLibrary[]>> {
        return this.kLibraryService.getAll(page,offset);
    }


    /**
     *Update an existing knowledge library
     *
     * @param {UpdateKLibrary} kLibrary
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof KnowledgeLibraryController
     */
    @Put()
    @Secured('KNOWLEDGE_LIBRARY', 'u')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async update(@Body() kLibrary: UpdateKLibrary): Promise<GenericResponse<null>> {
        return this.kLibraryService.update(kLibrary);
    }


    /**
     *Delete an existing knowledge library
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof KnowledgeLibraryController
     */
    @Delete('/:id')
    @Secured('KNOWLEDGE_LIBRARY', 'd')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.kLibraryService.delete(id);
    }
}
