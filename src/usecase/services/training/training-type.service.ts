import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { TrainingType, UpdateTrainingType } from 'src/domain/training/dto/training-type.dto';
import { TrainingTypeRepository } from 'src/domain/training/interfaces/training-type-repository.interface';

@Injectable()
export class TrainingTypeService {

    constructor(@Inject('TrainingTypeRepository') private TrainingTypeRepository: TrainingTypeRepository){}

    /**
     *
     *
     * @param {*} page
     * @param {*} offset
     * @return {*}  {Promise<GenericResponse<TrainingType[]>>}
     * @memberof TrainingTypeService
     */
    public async getAll(page,offset): Promise<GenericResponse<TrainingType[]>> {
        const res = await this.TrainingTypeRepository.getAll(page,offset);

        const response: GenericResponse<TrainingType[]> = {
            success: true,
            message: 'Training type fetched Successfully',
            data: res,
        };
        return response;
    }


    /**
     *
     *
     * @param {TrainingType} data
     * @return {*}  {Promise<GenericResponse<TrainingType>>}
     * @memberof TrainingTypeService
     */
    public async create(data: TrainingType): Promise<GenericResponse<TrainingType>> {
        const res = await this.TrainingTypeRepository.create(data)

        const response: GenericResponse<TrainingType> = {
            success: true,
            message: 'Training type added Successfully',
            data: res,
        };
        return response;
    }


    /**
     *
     *
     * @param {UpdateTrainingType} data
     * @return {*}  {Promise<GenericResponse<TrainingType>>}
     * @memberof TrainingTypeService
     */
    public async update(data: UpdateTrainingType): Promise<GenericResponse<TrainingType>> {
        const res = await this.TrainingTypeRepository.update(data);

        const response: GenericResponse<TrainingType> = {
            success: true,
            message: 'Training type updated Successfully',
            data: res,
        };
        return response;
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof TrainingTypeService
     */
    public async delete(_id: string): Promise<GenericResponse<any>> {
        const res = await this.TrainingTypeRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res.deletedCount > 0 ? 'Training type deleted Successfully' : 'Training type Id not found',
            data: res,
        };
        return response;
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<TrainingType>>}
     * @memberof TrainingTypeService
     */
    public async getOne(_id: string): Promise<GenericResponse<TrainingType>>{
        const res = await this.TrainingTypeRepository.getOne(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res ?  'Training type fetched Successfully' : 'Training type not found',
            data: res,
        };
        
        return response;
    }

}