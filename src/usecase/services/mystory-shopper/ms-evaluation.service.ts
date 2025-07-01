import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSEvaluation, UpdateMSEvaluation } from 'src/domain/mystory-shopper/dto/ms-evaluation.dto';
import { MSEvaluationRepository } from 'src/domain/mystory-shopper/interfaces/ms-evaluation-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *MSEvaluation Service
 *
 * @export
 * @class MSEvaluationService
 */
@Injectable()
export class MSEvaluationService {
    /**
     * Creates an instance of MSEvaluationService.
     * @param {MSEvaluationRepository} MSEvaluationRepository
     * @memberof MSEvaluationService
     */
    constructor(
        @Inject('MSEvaluationRepository') private msEvaluationRepository: MSEvaluationRepository,
    ) { }


    /**
     *Create a new evaluation
     *
     * @param {MSEvaluation} msEvaluationDto
     * @return {*}  {Promise<GenericResponse<MSEvaluation>>}
     * @memberof MSEvaluationService
     */
    async create(msEvaluationDto: MSEvaluation): Promise<GenericResponse<MSEvaluation>> {
        const createdMSEvaluation = await this.msEvaluationRepository.create(msEvaluationDto);
        return {
            success: true,
            message: 'MSEvaluation created successfully.',
            data: createdMSEvaluation
        };
    }

    async getFactorView(projectId: string,uid:string): Promise<GenericResponse<any>> {
        const factors = await this.msEvaluationRepository.getFactorView(projectId,uid);
        return {
            success: true,
            message: 'Factors retrieved successfully.',
            data: factors
        };
    }


    /**
     *Get an existing evaluation by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSEvaluation>>}
     * @memberof MSEvaluationService
     */
    async get(id: string): Promise<GenericResponse<MSEvaluation>> {
        const msEvaluation = await this.msEvaluationRepository.findById(id);
        if (!msEvaluation) {
            throw new NotFoundException('MSEvaluation not found');
        }
        return {
            success: true,
            message: 'MSEvaluation retrieved successfully.',
            data: msEvaluation
        };
    }

    /**
     *Get all evaluations paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSEvaluationService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msEvaluations = await this.msEvaluationRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'MSEvaluations retrieved successfully.',
            data: msEvaluations
        };
    }

    /**
     *Get all evaluations by project id
     *
     * @param {string} projectId
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSEvaluationService
     */
    async getByProject(projectId: string): Promise<GenericResponse<any>> {
        const msEvaluations = await this.msEvaluationRepository.getByProject(projectId);
        return {
            success: true,
            message: 'MSEvaluations retrieved successfully.',
            data: msEvaluations
        };
    }

    /**
     *Update an existing evaluation
     *
     * @param {string} id
     * @param {UpdateMSEvaluation} msEvaluationDto
     * @return {*}  {Promise<GenericResponse<UpdateMSEvaluation>>}
     * @memberof MSEvaluationService
     */
    async update(id: string, msEvaluationDto: UpdateMSEvaluation): Promise<GenericResponse<UpdateMSEvaluation>> {
        const msEvaluation = await this.msEvaluationRepository.findById(id);
        if (!msEvaluation) {
            throw new NotFoundException('MSEvaluation not found');
        }
        const updatedMSEvaluation = await this.msEvaluationRepository.update(id, msEvaluationDto);
        return {
            success: true,
            message: 'MSEvaluation updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing evaluation
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSEvaluationService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msEvaluation = await this.msEvaluationRepository.findById(id);
        if (!msEvaluation) {
            throw new NotFoundException('MSEvaluation not found');
        }
        const deletedMSEvaluation = await this.msEvaluationRepository.delete(id);
        if (!deletedMSEvaluation) {
            throw new NotFoundException('MSEvaluation not found');
        }

        return {
            success: true,
            message: 'MSEvaluation deleted successfully.',
            data: ''
        };
    }
}
