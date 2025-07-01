import { Injectable } from "@nestjs/common";
import { OUCategory, UpdateOUCategory } from "../dto/ou-category.dto";
import { OUCategoryRepository } from "../interfaces/ou-category-interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";



/**
 *
 *
 * @export
 * @class OUCategoryRepositoryImpl
 * @implements {OUCategoryRepository}
 */
@Injectable()
export class OUCategoryRepositoryImpl implements OUCategoryRepository {


    /**
     * Creates an instance of OUCategoryRepositoryImpl.
     * @param {Model<OUCategory>} ouCategoryModel
     * @memberof OUCategoryRepositoryImpl
     */
    constructor(@InjectModel('OU-Category') private readonly ouCategoryModel: Model<OUCategory>) { }


    /**
     *
     *
     * @param {OUCategory} ouCategory
     * @return {*}  {Promise<OUCategory>}
     * @memberof OUCategoryRepositoryImpl
     */
    create(ouCategory: OUCategory): Promise<OUCategory> {
        return this.ouCategoryModel.create(ouCategory);
    }


    /**
     *
     *
     * @return {*}  {Promise<OUCategory[]>}
     * @memberof OUCategoryRepositoryImpl
     */
    getAll(): Promise<OUCategory[]> {
        return this.ouCategoryModel.find();
    }


    /**
     *
     *
     * @param {UpdateOUCategory} ouCategory
     * @return {*}  {Promise<OUCategory>}
     * @memberof OUCategoryRepositoryImpl
     */
    update(ouCategory: UpdateOUCategory): Promise<OUCategory> {
        return this.ouCategoryModel.findByIdAndUpdate(ouCategory._id, ouCategory);
    }


    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof OUCategoryRepositoryImpl
     */
    delete(_id: string): Promise<any> {
        return this.ouCategoryModel.deleteOne({ _id })
    }

}