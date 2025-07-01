import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChangeCommentStatusDto, Comment, UpdateCommentDto } from 'src/domain/comments/dto/comment.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { CommentsService } from 'src/usecase/services/comments/comments.service';
import { getValidator } from '../data/data.validations';

@Controller('comments')
@ApiTags('Comments')
@ApiBearerAuth()
export class CommentsController {


    /**
     * Creates an instance of CommentsController.
     * @param {CommentsService} commentService
     * @memberof CommentsController
     */
    constructor(private commentService: CommentsService) { }


    /**
     *Create a new comment
     *
     * @param {Comment} comment
     * @param {*} req
     * @return {*}  {Promise<GenericResponse<Comment>>}
     * @memberof CommentsController
     */
    @Post('')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async create(@Body() comment: Comment, @Request() req: any): Promise<GenericResponse<Comment>> {
        comment.by = req.user.uid;
        return this.commentService.create(comment);
    }


    /**
     *Get all comments
     *
     * @return {*}  {Promise<GenericResponse<Comment[]>>}
     * @memberof CommentsController
     */
    @Get('/:status')
    @Secured('COMMENTS', 'r')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(
        @Param('status') status: string,
        @Query('offset') offset: number,
        @Query('page') page: number
         ): Promise<GenericResponse<Comment[]>> {
        return this.commentService.getAll(status, offset,page);
    }


    /**
     *Update an existing comment
     *
     * @param {UpdateCommentDto} comment
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof CommentsController
     */
    @Put('')
    @Secured('COMMENTS', 'u')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async update(@Body() comment: UpdateCommentDto): Promise<GenericResponse<null>> {
        return this.commentService.update(comment);
    }


    /**
     *Delete an existing comment
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof CommentsController
     */
    @Delete('/:id')
    @Secured('COMMENTS', 'd')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async delete(@Param('id') id: string): Promise<GenericResponse<null>> {

        return this.commentService.delete(id);
    }


    /**
     *Get user specific comments
     *
     * @param {*} req
     * @return {*}  {Promise<GenericResponse<Comment[]>>}
     * @memberof CommentsController
     */
    @Get('/user/comments')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getByUser(@Request() req: any,@Query('offset') offset: number,@Query('page') page: number): Promise<GenericResponse<Comment[]>> {
        return this.commentService.getByUser(req.user.uid ,page , offset );
    }


    /**
     *Get data specific comments
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<Comment[]>>}
     * @memberof CommentsController
     */ 
    @Get('/data/:dataId')
    @Secured('COMMENTS', 'r')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getByData(@Param('dataId') id: string, @Query('offset') offset: number,@Query('page') page: number): Promise<GenericResponse<Comment[]>> {
        return this.commentService.getByDataId(id , offset , page  );
    }


    /**
     *Update Comment Status i.e APPROVE, REJECT, PENDING
     *
     * @param {ChangeCommentStatusDto} comment
     * @param {*} req
     * @return {*} 
     * @memberof CommentsController
     */
    @Put('/change-status')
    @Secured('COMMENTS', 'u')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async approveReject(@Body() comment: ChangeCommentStatusDto, @Request() req: any): Promise<GenericResponse<null>> {
        return this.commentService.updateStatus(comment, req.user.uid);
    }
}
