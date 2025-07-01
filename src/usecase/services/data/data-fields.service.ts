import { Inject, Injectable } from '@nestjs/common';
import { DataField, UpdateDataField } from 'src/domain/data/dto/data-fields.dto';
import { DataFieldRepository } from 'src/domain/data/interfaces/data-fields-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class DataFieldService {

    constructor(@Inject('DataFieldRepository') private dataFieldRepository: DataFieldRepository){}

    public async getAll(page,offset): Promise<GenericResponse<DataField[]>> {
        const res = await this.dataFieldRepository.getAll(page,offset);

        const response: GenericResponse<DataField[]> = {
            success: true,
            message: 'Data fields fetched Successfully',
            data: res,
        };
        return response;
    }

    async getFieldsWithType():Promise<GenericResponse<DataField[]>> {
        const res = await this.dataFieldRepository.getFieldsWithType();

        const response: GenericResponse<DataField[]> = {
            success: true,
            message: 'Data fields fetched Successfully',
            data: res,
        };
        return response;
    }


    public async create(data: DataField): Promise<GenericResponse<DataField>> {
        const res = await this.dataFieldRepository.create(data)

        const response: GenericResponse<DataField> = {
            success: true,
            message: 'Data fields added Successfully',
            data: res,
        };
        return response;
    }


    public async update(data: UpdateDataField): Promise<GenericResponse<DataField>> {
        const res = await this.dataFieldRepository.update(data);

        const response: GenericResponse<DataField> = {
            success: true,
            message: 'Data fields updated Successfully',
            data: res,
        };
        return response;
    }

    public async delete(_id: string): Promise<GenericResponse<any>> {
        const res = await this.dataFieldRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res.deletedCount > 0 ? 'Data field deleted Successfully' : 'Data field Id not found',
            data: res,
        };
        return response;
    }

    public async getOne(_id: string): Promise<GenericResponse<DataField>>{
        const res = await this.dataFieldRepository.getOne(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res ?  'Data field fetched Successfully' : 'Data field not found',
            data: res,
        };
        
        return response;
    }

}