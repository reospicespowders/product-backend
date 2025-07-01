import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSMeasuringType, UpdateMSMeasuringType } from 'src/domain/mystory-shopper/dto/children/ms-measuring-types.dto';
import { MSMeasuringTypeRepository } from 'src/domain/mystory-shopper/interfaces/children/ms-measuring-type-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *MSMeasuringType Service
 *
 * @export
 * @class MSMeasuringTypeService
 */
@Injectable()
export class MSMeasuringTypeService {

    /**
     * Creates an instance of MSMeasuringTypeService.
     * @param {MSMeasuringTypeRepository} MSMeasuringTypeRepository
     * @memberof MSMeasuringTypeService
     */
    constructor(
        @Inject('MSMeasuringTypeRepository') private msMeasuringTypeRepository: MSMeasuringTypeRepository,
    ) { }

    /**
     *Create a new measurting type 
     *
     * @param {MSMeasuringType} msMeasuringTypeDto
     * @return {*}  {Promise<GenericResponse<MSMeasuringType>>}
     * @memberof MSMeasuringTypeService
     */
    async create(msMeasuringTypeDto: MSMeasuringType): Promise<GenericResponse<MSMeasuringType>> {
        const createdMSMeasuringType = await this.msMeasuringTypeRepository.create(msMeasuringTypeDto);
        return {
            success: true,
            message: 'MSMeasuringType created successfully.',
            data: createdMSMeasuringType
        };
    }

    /**
     *Get existing measurting type by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSMeasuringType>>}
     * @memberof MSMeasuringTypeService
     */
    async get(id: string): Promise<GenericResponse<MSMeasuringType>> {
        const msMeasuringType = await this.msMeasuringTypeRepository.findById(id);
        if (!msMeasuringType) {
            throw new NotFoundException('MSMeasuringType not found');
        }
        return {
            success: true,
            message: 'MSMeasuringType retrieved successfully.',
            data: msMeasuringType
        };
    }

    /**
     *Get all existing measurting types paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSMeasuringTypeService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msMeasuringTypes = await this.msMeasuringTypeRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'MSMeasuringTypes retrieved successfully.',
            data: msMeasuringTypes
        };
    }

    /**
     *Update an existing measurting type
     *
     * @param {string} id
     * @param {UpdateMSMeasuringType} msMeasuringTypeDto
     * @return {*}  {Promise<GenericResponse<UpdateMSMeasuringType>>}
     * @memberof MSMeasuringTypeService
     */
    async update(id: string, msMeasuringTypeDto: UpdateMSMeasuringType): Promise<GenericResponse<UpdateMSMeasuringType>> {
        const msMeasuringType = await this.msMeasuringTypeRepository.findById(id);
        if (!msMeasuringType) {
            throw new NotFoundException('MSMeasuringType not found');
        }
        const updatedMSMeasuringType = await this.msMeasuringTypeRepository.update(id, msMeasuringTypeDto);
        return {
            success: true,
            message: 'MSMeasuringType updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing measurting type by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSMeasuringTypeService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msMeasuringType = await this.msMeasuringTypeRepository.findById(id);
        if (!msMeasuringType) {
            throw new NotFoundException('MSMeasuringType not found');
        }
        const deletedMSMeasuringType = await this.msMeasuringTypeRepository.delete(id);
        if (!deletedMSMeasuringType) {
            throw new NotFoundException('MSMeasuringType not found');
        }

        return {
            success: true,
            message: 'MSMeasuringType deleted successfully.',
            data: ''
        };
    }
}
