import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSStep, UpdateMSStep } from 'src/domain/mystory-shopper/dto/ms-step.dto';
import { MSStepRepository } from 'src/domain/mystory-shopper/interfaces/ms-step-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *MSStep Service
 *
 * @export
 * @class MSStepService
 */
@Injectable()
export class MSStepService {

    /**
     * Creates an instance of MSStepService.
     * @param {MSStepRepository} MSStepRepository
     * @memberof MSStepService
     */
    constructor(
        @Inject('MSStepRepository') private msStepRepository: MSStepRepository,
    ) { }

    /**
     *Cretate a new step
     *
     * @param {MSStep} msStepDto
     * @return {*}  {Promise<GenericResponse<MSStep>>}
     * @memberof MSStepService
     */
    async create(msStepDto: MSStep): Promise<GenericResponse<MSStep>> {
        const createdMSStep = await this.msStepRepository.create(msStepDto);
        return {
            success: true,
            message: 'MSStep created successfully.',
            data: createdMSStep
        };
    }

    /**
     *Get an existing step by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSStep>>}
     * @memberof MSStepService
     */
    async get(id: string): Promise<GenericResponse<MSStep>> {
        const msStep = await this.msStepRepository.findById(id);
        if (!msStep) {
            throw new NotFoundException('MSStep not found');
        }
        return {
            success: true,
            message: 'MSStep retrieved successfully.',
            data: msStep
        };
    }

    async getByProject(id: string, type: string, vendorType:string): Promise<GenericResponse<MSStep>> {
        const msStep = await this.msStepRepository.getByProject(id,type,vendorType);
        if (!msStep) {
            throw new NotFoundException('MSStep not found');
        }
        return {
            success: true,
            message: 'MSStep retrieved successfully.', 
            data: msStep 
        };
    }

    async getByProjectSession(id: string, sessionId: string, type: string, vendorType:string): Promise<GenericResponse<MSStep>> {
        const msStep = await this.msStepRepository.getByProjectSession(id,sessionId,type,vendorType);
        if (!msStep) {
            throw new NotFoundException('MSStep not found');
        }
        return {
            success: true,
            message: 'MSStep retrieved successfully.', 
            data: msStep 
        };
    }

    async getAllByProject(id: string): Promise<GenericResponse<MSStep[]>> {
        const msStep = await this.msStepRepository.getAllByProject(id);
        if (!msStep) {
            throw new NotFoundException('MSStep not found');
        }
        return {
            success: true,
            message: 'MSStep retrieved successfully.',
            data: msStep
        };
    }

    /**
     *Get all steps paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSStepService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msSteps = await this.msStepRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'MSSteps retrieved successfully.',
            data: msSteps
        };
    }

    /**
     *Update an existing step
     *
     * @param {string} id
     * @param {UpdateMSStep} msStepDto
     * @return {*}  {Promise<GenericResponse<UpdateMSStep>>}
     * @memberof MSStepService
     */
    async update(id: string, msStepDto: UpdateMSStep): Promise<GenericResponse<UpdateMSStep>> {
        const msStep = await this.msStepRepository.findById(id);
        if (!msStep) {
            throw new NotFoundException('MSStep not found');
        }
        const updatedMSStep = await this.msStepRepository.update(id, msStepDto);
        return {
            success: true,
            message: 'MSStep updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing step
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSStepService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msStep = await this.msStepRepository.findById(id);
        if (!msStep) {
            throw new NotFoundException('MSStep not found');
        }
        const deletedMSStep = await this.msStepRepository.delete(id);
        if (!deletedMSStep) {
            throw new NotFoundException('MSStep not found');
        }

        return {
            success: true,
            message: 'MSStep deleted successfully.',
            data: ''
        };
    }
}
