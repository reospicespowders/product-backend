import { Body, Controller, Get, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { DeleteLibraryCategoryRequest, KLibraryCategory, UpdateKLibraryCategory } from 'src/domain/knowledge_library/dto/klibrary-category.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { KnowledgeLibraryCategoryService } from 'src/usecase/services/knowledge-library/knowledge-library-category.service';
import { getValidator } from '../data/data.validations';


/**
 *Knowledge Library Category Controllers
 *
 * @export
 * @class KnowledgeLibraCategoryController
 */
@Controller('knowledge-library-category')
@ApiTags('Knowledge Library Category')
@ApiBearerAuth()
export class KnowledgeLibraryCategoryController {

    constructor(private klibraryCategoryService: KnowledgeLibraryCategoryService) { }


    /**
     *Create new category
     *
     * @param {KLibraryCategory} kLibrary
     * @return {*}  {Promise<GenericResponse<KLibraryCategory>>}
     * @memberof KnowledgeLibraCategoryController
     */
    @Post()
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured('KNOWLEDGE_LIBRARY_CATEGORY','c')
    public async create(@Body() kLibrary: KLibraryCategory): Promise<GenericResponse<KLibraryCategory>> {
        return this.klibraryCategoryService.create(kLibrary);
    }


    /**
     *Get all categories
     *
     * @return {*}  {Promise<GenericResponse<KLibraryCategory[]>>}
     * @memberof KnowledgeLibraCategoryController
     */
    @Get()
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<KLibraryCategory[]>> {
        return this.klibraryCategoryService.getAll(page,offset);
    }


    /**
     *Update an existing category
     *
     * @param {UpdateKLibraryCategory} kLibrary
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof KnowledgeLibraCategoryController
     */
    @Put()
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured('KNOWLEDGE_LIBRARY_CATEGORY','u')
    public async update(@Body() kLibrary: UpdateKLibraryCategory): Promise<GenericResponse<null>> {
        return this.klibraryCategoryService.update(kLibrary);
    }


    /**
     *Delete a category
     *
     * @param {DeleteLibraryCategoryRequest} deleteRequest
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof KnowledgeLibraCategoryController
     */
    @Post('delete')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured('KNOWLEDGE_LIBRARY_CATEGORY','d')
    public async delete(@Body() deleteRequest: DeleteLibraryCategoryRequest): Promise<GenericResponse<any>> {
        return this.klibraryCategoryService.delete(deleteRequest._id, deleteRequest.deleteData, deleteRequest.changeCategory);
    }
}

