import { Inject, Injectable } from '@nestjs/common';
import { UpdateWriteOpResult } from 'mongoose';
import { ChangeCommentStatusDto, Comment, UpdateCommentDto } from 'src/domain/comments/dto/comment.dto';
import { CommentRepository } from 'src/domain/comments/interfaces/comment-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationService } from '../notification/notification.service';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';

@Injectable()
export class CommentsService {

    /**
     * Creates an instance of CommentsService.
     * @param {CommentRepository} commentRepository
     * @memberof CommentsService
     */
    constructor(
        @Inject('CommentRepository') private readonly commentRepository: CommentRepository,
        private notificationService: NotificationService
    ) { }

    public async getAll(status : string, offset: number,page: number): Promise<GenericResponse<Comment[]>> {
        let data: Comment[] = await this.commentRepository.getAll(status, offset,page);

        let response: GenericResponse<Comment[]> = {
            success: true,
            message: "Comments fetched successfully",
            data: data
        }
        return response;
    }

    public async create(comment: Comment): Promise<GenericResponse<Comment>> {
        let data: Comment = await this.commentRepository.create(comment);
        let updatedComment = await this.commentRepository.populateProperty(data,'ou');
        const notification: Notification = {
            receiver: [],
            seenBy: [],
            sender: comment.by,
            type: NotificationType.NEW_COMMENT,
            category: NotificationCategory.DATA_EVENTS,
            data: updatedComment
        }
        this.notificationService.create(notification);
        let response: GenericResponse<Comment> = {
            success: true,
            message: "Comment created successfully",
            data: data
        }
        return response;
    }

    public async update(comment: UpdateCommentDto): Promise<GenericResponse<null>> {
        let data: UpdateWriteOpResult = await this.commentRepository.update(comment);

        let response: GenericResponse<null> = {
            success: false,
            message: "Failed to update Comment",
            data: null
        }

        if (data.modifiedCount == 1) {
            response = {
                success: true,
                message: "Comments updated successfully",
                data: null
            }
        }
        return response;
    }

    public async delete(_id: string): Promise<GenericResponse<null>> {
        let data: any = await this.commentRepository.delete(_id);

        let response: GenericResponse<null> = {
            success: false,
            message: "Failed to delete Comment",
            data: null
        }

        if (data.deletedCount == 1) {
            response = {
                success: true,
                message: "Comment deleted successfully",
                data: null
            }
        }
        return response;
    }

    public async getByUser(uid: string, page : number, offset : number): Promise<GenericResponse<Comment[]>> {
        let data: Comment[] = await this.commentRepository.getByUser(uid, page, offset);

        let response: GenericResponse<Comment[]> = {
            success: true,
            message: "Comments fetched successfully",
            data: data
        }
        return response;
    }

    public async getByDataId(dataId: string, page: number, offset: number): Promise<GenericResponse<Comment[]>> {
        let data: Comment[] = await this.commentRepository.getByDataId(dataId);

        let response: GenericResponse<Comment[]> = {
            success: true,
            message: "Comments fetched successfully",
            data: data
        }
        return response;
    }

    public async updateStatus(comment: ChangeCommentStatusDto, uid: string): Promise<GenericResponse<null>> {

        //creating approve data format
        let updateData = {
            _id: comment._id,
            status: comment.status,
            approved_by: uid
        }

            if (comment.rejectReason) {
            updateData['rejectReason'] = comment.rejectReason;
        }

        let res = await this.commentRepository.update(updateData);
        let commentData = await this.commentRepository.getById(comment._id);
        const notification: Notification = {
            receiver: [commentData.by],
            seenBy: [],
            sender: uid,
            type: NotificationType.COMMENT_REPLY,
            category: NotificationCategory.DATA_EVENTS,
            data:commentData
        }
        this.notificationService.create(notification);
        let response: GenericResponse<null> = {
            success: false,
            message: "Failed to update Comment",
            data: null
        }

        if (res.modifiedCount == 1) {
            response = {
                success: true,
                message: "Comment updated successfully",
                data: null
            }
        }
        return response;
    }
}
