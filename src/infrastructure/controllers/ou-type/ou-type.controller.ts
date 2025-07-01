import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { OUType, UpdateOUType } from 'src/domain/ou-type/dto/ou-type.dto';
import { createOuTypeValidation, updateOuTypeValidation } from 'src/domain/ou-type/validation/ou-type-validator.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { OuTypeService } from 'src/usecase/services/ou-type/ou-type.service';
import { getValidator } from '../data/data.validations';



/**
 *OU Type Controllers
 *
 * @export
 * @class OuTypeController
 */
@Controller('ou-type')
@ApiTags('OU Type')
@ApiBearerAuth()
export class OuTypeController {


    /**
     * Creates an instance of OuTypeController.
     * @param {OuTypeService} ouTypeService
     * @memberof OuTypeController
     */
    constructor(private ouTypeService: OuTypeService) { }


    /**
     *Create new ou type
     *
     * @param {OUType} ouCategory
     * @return {*}  {Promise<GenericResponse<OUType>>}
     * @memberof OuTypeController
     */
    @Post('')
    @Secured('OU_TYPE', 'c')
    @UsePipes(new JoiValidationPipe(createOuTypeValidation))
    public async create(@Body() ouCategory: OUType): Promise<GenericResponse<OUType>> {
        return this.ouTypeService.create(ouCategory);
    }


    /**
     *Get all ou types
     *
     * @return {*}  {Promise<GenericResponse<OUType[]>>}
     * @memberof OuTypeController
     */
    @Get('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<OUType[]>> {
        return this.ouTypeService.getAll(page, offset);
    }


    /**
     *Update an existing ou type
     *
     * @param {UpdateOUType} updateOUType
     * @return {*}  {Promise<GenericResponse<OUType>>}
     * @memberof OuTypeController
     */
    @Put('')
    @Secured('OU_TYPE', 'u')
    @UsePipes(new JoiValidationPipe(updateOuTypeValidation))
    public async update(@Body() updateOUType: UpdateOUType): Promise<GenericResponse<OUType>> {
        return this.ouTypeService.update(updateOUType);
    }


    /**
     *Delete an existing ou type
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof OuTypeController
     */
    @Delete('/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured('OU_TYPE', 'd')
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        // Handle the case where _id is null or undefined
        if (!id) {
            throw new Error("Id not defined");
        }
        return this.ouTypeService.delete(id);
    }

    /**
     *Get all Branches
     *
     * @return {*}  {Promise<GenericResponse<OUType[]>>}
     * @memberof OuTypeController
     */
    @Get('/branches')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getBranches(): Promise<GenericResponse<OUType[]>> {
        return this.ouTypeService.getBranches();
    }
}
