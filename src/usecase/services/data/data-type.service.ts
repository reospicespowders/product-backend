import { Inject, Injectable } from '@nestjs/common';
import { DataType, UpdateDataType } from 'src/domain/data/dto/data-type.dto';
import { DataTypeRepository } from 'src/domain/data/interfaces/data-type-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class DataTypeService {

    constructor(@Inject('DataTypeRepository') private DataTypeRepository: DataTypeRepository){}

    public async getAll(page,offset): Promise<GenericResponse<DataType[]>> {
        const res = await this.DataTypeRepository.getAll(page,offset);

        const response: GenericResponse<DataType[]> = {
            success: true,
            message: 'Data fields fetched Successfully',
            data: res,
        };
        return response;
    }


    /**
     *
     *
     * @param {DataType} data
     * @return {*}  {Promise<GenericResponse<DataType>>}
     * @memberof DataTypeService
     */
    public async create(data: DataType): Promise<GenericResponse<DataType>> {
        const res = await this.DataTypeRepository.create(data)

        const response: GenericResponse<DataType> = {
            success: true,
            message: 'Data fields added Successfully',
            data: res,
        };
        return response;
    }


    public async update(data: UpdateDataType): Promise<GenericResponse<DataType>> {
        const res = await this.DataTypeRepository.update(data);

        const response: GenericResponse<DataType> = {
            success: true,
            message: 'Data fields updated Successfully',
            data: res,
        };
        return response;
    }

    public async delete(_id: string): Promise<GenericResponse<any>> {
        const res = await this.DataTypeRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res.deletedCount > 0 ? 'Data field deleted Successfully' : 'Data field Id not found',
            data: res,
        };
        return response;
    }

    public async getOne(_id: string): Promise<GenericResponse<DataType>>{
        const res = await this.DataTypeRepository.getOne(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res ?  'Data field fetched Successfully' : 'Data field not found',
            data: res,
        };
        
        return response;
    }

}