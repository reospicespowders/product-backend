import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { OUType, UpdateOUType } from 'src/domain/ou-type/dto/ou-type.dto';
import { OUTypeRepository } from 'src/domain/ou-type/interfaces/ou-type-repository.interface';

/**
 *
 *
 * @export
 * @class OuTypeService
 */
@Injectable()
export class OuTypeService {


    /**
     * Creates an instance of OuTypeService.
     * @param {OUTypeRepository} ouTypeRepository
     * @memberof OuTypeService
     */
    constructor(@Inject('OUTypeRepository') private ouTypeRepository: OUTypeRepository) { }

    /**
     *
     *
     * @return {*}  {Promise<GenericResponse<OUType[]>>}
     * @memberof OuTypeService
     */
    public async getAll(page,offset): Promise<GenericResponse<OUType[]>> {
        let data = await this.ouTypeRepository.getAll();

        const response: GenericResponse<OUType[]> = {
            success: true,
            message: 'Types fetched Successfully',
            data: data,
        };
        return response;

    }

    /**
     *
     *
     * @param {OUType} ouType
     * @return {*}  {Promise<GenericResponse<OUType>>}
     * @memberof OuTypeService
     */
    public async create(ouType: OUType): Promise<GenericResponse<OUType>> {
        let data = await this.ouTypeRepository.create(ouType);

        const response: GenericResponse<OUType> = {
            success: true,
            message: 'Type added Successfully',
            data: data,
        };
        return response;

    }

    /**
     *
     *
     * @param {UpdateOUType} ouTypeUpdateDto
     * @return {*}  {Promise<GenericResponse<OUType>>}
     * @memberof OuTypeService
     */
    public async update(ouTypeUpdateDto: UpdateOUType): Promise<GenericResponse<OUType>> {
        let data = await this.ouTypeRepository.update(ouTypeUpdateDto);

        const response: GenericResponse<OUType> = {
            success: true,
            message: 'Type updated Successfully',
            data: data,
        };
        return response;

    }

    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof OuTypeService
     */
    public async delete(_id: string): Promise<GenericResponse<any>> {
        let data = await this.ouTypeRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: 'Type deleted Successfully',
            data: data,
        };
        return response;

    }

    /**
     *
     *
     * @return {*}  {Promise<GenericResponse<OUType[]>>}
     * @memberof OuTypeService
     */
    public async getBranches(): Promise<GenericResponse<OUType[]>> {
        let data = await this.ouTypeRepository.getBranches();

        const response: GenericResponse<OUType[]> = {
            success: true,
            message: 'Brances fetched Successfully',
            data: data,
        };
        return response;

    }

}
