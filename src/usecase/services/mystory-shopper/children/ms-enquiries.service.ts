import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSEnquiry, UpdateMSEnquiry } from 'src/domain/mystory-shopper/dto/children/ms-enquiries.dto';
import { MSEnquiryRepository } from 'src/domain/mystory-shopper/interfaces/children/ms-enquiries-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *MSEnquiry Service
 *
 * @export
 * @class MSEnquiryService
 */
@Injectable()
export class MSEnquiryService {

    /**
     * Creates an instance of MSEnquiryService.
     * @param {MSEnquiryRepository} MSEnquiryRepository
     * @memberof MSEnquiryService
     */
    constructor(
        @Inject('MSEnquiryRepository') private msEnquiryRepository: MSEnquiryRepository,
    ) { }

    /**
     *Get all enquiries by project
     *
     * @param {number} page
     * @param {number} size
     * @param {string} projectId
     * @return {*} 
     * @memberof MSEnquiryService
     */
    async getByProject(page: number, size: number, projectId: string) {
        const msEnquiry = await this.msEnquiryRepository.getByProject(page, size, projectId);
        return {
            success: true,
            message: 'MSEnquiry retrieved successfully.',
            data: msEnquiry
        };
    }

    /**
     *Create a new enquiry
     *
     * @param {MSEnquiry} msEnquiryDto
     * @return {*}  {Promise<GenericResponse<MSEnquiry>>}
     * @memberof MSEnquiryService
     */
    async create(msEnquiryDto: MSEnquiry): Promise<GenericResponse<MSEnquiry>> {
        const createdMSEnquiry = await this.msEnquiryRepository.create(msEnquiryDto);
        return {
            success: true,
            message: 'MSEnquiry created successfully.',
            data: createdMSEnquiry
        };
    }

    /**
     *Get en existing exquiry by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSEnquiry>>}
     * @memberof MSEnquiryService
     */
    async get(id: string): Promise<GenericResponse<MSEnquiry>> {
        const msEnquiry = await this.msEnquiryRepository.findById(id);
        if (!msEnquiry) {
            throw new NotFoundException('MSEnquiry not found');
        }
        return {
            success: true,
            message: 'MSEnquiry retrieved successfully.',
            data: msEnquiry
        };
    }

    /**
     *Get all enquiries paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSEnquiryService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msEnquirys = await this.msEnquiryRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'MSEnquirys retrieved successfully.',
            data: msEnquirys
        };
    }

    /**
     *Update an existing enquiry
     *
     * @param {string} id
     * @param {UpdateMSEnquiry} msEnquiryDto
     * @return {*}  {Promise<GenericResponse<UpdateMSEnquiry>>}
     * @memberof MSEnquiryService
     */
    async update(id: string, msEnquiryDto: UpdateMSEnquiry): Promise<GenericResponse<UpdateMSEnquiry>> {
        const msEnquiry = await this.msEnquiryRepository.findById(id);
        if (!msEnquiry) {
            throw new NotFoundException('MSEnquiry not found');
        }
        const updatedMSEnquiry = await this.msEnquiryRepository.update(id, msEnquiryDto);
        return {
            success: true,
            message: 'MSEnquiry updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing enquiry
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSEnquiryService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msEnquiry = await this.msEnquiryRepository.findById(id);
        if (!msEnquiry) {
            throw new NotFoundException('MSEnquiry not found');
        }
        const deletedMSEnquiry = await this.msEnquiryRepository.delete(id);
        if (!deletedMSEnquiry) {
            throw new NotFoundException('MSEnquiry not found');
        }

        return {
            success: true,
            message: 'MSEnquiry deleted successfully.',
            data: ''
        };
    }
}
