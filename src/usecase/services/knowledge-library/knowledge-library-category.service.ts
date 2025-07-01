import { Inject, Injectable } from '@nestjs/common';
import { UpdateWriteOpResult } from 'mongoose';
import { GenericResponse } from 'src/domain/dto/generic';
import { KLibraryCategory, UpdateKLibraryCategory } from 'src/domain/knowledge_library/dto/klibrary-category.dto';
import { KLibraryCategoryRepository } from 'src/domain/knowledge_library/interfaces/klibrary-category-repository.interface';
import { KLIbraryRepository } from 'src/domain/knowledge_library/interfaces/klibrary-repository.interface';

@Injectable()
export class KnowledgeLibraryCategoryService {

    constructor(
        @Inject('KLibraryCategoryRepository') private klCategoryRepository: KLibraryCategoryRepository,
        @Inject('KLibraryRepository') private kLibraryRepository: KLIbraryRepository
    ) { }

    public async create(kLibraryCategory: KLibraryCategory): Promise<GenericResponse<KLibraryCategory>> {
        let data = await this.klCategoryRepository.create(kLibraryCategory);

        let response: GenericResponse<KLibraryCategory> = {
            success: true,
            message: 'Knowledge library category created successfully',
            data: data,
        };

        return response;

    }

    public async getAll(page:number,offset:number): Promise<GenericResponse<KLibraryCategory[]>> {
        let data = await this.klCategoryRepository.getAll();
        let response: GenericResponse<KLibraryCategory[]> = {
            success: true,
            message: 'Knowledge library categories fetched successfully',
            data: data,
        };

        return response;
    }

    public async update(kLibraryCategory: UpdateKLibraryCategory): Promise<GenericResponse<null>> {
        let res: UpdateWriteOpResult = await this.klCategoryRepository.update(kLibraryCategory);

        let response: GenericResponse<null> = {
            success: false,
            message: 'Failed to update Knowledge library category',
            data: null,
        };

        if (res.modifiedCount === 1) {
            response = {
                success: true,
                message: 'Knowledge library category updated successfully',
                data: null,
            };
        }
        return response;
    }

    public async delete(_id: string, deleteData: boolean, changeCategory: KLibraryCategory): Promise<GenericResponse<null>> {
        let response: GenericResponse<null>;

        const findItem = await this.klCategoryRepository.findById(_id);
        if (findItem) {
            const result = await this.klCategoryRepository.delete(_id);
            if (result.deletedCount === 1) {
                if (deleteData == true) {
                    const deleteitems = await this.kLibraryRepository.deleteMany({ categoryname: findItem.categoryname });
                    response = {
                        success: true,
                        message: "knowledge library item was deleted and deleted items from category " + findItem.name + " with count of " + deleteitems.deletedCount,
                        data: null
                    }
                } else {
                    const updateitems = await this.kLibraryRepository.updateByName(findItem.name, changeCategory);

                    response = {
                        success: true,
                        message: "knowledge library category was updated and updated items from category " + findItem.name + " to " + changeCategory.name + " with count of " + updateitems.modifiedCount,
                        data: null,
                    }
                }

            } else {
                response = {
                    success: false,
                    message: "it was not deleted",
                    data: null,
                }
            }
        } else {
            response = {
                success: false,
                message: "Already deleted",
                data: null
            }
        }
        return response;
    }
}
