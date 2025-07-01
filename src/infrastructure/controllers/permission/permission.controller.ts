import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { InvestorPermissionDto, Permission, UpdatePermissionDto } from 'src/domain/permission/dto/permission.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { PermissionService } from 'src/usecase/services/permission/permission.service';
import { getValidator } from '../data/data.validations';
import { InvestorSchema } from 'src/domain/permission/entities/permission.entity';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';

/**
 *Permission Controller 
 *
 * @export
 * @class PermissionController
 */
@Controller('permission')
@ApiTags('Permission')
@ApiBearerAuth()
export class PermissionController {


    /**
     * Creates an instance of PermissionController.
     * @param {PermissionService} permissionService
     * @memberof PermissionController
     */
    constructor(private permissionService: PermissionService) { }


    /**
     *Get all permissions
     *
     * @return {*}  {Promise<GenericResponse<Permission[]>>}
     * @memberof PermissionController
     */
    @Get('')
    @Secured('PERMISSION_MANAGEMENT', 'r')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<Permission[]>> {
        return this.permissionService.getAll(page, offset);
    }


    /**
     *Create new permission
     *
     * @param {Permission} permission
     * @return {*}  {Promise<GenericResponse<Permission>>}
     * @memberof PermissionController
     */
    @Post('')
    @Secured('PERMISSION_MANAGEMENT', 'c')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async create(@Body() permission: Permission): Promise<GenericResponse<Permission>> {
        return this.permissionService.create(permission);
    }


    /**
     *Update a permission
     *
     * @param {UpdatePermissionDto} permission
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof PermissionController
     */
    @Put('')
    @Secured('PERMISSION_MANAGEMENT', 'u')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async update(@Body() permission: UpdatePermissionDto): Promise<GenericResponse<null>> {
        return this.permissionService.update(permission);
    }


    /**
     *Delete a permission
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof PermissionController
     */
    @Delete('/:id')
    @Secured('PERMISSION_MANAGEMENT', 'd')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async delete(@Param('id') id: string): Promise<GenericResponse<null>> {
        return this.permissionService.delete(id);
    }

    /**
     *Delete a permission
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof PermissionController
     */
    @Post('investor-permission')
    @Secured('ADMIN_PERMISSION', 'a')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async updateInvestorPermission(@Body() permission: InvestorPermissionDto): Promise<GenericResponse<null>> {
        return this.permissionService.updateInvestorPermission(permission);
    }

    /**
    *Get all permissions
    *
    * @return {*}  {Promise<GenericResponse<Permission[]>>}
    * @memberof PermissionController
    */
    @Get('investor-permission')
    @UsePipes(new JoiValidationPipe(getValidator))
    @OpenRoute()
    public async getInvestorPermission(): Promise<GenericResponse<InvestorPermissionDto>> {
        return this.permissionService.getInvestorPermission();
    }


     /**
    *Get all permissions
    *
    * @return {*}  {Promise<GenericResponse<Permission[]>>}
    * @memberof PermissionController
    */
    @Get('get-user-by-permission')
    @UsePipes(new JoiValidationPipe(getValidator))
    @OpenRoute()
    public async getPermissionUsers(@Body() data: any): Promise<GenericResponse<InvestorPermissionDto>> {
        return this.permissionService.getPermissionUser(data.permission,data.value);
    }

}
