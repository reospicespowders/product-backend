import { Body, Controller, Get, Param, Post, Delete, UsePipes, Request, Query, Put, HttpException, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionRequest, CreatePermissionRequestDto, UpdatePermissionRequestDto } from 'src/domain/user-auth/dto/permission-request.dto';
import { JoiValidationPipe } from '../../pipes/joi-validation.pipe';
import { GenericResponse } from 'src/domain/dto/generic';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { getValidator } from '../data/data.validations';        
import { createPermissionRequestValidator, rejectPermissionRequestValidator, updatePermissionRequestValidator } from './user-validations';
import { PermissionRequestService } from 'src/usecase/services/user-auth/permission-request.service';
import { AuthGuard } from '../../guards/auth.guard';
import { Req } from '@nestjs/common';

// Validation schemas


/**
 * @export
 * @class PermissionRequestController
 */
@Controller('permission-request')
@ApiTags('Permission Request')
@ApiBearerAuth()
export class PermissionRequestController {
    constructor(private permissionRequestService: PermissionRequestService

    ) {} // Replace 'any' with your service type

    /**
     * Create a new permission request
     * @param {PermissionRequest} data
     * @param {Request} req
     * @return {*}  {Promise<GenericResponse<PermissionRequest>>}
     * @memberof PermissionRequestController
     */
    @Post('')
    @Secured()
    @UsePipes(new JoiValidationPipe(createPermissionRequestValidator))
    async create(@Body() data: CreatePermissionRequestDto, @Request() req: any): Promise<GenericResponse<PermissionRequest>> {
        data.created_by = req.user.uid;
        data.updated_by = req.user.uid;
        return this.permissionRequestService.create(data);
    }

    /**
     * Get filtered permission requests
     * @param {any} query
     * @return {*}  {Promise<GenericResponse<PermissionRequest[]>>}
     * @memberof PermissionRequestController
     */
    @Post('/get')
    // @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    async getFiltered(@Body() query: any): Promise<GenericResponse<PermissionRequest[]>> {
        return this.permissionRequestService.getAll(query);
    }

    /**
     * Get permission request by ID
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<PermissionRequest>>}
     * @memberof PermissionRequestController
     */
    @Get('/:id')
    // @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    async getById(@Param('id') id: string): Promise<GenericResponse<PermissionRequest>> {
        return this.permissionRequestService.getOne(id);
    }

    /**
     * Update permission request
     * @param {UpdatePermissionRequestDto} data
     * @param {Request} req
     * @return {*}  {Promise<GenericResponse<PermissionRequest>>}
     * @memberof PermissionRequestController
     */
    @Put('')
    // @Secured()
    @UsePipes(new JoiValidationPipe(updatePermissionRequestValidator))
    async update(@Body() data: UpdatePermissionRequestDto, @Request() req: any): Promise<GenericResponse<PermissionRequest>> {
        data.updated_by = req.user.uid;
        return this.permissionRequestService.update(data);
    }

    /**
     * Delete permission request
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof PermissionRequestController
     */
    @Delete('/:id')
    // @Secured('PERMISSION_MANAGEMENT', 'd')
    async delete(@Param('id') id: string): Promise<GenericResponse<null>> {
        return this.permissionRequestService.delete(id);
    }


    /**
     * Reject permission request
     * @param {UpdatePermissionRequestDto} data
     * @param {Request} req
     * @return {*}  {Promise<GenericResponse<PermissionRequest>>}
     * @memberof PermissionRequestController
     */
    @Put('/reject')
    // @Secured('PERMISSION_MANAGEMENT', 'u')
    @UsePipes(new JoiValidationPipe(rejectPermissionRequestValidator))
    async reject(@Body() data: UpdatePermissionRequestDto, @Request() req: any): Promise<GenericResponse<PermissionRequest>> {
        data.status = 'REJECTED';
        data.updated_by = req.user.uid;
        return this.permissionRequestService.update(data);
    }

    /**
     * Approve permission request
     * @param {string} id Permission request ID from URL
     * @param {Request} req
     * @return {*}  {Promise<GenericResponse<PermissionRequest>>}
     * @memberof PermissionRequestController
     */
    @Put('/approve/')
    @UseGuards(AuthGuard)
    async approve(@Body() data: string, @Req() req: any): Promise<GenericResponse<PermissionRequest>> {
       return this.permissionRequestService.approve(data,req)
    }
}
