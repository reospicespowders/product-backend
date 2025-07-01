import { Controller, Get, Put, Post, Delete, Query, Body, UsePipes, Param, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContentUpdate, UpdateContentUpdate } from 'src/domain/data/dto/content-update.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { ContentUpdateService } from 'src/usecase/services/data/content-update.service';
import { contentUpdateValidator, getValidator, updateContentUpdateValidator } from './data.validations';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


@Controller('content-update')  
@ApiTags('Content Update')
@ApiBearerAuth()
export class ContentUpdateController {

    constructor(private contentUpdateService: ContentUpdateService) { }

    @Post('')
    @Secured()
    @UsePipes(new JoiValidationPipe(contentUpdateValidator)) //validating the object
    public async create(@Body() data: ContentUpdate, @Request() req: any): Promise<GenericResponse<any>> {
        //Add user id to the record 
        data.updated_by = req.user.uid
        // console.log("Controller : ", data)
        return this.contentUpdateService.create(data);
    }

    @Post('/multiple-request')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator)) //validating the object
    public async multipleDelete(@Body() data: Array<ContentUpdate>, @Request() req: any): Promise<GenericResponse<ContentUpdate>> {
        //Add user id to the record 
        // data.updated_by = req.user.uid
        return this.contentUpdateService.multipleDelete(data);
    }

    @Post('/get')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Body() query: any, @Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<any>> {
        return this.contentUpdateService.getAll(query, page, offset);
    }

    @Get('/users')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getUsers( @Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<any>> {
        return this.contentUpdateService.getUsers(page, offset);
    }

    @Get('/view-content-update')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getView(@Query('offset') offset: number, @Query('page') page: number, @Query('status') status: string): Promise<GenericResponse<ContentUpdate[]>> {
        return this.contentUpdateService.getView(status, page, offset);
    }

    @Get('/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getOne(@Param('id') _id: string): Promise<GenericResponse<ContentUpdate>> {
        return this.contentUpdateService.getOne(_id);
    }


    @Put('')
    @Secured()
    @UsePipes(new JoiValidationPipe(updateContentUpdateValidator)) //validating the object
    public async update(@Body() updateContentUpdate: UpdateContentUpdate): Promise<GenericResponse<ContentUpdate>> {
        return this.contentUpdateService.update(updateContentUpdate);
    }

    @Delete('/:id')
    @Secured()
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.contentUpdateService.delete(id);
    }

    @Put('/approve')
    @UsePipes(new JoiValidationPipe(updateContentUpdateValidator))
    @Secured()
    public async approve(@Body() updateContentUpdate: UpdateContentUpdate, @Request() req: any): Promise<GenericResponse<ContentUpdate>> {

        //Adding user id to the update content
        updateContentUpdate.approved_by = req.user.uid
        return this.contentUpdateService.approve(updateContentUpdate);
    }


    @Put('/undo-delete/')
    @UsePipes(new JoiValidationPipe(updateContentUpdateValidator))
    @Secured()
    public async undoDelete(@Body() data: any): Promise<GenericResponse<ContentUpdate>> {
        //Adding user id to the update content
        // updateContentUpdate.approved_by = req.user.uid
        return this.contentUpdateService.undoDelete(data);
    }

    @Put('/reject')
    @UsePipes(new JoiValidationPipe(updateContentUpdateValidator)) //validating the object
    @Secured('CONTENT_APPROVE', 'a')
    public async reject(@Body() updateContentUpdate: UpdateContentUpdate, @Request() req: any): Promise<GenericResponse<ContentUpdate>> {

        //Adding user id to the update content
        updateContentUpdate.approved_by = req.user.uid
        return this.contentUpdateService.reject(updateContentUpdate);
    }

  

}
