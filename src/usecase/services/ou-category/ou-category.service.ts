import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { OUCategory, UpdateOUCategory } from 'src/domain/ou-category/dto/ou-category.dto';
import { OUCategoryRepository } from 'src/domain/ou-category/interfaces/ou-category-interface';

@Injectable()
export class OuCategoryService {

    constructor(@Inject('OUCategoryRepository') private ouCategoryRepository: OUCategoryRepository) { }

    public async getAll(page,offset): Promise<GenericResponse<OUCategory[]>> {
        const res = await this.ouCategoryRepository.getAll();

        const response: GenericResponse<OUCategory[]> = {
            success: true,
            message: 'Categories fetched Successfully',
            data: res,
        };
        return response;
    }

    public async create(ouCategory: OUCategory): Promise<GenericResponse<OUCategory>> {
        const res = await this.ouCategoryRepository.create(ouCategory);

        const response: GenericResponse<OUCategory> = {
            success: true,
            message: 'Category created Successfully',
            data: res,
        };
        return response;
    }

    public async update(updateOUCategoryDto: UpdateOUCategory): Promise<GenericResponse<OUCategory>> {
        const res = await this.ouCategoryRepository.update(updateOUCategoryDto);

        const response: GenericResponse<OUCategory> = {
            success: true,
            message: 'Category updated Successfully',
            data: res,
        };
        return response;
    }

    public async delete(_id: string):Promise<GenericResponse<any>> {
        const res = await this.ouCategoryRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: 'Categories deleted Successfully',
            data: res,
        };
        return response;
    }
}
