import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { OUCategory, UpdateOUCategory } from 'src/domain/ou-category/dto/ou-category.dto';
import { createOuCategoryValidation, updateOuCategoryValidation } from 'src/domain/ou-category/validator/ou-category-validation.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { OuCategoryService } from 'src/usecase/services/ou-category/ou-category.service';
import { getValidator } from '../data/data.validations';


/**
 *OU Category Controllers
 *
 * @export
 * @class OuCategoryController
 */
@Controller('ou-category')
@ApiTags('OU Category')
@ApiBearerAuth()
export class OuCategoryController {



    /**
     * Creates an instance of OuCategoryController.
     * @param {OuCategoryService} categoryService
     * @memberof OuCategoryController
     */
    constructor(private categoryService: OuCategoryService) { }


    /**
     *Create new category
     *
     * @param {OUCategory} ouCategory
     * @return {*}  {Promise<GenericResponse<OUCategory>>}
     * @memberof OuCategoryController
     */
    @Post('')
    @Secured('OU_CATEGORY', 'c')
    @UsePipes(new JoiValidationPipe(createOuCategoryValidation))
    public async create(@Body() ouCategory: OUCategory): Promise<GenericResponse<OUCategory>> {
        return this.categoryService.create(ouCategory);
    }


    /**
     *Get all categories
     *
     * @return {*}  {Promise<GenericResponse<OUCategory[]>>}
     * @memberof OuCategoryController
     */
    @Get('')
    @Secured('OU_CATEGORY', 'r')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<OUCategory[]>> {
        return this.categoryService.getAll(page,offset);
    }


    /**
     *Update an existing category
     *
     * @param {UpdateOUCategory} updateOUCategory
     * @return {*}  {Promise<GenericResponse<OUCategory>>}
     * @memberof OuCategoryController
     */
    @Put('')
    @Secured('OU_CATEGORY', 'u')
    @UsePipes(new JoiValidationPipe(updateOuCategoryValidation))
    public async update(@Body() updateOUCategory: UpdateOUCategory): Promise<GenericResponse<OUCategory>> {
        return this.categoryService.update(updateOUCategory);
    }


    /**
     *Delete an existing category
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof OuCategoryController
     */
    @Delete('/:id')
    @Secured('OU_CATEGORY', 'd')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        // Handle the case where _id is null or undefined
        if (!id) {
            throw new Error("Id not defined");
           }
        return this.categoryService.delete(id);
    }

}
