import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSSubCriteria, UpdateMSSubCriteria } from 'src/domain/mystory-shopper/dto/children/ms-sub-criteria.dto';
import { MSSubCriteriaRepository } from 'src/domain/mystory-shopper/interfaces/children/ms-sub-criteria-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *MSSubCriteria Service
 *
 * @export
 * @class MSSubCriteriaService
 */
@Injectable()
export class MSSubCriteriaService {

    /**
     * Creates an instance of MSSubCriteriaService.
     * @param {MSSubCriteriaRepository} MSSubCriteriaRepository
     * @memberof MSSubCriteriaService
     */
    constructor(
        @Inject('MSSubCriteriaRepository') private msSubCriteriaRepository: MSSubCriteriaRepository,
    ) { }

    /**
     *Create a new sub criteria
     *
     * @param {MSSubCriteria} msSubCriteriaDto
     * @return {*}  {Promise<GenericResponse<MSSubCriteria>>}
     * @memberof MSSubCriteriaService
     */
    async create(msSubCriteriaDto: MSSubCriteria): Promise<GenericResponse<MSSubCriteria>> {
        const createdMSSubCriteria = await this.msSubCriteriaRepository.create(msSubCriteriaDto);
        return {
            success: true,
            message: 'MSSubCriteria created successfully.',
            data: createdMSSubCriteria
        };
    }

    /**
     *Get an existing sub criteria by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSSubCriteria>>}
     * @memberof MSSubCriteriaService
     */
    async get(id: string): Promise<GenericResponse<MSSubCriteria>> {
        const msSubCriteria = await this.msSubCriteriaRepository.findById(id);
        if (!msSubCriteria) {
            throw new NotFoundException('MSSubCriteria not found');
        }
        return {
            success: true,
            message: 'MSSubCriteria retrieved successfully.',
            data: msSubCriteria
        };
    }

    /**
     *Get all sub criterias paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSSubCriteriaService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msSubCriterias = await this.msSubCriteriaRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'MSSubCriterias retrieved successfully.',
            data: msSubCriterias
        };
    }

    /**
     *update an existing sub criteria
     *
     * @param {string} id
     * @param {UpdateMSSubCriteria} msSubCriteriaDto
     * @return {*}  {Promise<GenericResponse<UpdateMSSubCriteria>>}
     * @memberof MSSubCriteriaService
     */
    async update(id: string, msSubCriteriaDto: UpdateMSSubCriteria): Promise<GenericResponse<UpdateMSSubCriteria>> {
        const msSubCriteria = await this.msSubCriteriaRepository.findById(id);
        if (!msSubCriteria) {
            throw new NotFoundException('MSSubCriteria not found');
        }
        const updatedMSSubCriteria = await this.msSubCriteriaRepository.update(id, msSubCriteriaDto);
        return {
            success: true,
            message: 'MSSubCriteria updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing sub criteria by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSSubCriteriaService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msSubCriteria = await this.msSubCriteriaRepository.findById(id);
        if (!msSubCriteria) {
            throw new NotFoundException('MSSubCriteria not found');
        }
        const deletedMSSubCriteria = await this.msSubCriteriaRepository.delete(id);
        if (!deletedMSSubCriteria) {
            throw new NotFoundException('MSSubCriteria not found');
        }

        return {
            success: true,
            message: 'MSSubCriteria deleted successfully.',
            data: ''
        };
    }
}
