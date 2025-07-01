import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSFactor, UpdateMSFactor } from 'src/domain/mystory-shopper/dto/children/ms-factors.dto';
import { MSFactorRepository } from 'src/domain/mystory-shopper/interfaces/children/ms-factors-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSFactorResponsible } from 'src/domain/mystory-shopper/dto/children/ms-factor-responsible.dto';
import { MSFactorStatusUpdateDto } from 'src/domain/mystory-shopper/dto/children/ms-factor-status-update.dto';


/**
 *MSFactor Service
 *
 * @export
 * @class MSFactorService
 */
@Injectable()
export class MSFactorService {

    /**
     * Creates an instance of MSFactorService.
     * @param {MSFactorRepository} MSFactorRepository
     * @memberof MSFactorService
     */
    constructor(
        @Inject('MSFactorRepository') private msFactorRepository: MSFactorRepository,
    ) { }

    public async assignResponsible(dtos: MSFactorResponsible[]): Promise<GenericResponse<null>> {
        await this.msFactorRepository.assignResponsible(dtos);
        return {
            success: true,
            message: 'Responsibles assigned successfully.',
            data: null
        };
    }

    public async updateResponsible(dto: MSFactorResponsible): Promise<GenericResponse<null>> {
        await this.msFactorRepository.updateResponsible(dto);
        return {
            success: true,
            message: 'Responsibles updated successfully.',
            data: null
        };
    }

    public async updateFactorStatus(factorStatusData: MSFactorStatusUpdateDto[], userId: string): Promise<GenericResponse<null>> {
        await this.msFactorRepository.updateFactorStatus(factorStatusData, userId);
        return {
            success: true,
            message: 'Factor status updated successfully.',
            data: null
        };
    }

    public async updateFactorStatusApproval(factorStatusData: MSFactorStatusUpdateDto, userId: string): Promise<GenericResponse<null>> {
        await this.msFactorRepository.updateFactorStatusApproval(factorStatusData, userId);
        return {
            success: true,
            message: 'Factor status updated successfully.',
            data: null
        };
    }

    /**
     *Create a new factor
     *
     * @param {MSFactor} msFactorDto
     * @return {*}  {Promise<GenericResponse<MSFactor>>}
     * @memberof MSFactorService
     */
    async create(msFactorDto: MSFactor): Promise<GenericResponse<MSFactor>> {
        const createdMSFactor = await this.msFactorRepository.create(msFactorDto);
        return {
            success: true,
            message: 'MSFactor created successfully.',
            data: createdMSFactor
        };
    }

    /**
     *Get an existing factor by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSFactor>>}
     * @memberof MSFactorService
     */
    async get(id: string): Promise<GenericResponse<MSFactor>> {
        const msFactor = await this.msFactorRepository.findById(id);
        if (!msFactor) {
            throw new NotFoundException('MSFactor not found');
        }
        return {
            success: true,
            message: 'MSFactor retrieved successfully.',
            data: msFactor
        };
    }

    /**
     *Get all factor logs paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string} projectId
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSFactorService
     */
    async getAll(page: number, size: number, projectId: string): Promise<GenericResponse<any>> {
        const msFactors = await this.msFactorRepository.findAll(page, size, projectId);
        return {
            success: true,
            message: 'MSFactors retrieved successfully.',
            data: msFactors
        };
    }

    /**
     *Update an existing factor log
     *
     * @param {string} id
     * @param {UpdateMSFactor} msFactorDto
     * @return {*}  {Promise<GenericResponse<UpdateMSFactor>>}
     * @memberof MSFactorService
     */
    async update(id: string, msFactorDto: UpdateMSFactor): Promise<GenericResponse<UpdateMSFactor>> {
        const msFactor = await this.msFactorRepository.findById(id);
        if (!msFactor) {
            throw new NotFoundException('MSFactor not found');
        }
        const updatedMSFactor = await this.msFactorRepository.update(id, msFactorDto);
        return {
            success: true,
            message: 'MSFactor updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing factor
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSFactorService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msFactor = await this.msFactorRepository.findById(id);
        if (!msFactor) {
            throw new NotFoundException('MSFactor not found');
        }
        const deletedMSFactor = await this.msFactorRepository.delete(id);
        if (!deletedMSFactor) {
            throw new NotFoundException('MSFactor not found');
        }

        return {
            success: true,
            message: 'Dashboard data fetched successfully.',
            data: ''
        };
    }


    async getForDashboard(projectId: string): Promise<any> {
        let res = await this.msFactorRepository.getForDashboard(projectId);
        return {
            success: true,
            message: 'MSFactor deleted successfully.',
            data: res[0]
        };
    }
}
