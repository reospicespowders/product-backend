import { Inject, Injectable } from '@nestjs/common';
import { FieldType, UpdateFieldType } from 'src/domain/data/dto/field-type.dto';
import { FieldTypeRepository } from 'src/domain/data/interfaces/field-type-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class FieldTypeService {
    constructor(@Inject('FieldTypeRepository') private FieldTypeRepository: FieldTypeRepository) { }


    public async getAll(page, offset): Promise<GenericResponse<FieldType[]>> {
        const res = await this.FieldTypeRepository.getAll(page, offset);

        const response: GenericResponse<FieldType[]> = {
            success: true,
            message: 'Field type fetched Successfully',
            data: res,
        };
        return response;
    }


    public async create(data: FieldType): Promise<GenericResponse<FieldType>> {
        const res = await this.FieldTypeRepository.create(data)

        const response: GenericResponse<FieldType> = {
            success: true,
            message: 'Field type added Successfully',
            data: res,
        };
        return response;
    }


    public async update(data: UpdateFieldType): Promise<GenericResponse<FieldType>> {
        const res = await this.FieldTypeRepository.update(data);

        const response: GenericResponse<FieldType> = {
            success: true,
            message: 'Field type updated Successfully',
            data: res,
        };
        return response;
    }

    public async delete(_id: string): Promise<GenericResponse<any>> {
        const res = await this.FieldTypeRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: 'Field type deleted Successfully',
            data: res,
        };
        return response;
    }

}