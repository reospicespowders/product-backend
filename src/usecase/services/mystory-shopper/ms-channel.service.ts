import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSChannel, UpdateMSChannel } from 'src/domain/mystory-shopper/dto/ms-channel.dto';
import { MSChannelRepository } from 'src/domain/mystory-shopper/interfaces/ms-channel-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *MSChannel Service
 *
 * @export
 * @class MSChannelService
 */
@Injectable()
export class MSChannelService {

    /**
     * Creates an instance of MSChannelService.
     * @param {MSChannelRepository} MSChannelRepository
     * @memberof MSChannelService
     */
    constructor(
        @Inject('MSChannelRepository') private msChannelRepository: MSChannelRepository,
    ) { }


    /**
     *Get existing channels by project by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSChannel[]>>}
     * @memberof MSChannelService
     */
    async getByProjectId(id: string): Promise<GenericResponse<MSChannel[]>> {
        const msChannels = await this.msChannelRepository.findByProjectId(id);
        if (!msChannels) {
            throw new NotFoundException('MSChannel not found');
        }
        return {
            success: true,
            message: 'MSChannel retrieved successfully.',
            data: msChannels
        };
    }

    async getVisitProjectId(id: string, sessionId:string): Promise<GenericResponse<MSChannel[]>> {
        const msChannels = await this.msChannelRepository.getVisitProjectId(id,sessionId);
        if (!msChannels) {
            throw new NotFoundException('MSChannel Visits not found');
        }
        return {
            success: true,
            message: 'MSChannel retrieved successfully.',
            data: msChannels
        };
    }


    /**
     *Create a new channel
     *
     * @param {MSChannel} msChannelDto
     * @return {*}  {Promise<GenericResponse<MSChannel>>}
     * @memberof MSChannelService
     */
    async create(msChannelDto: MSChannel): Promise<GenericResponse<MSChannel>> {
        const createdMSChannel = await this.msChannelRepository.create(msChannelDto);
        return {
            success: true,
            message: 'MSChannel created successfully.',
            data: createdMSChannel
        };
    }


    /**
     *Create multiple channels at once
     *
     * @param {MSChannel[]} msChannelDto
     * @return {*}  {Promise<GenericResponse<MSChannel[]>>}
     * @memberof MSChannelService
     */
    async createMany(msChannelDto: MSChannel[]): Promise<GenericResponse<MSChannel[]>> {
        const createdMSChannel = await this.msChannelRepository.createMany(msChannelDto);
        return {
            success: true,
            message: 'MSChannel created successfully.',
            data: createdMSChannel
        };
    }


    /**
     *Get Channel by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSChannel>>}
     * @memberof MSChannelService
     */
    async get(id: string): Promise<GenericResponse<MSChannel>> {
        const msChannel = await this.msChannelRepository.findById(id);
        if (!msChannel) {
            throw new NotFoundException('MSChannel not found');
        }
        return {
            success: true,
            message: 'MSChannel retrieved successfully.',
            data: msChannel
        };
    }


    /**
     *Get all channels paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSChannelService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msChannels = await this.msChannelRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'MSChannels retrieved successfully.',
            data: msChannels
        };
    }


    /**
     *Update an existing channel
     *
     * @param {string} id
     * @param {UpdateMSChannel} msChannelDto
     * @return {*}  {Promise<GenericResponse<UpdateMSChannel>>}
     * @memberof MSChannelService
     */
    async update(id: string, msChannelDto: UpdateMSChannel): Promise<GenericResponse<UpdateMSChannel>> {
        const msChannel = await this.msChannelRepository.findById(id);
        if (!msChannel) {
            throw new NotFoundException('MSChannel not found');
        }
        const updatedMSChannel = await this.msChannelRepository.update(id, msChannelDto);
        return {
            success: true,
            message: 'MSChannel updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing channel by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSChannelService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msChannel = await this.msChannelRepository.findById(id);
        if (!msChannel) {
            throw new NotFoundException('MSChannel not found');
        }
        const deletedMSChannel = await this.msChannelRepository.delete(id);
        if (!deletedMSChannel) {
            throw new NotFoundException('MSChannel not found');
        }

        return {
            success: true,
            message: 'MSChannel deleted successfully.',
            data: ''
        };
    }


    /**
     *Get project channels with criteria populated and paginated
     *
     * @param {string} id
     * @param {number} page
     * @param {number} size
     * @return {*} 
     * @memberof MSChannelService
     */
    async getChannelsWithCriteria(id: string, page: number, size: number) {
        let data = await this.msChannelRepository.getChannelsWithCriterias(id, page, size);
        return {
            success: true,
            message: 'MSChannels retrieved successfully.',
            data: data
        };
    }
}
