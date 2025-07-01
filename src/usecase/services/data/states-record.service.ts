import { Inject, Injectable } from '@nestjs/common';
import { States, UpdateStates } from 'src/domain/data/dto/states-records.dto';
import { DataRepository } from 'src/domain/data/interfaces/data-repository.interface';
import { StatesRepository } from 'src/domain/data/interfaces/states-records-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class StatesService {

    constructor(@Inject('StatesRepository') private StatesRepository: StatesRepository, @Inject('DataRepository') private DataRepository: DataRepository){}

    public async getAll(page,offset): Promise<GenericResponse<States[]>> {
        const res = await this.StatesRepository.getAll(page,offset);

        const response: GenericResponse<States[]> = {
            success: true,
            message: 'States fetched Successfully',
            data: res,
        };
        return response;
    }


    /**
     *
     *
     * @param {States} data
     * @return {*}  {Promise<GenericResponse<States>>}
     * @memberof StatesService
     */
    public async create(data: States): Promise<GenericResponse<States>> {
        const res = await this.StatesRepository.create(data)

        const response: GenericResponse<States> = {
            success: true,
            message: 'States added Successfully',
            data: res,
        };
        return response;
    }


    public async update(data: UpdateStates): Promise<GenericResponse<States>> {
        const res = await this.StatesRepository.update(data);

        const response: GenericResponse<States> = {
            success: true,
            message: 'States updated Successfully',
            data: res,
        };
        return response;
    }

    public async delete(_id: string): Promise<GenericResponse<any>> {
        const res = await this.StatesRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res.deletedCount > 0 ? 'States deleted Successfully' : 'StatesId not found',
            data: res,
        };
        return response;
    }

    public async getOne(_id: string): Promise<GenericResponse<States>>{
        const res = await this.StatesRepository.getOne(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res ?  'States fetched Successfully' : 'States not found',
            data: res,
        };
        
        return response;
    }

    public async getProgress(uid: string): Promise<GenericResponse<any>>{
        const res = await this.StatesRepository.getProgress(uid);

        const dataCount = await this.DataRepository.countRecord({})
        const response: GenericResponse<any> = {
            success: true,
            message: res ?  'Progress fetched Successfully' : 'Progress not found',
            data: {
                progress : res,
                totalDataCount : dataCount
            },
        };
        
        return response;
    }

}