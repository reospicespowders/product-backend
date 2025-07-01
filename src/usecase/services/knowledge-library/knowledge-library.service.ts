import { Inject, Injectable } from '@nestjs/common';
import { UpdateWriteOpResult } from 'mongoose';
import { GenericResponse } from 'src/domain/dto/generic';
import { KLibrary, UpdateKLibrary } from 'src/domain/knowledge_library/dto/klibrary.dto';
import { KLIbraryRepository } from 'src/domain/knowledge_library/interfaces/klibrary-repository.interface';
import { NotificationService } from '../notification/notification.service';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';

@Injectable()
export class KnowledgeLibraryService {

    constructor(
        @Inject('KLibraryRepository') private kLibraryRepository: KLIbraryRepository,
        private notificationService: NotificationService,
    ) { }

    public async create(kLibrary: KLibrary, uid: string): Promise<GenericResponse<KLibrary>> {
        let data = await this.kLibraryRepository.create(kLibrary);
        if (kLibrary.announceNotification) {
            const notification: Notification = {
                receiver: [],
                seenBy: [],
                sender: uid,
                type: NotificationType.KLIBRARY_NOTIFICATION,
                category:NotificationCategory.KLIBRARY,
                data:data
            }
            this.notificationService.create(notification);
        }
        let response: GenericResponse<KLibrary> = {
            success: true,
            message: 'Knowledge library created successfully',
            data: data,
        };

        return response;

    }

    public async getAll(page:number,offset:number): Promise<GenericResponse<KLibrary[]>> {
        let data = await this.kLibraryRepository.getAll();
        let response: GenericResponse<KLibrary[]> = {
            success: true,
            message: 'Knowledge libraries fetched successfully',
            data: data,
        };

        return response;
    }

    public async update(kLibrary: UpdateKLibrary): Promise<GenericResponse<null>> {
        let res: UpdateWriteOpResult = await this.kLibraryRepository.update(kLibrary);

        let response: GenericResponse<null> = {
            success: false,
            message: 'Failed to update Knowledge library',
            data: null,
        };

        if (res.modifiedCount === 1) {
            response = {
                success: true,
                message: 'Knowledge library updated successfully',
                data: null,
            };
        }
        return response;
    }

    public async delete(_id: string): Promise<GenericResponse<null>> {
        let res = await this.kLibraryRepository.delete(_id);

        // Generic Response
        let response: GenericResponse<null> = {
            success: false,
            message: 'Failed to delete Knowledge library',
            data: null,
        };

        if (res.deletedCount === 1) {
            response = {
                success: true,
                message: 'Knowledge library deleted successfully',
                data: null,
            };
        }
        return response;
    }
}
