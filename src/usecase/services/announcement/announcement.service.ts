import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Announcement, UpdateAnnouncement } from 'src/domain/announcement/dto/announcement.dto';
import { AnnouncementRepository } from 'src/domain/announcement/interfaces/announcement-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *Announcement Service
 *
 * @export
 * @class Announcement
 */
@Injectable()
export class AnnouncementService {

    /**
     * Creates an instance of Announcement.
     * @param {AnnouncementRepository} AnnouncementRepository
     * @memberof Announcement
     */
    constructor(
        @Inject('AnnouncementRepository') private announcementRepository: AnnouncementRepository,
    ) { }

    /**
     *Create a new sub criteria
     *
     * @param {Announcement} announcementDto
     * @return {*}  {Promise<GenericResponse<Announcement>>}
     * @memberof Announcement
     */
    async create(announcementDto: Announcement, uid:string): Promise<GenericResponse<Announcement>> {
        console.log("announcementDto",announcementDto);
        const createdAnnouncement = await this.announcementRepository.create(announcementDto, uid);
        return {
            success: true,
            message: 'Announcement created successfully.',
            data: createdAnnouncement
        };
    }

    async getAllActive(uid): Promise<GenericResponse<any>> {
        const announcements = await this.announcementRepository.getAllActive(uid);
        return {
            success: true,
            message: 'Active Announcements retrieved successfully.',
            data: announcements
        };
    }

    async getResults(id:string): Promise<GenericResponse<any>> {
        const announcements = await this.announcementRepository.getResults(id);
        return {
            success: true,
            message: 'Result Announcements retrieved successfully.',
            data: announcements
        };
    }

    async UpdateSeenBy(id: string, uid: string): Promise<GenericResponse<any>> {
        const announcement = await this.announcementRepository.findById(id);
        let updatedAnnouncement = null;
        if (announcement)
        {
            let seenBy: any = announcement.seenBy;
            seenBy.push({
                user: uid,
                seenAt: new Date().toISOString(),
            })
            let announcementDto:any = {
                _id : id,
                seenBy : seenBy
            }
            updatedAnnouncement = await this.announcementRepository.update(announcementDto);
        }
        return {
            success: true,
            message: 'Announcement Updated successfully.',
            data: updatedAnnouncement
        };
    }

    async UpdateIgnoredBy(id: string, uid: string): Promise<GenericResponse<any>> {
        const announcement = await this.announcementRepository.findById(id);
        let updatedAnnouncement = null;
        if (announcement)
        {
            let ignoredBy: any = announcement.ignoredBy;
            ignoredBy.push(uid)
            let announcementDto:any = {
                _id : id,
                ignoredBy : ignoredBy
            }
            updatedAnnouncement = await this.announcementRepository.update(announcementDto);
        }
        return {
            success: true,
            message: 'Announcement ignore Updated successfully.',
            data: updatedAnnouncement
        };
    }

    

    /**
     *Get an existing sub criteria by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<Announcement>>}
     * @memberof Announcement
     */
    async get(id: string): Promise<GenericResponse<Announcement>> {
        const announcement = await this.announcementRepository.findById(id);
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }
        return {
            success: true,
            message: 'Announcement retrieved successfully.',
            data: announcement
        };
    }

    /**
     *Get all sub criterias paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof Announcement
     */
    async getAll(page: number, size: number): Promise<GenericResponse<any>> {
        const announcements = await this.announcementRepository.findAll(page, size);
        return {
            success: true,
            message: 'Announcements retrieved successfully.',
            data: announcements
        };
    }

    /**
     *update an existing sub criteria
     *
     * @param {string} id
     * @param {UpdateAnnouncement} announcementDto
     * @return {*}  {Promise<GenericResponse<UpdateAnnouncement>>}
     * @memberof Announcement
     */
    async update(announcementDto: UpdateAnnouncement): Promise<GenericResponse<UpdateAnnouncement>> {
        const announcement = await this.announcementRepository.findById(announcementDto._id);
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }
        const updatedAnnouncement = await this.announcementRepository.update(announcementDto);
        return {
            success: true,
            message: 'Announcement updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing sub criteria by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof Announcement
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const announcement = await this.announcementRepository.findById(id);
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }
        const deletedAnnouncement = await this.announcementRepository.delete(id);
        if (!deletedAnnouncement) {
            throw new NotFoundException('Announcement not found');
        }

        return {
            success: true,
            message: 'Announcement deleted successfully.',
            data: ''
        };
    }
}
