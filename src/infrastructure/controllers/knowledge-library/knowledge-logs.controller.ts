import { Body, Controller, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { getValidator } from '../data/data.validations';
import { KnowledgeLibraryLogService } from 'src/usecase/services/knowledge-library/knowledge-libraby-logs.service';
import { KLibraryLog, UpdateKLibraryLog } from 'src/domain/knowledge_library/dto/Klibrary-log.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Knowledge Library Log Controllers
 *
 * @export
 * @class KnowledgeLibraCategoryController
 */
@Controller('kl-log')
@ApiTags('Knowledge Library Logs')
@ApiBearerAuth()
export class KnowledgeLibraryLogController {

    constructor(private klibraryLogService: KnowledgeLibraryLogService) { }


    /**
     *Create new Log
     *
     * @param {KLibraryLogs} kLibrary
     * @return {*}  {Promise<GenericResponse<KLibraryLogs>>}
     * @memberof KnowledgeLibraCategoryController
     */
    @Post()
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async create(@Body() kLibrary: KLibraryLog): Promise<GenericResponse<KLibraryLog>> {
        return this.klibraryLogService.create(kLibrary);
    }


    /**
     *Get all categories
     *
     * @return {*}  {Promise<GenericResponse<KLibraryLogs[]>>}
     * @memberof KnowledgeLibraCategoryController
     */
    @Post('/get')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getAll(@Body() query :any ,@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<any[]>> {
        return this.klibraryLogService.getAll(page,offset, query );
    }

    /**
     *Update an existing Log
     *
     * @param {UpdateKLibraryCategory} kLibrary
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof KnowledgeLibraCategoryController
     */
    @Put()
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async update(@Body() kLibrary: UpdateKLibraryLog): Promise<GenericResponse<null>> {
        return this.klibraryLogService.update(kLibrary);
    }
}

