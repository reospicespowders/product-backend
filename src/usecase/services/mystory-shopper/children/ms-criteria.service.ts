import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSCriteria, UpdateMSCriteria } from 'src/domain/mystory-shopper/dto/children/ms-criteria.dto';
import { MSCriteriaRepository } from 'src/domain/mystory-shopper/interfaces/children/ms-criteria-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *MSCriteria Service
 *
 * @export
 * @class MSCriteriaService
 */
@Injectable()
export class MSCriteriaService {

    /**
     * Creates an instance of MSCriteriaService.
     * @param {MSCriteriaRepository} MSCriteriaRepository
     * @memberof MSCriteriaService
     */
    constructor(
        @Inject('MSCriteriaRepository') private msCriteriaRepository: MSCriteriaRepository,
    ) { }

    /**
     *Create a new criteria
     *
     * @param {MSCriteria} msCriteriaDto
     * @return {*}  {Promise<GenericResponse<MSCriteria>>}
     * @memberof MSCriteriaService
     */
    async create(msCriteriaDto: MSCriteria): Promise<GenericResponse<MSCriteria>> {
        const createdMSCriteria = await this.msCriteriaRepository.create(msCriteriaDto);
        return {
            success: true,
            message: 'MSCriteria created successfully.',
            data: createdMSCriteria
        };
    }

    /**
     *get all criterias by project id
     *
     * @param {string} id
     * @param {number} page
     * @param {number} size
     * @return {*} 
     * @memberof MSCriteriaService
     */
    async getByProjectId(id: string, page: number, size: number) {
        const msCriterias = await this.msCriteriaRepository.getByProject(id, page, size);
        return {
            success: true,
            message: 'MSCriterias retrieved successfully.',
            data: msCriterias
        };
    }

    /**
     *Get an existing criteria by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSCriteria>>}
     * @memberof MSCriteriaService
     */
    async get(id: string): Promise<GenericResponse<MSCriteria>> {
        const msCriteria = await this.msCriteriaRepository.findById(id);
        if (!msCriteria) {
            throw new NotFoundException('MSCriteria not found');
        }
        return {
            success: true,
            message: 'MSCriteria retrieved successfully.',
            data: msCriteria
        };
    }

    /**
     *Get all criterias paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSCriteriaService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msCriterias = await this.msCriteriaRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'MSCriterias retrieved successfully.',
            data: msCriterias
        };
    }

    /**
     *Update an existing criteria
     *
     * @param {string} id
     * @param {UpdateMSCriteria} msCriteriaDto
     * @return {*}  {Promise<GenericResponse<UpdateMSCriteria>>}
     * @memberof MSCriteriaService
     */
    async update(id: string, msCriteriaDto: UpdateMSCriteria): Promise<GenericResponse<UpdateMSCriteria>> {
        const msCriteria = await this.msCriteriaRepository.findById(id);
        if (!msCriteria) {
            throw new NotFoundException('MSCriteria not found');
        }
        const updatedMSCriteria = await this.msCriteriaRepository.update(id, msCriteriaDto);
        return {
            success: true,
            message: 'MSCriteria updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing criteria
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSCriteriaService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msCriteria = await this.msCriteriaRepository.findById(id);
        if (!msCriteria) {
            throw new NotFoundException('MSCriteria not found');
        }
        const deletedMSCriteria = await this.msCriteriaRepository.delete(id);
        if (!deletedMSCriteria) {
            throw new NotFoundException('MSCriteria not found');
        }

        return {
            success: true,
            message: 'MSCriteria deleted successfully.',
            data: ''
        };
    }
}
