import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import { KLibraryCategoryRepository } from "../interfaces/klibrary-category-repository.interface";
import { KLibraryCategory, UpdateKLibraryCategory } from "../dto/klibrary-category.dto";
import { Injectable } from "@nestjs/common";


/**
 *Knowledge library repository implementation
 *
 * @export
 * @class KLIbraryCategoryRepositoryImpl
 * @implements {KLibraryCategoryRepository}
 */
@Injectable()
export class KLIbraryCategoryRepositoryImpl implements KLibraryCategoryRepository {


    /**
     * Creates an instance of KLIbraryCategoryRepositoryImpl.
     * @param {Model<KLibraryCategory>} klCategoryModel
     * @memberof KLIbraryCategoryRepositoryImpl
     */
    constructor(@InjectModel('knowledge-library-category') private readonly klCategoryModel: Model<KLibraryCategory>) { }


    /**
     *Create new category
     *
     * @param {KLibraryCategory} kLibrary
     * @return {*}  {Promise<KLibraryCategory>}
     * @memberof KLIbraryCategoryRepositoryImpl
     */
    create(kLibrary: KLibraryCategory): Promise<KLibraryCategory> {
        return this.klCategoryModel.create(kLibrary);
    }


    findById(_id: string) {
        return this.klCategoryModel.findById(_id);
    }


    /**
     *Get all available categories
     *
     * @return {*}  {Promise<KLibraryCategory[]>}
     * @memberof KLIbraryCategoryRepositoryImpl
     */
    getAll(): Promise<KLibraryCategory[]> {
        return this.klCategoryModel.find();
    }


    /**
     *Update a category
     *
     * @param {UpdateKLibraryCategory} kLibrary
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof KLIbraryCategoryRepositoryImpl
     */
    update(kLibrary: UpdateKLibraryCategory): Promise<UpdateWriteOpResult> {
        return this.klCategoryModel.updateOne({ _id: kLibrary._id }, kLibrary);
    }


    /**
     *Delete a category
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof KLIbraryCategoryRepositoryImpl
     */
    delete(_id: string): Promise<any> {
        return this.klCategoryModel.deleteOne({ _id });
    }

}