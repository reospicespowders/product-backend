import { InjectModel } from "@nestjs/mongoose";
import { KLibrary, UpdateKLibrary } from "../dto/klibrary.dto";
import { KLIbraryRepository } from "../interfaces/klibrary-repository.interface";
import { Model, UpdateWriteOpResult } from "mongoose";
import { Injectable } from "@nestjs/common";
import { KLibraryCategory } from "../dto/klibrary-category.dto";


/**
 *Knowledge library repository implementation
 *
 * @export
 * @class KLIbraryRepositoryImpl
 * @implements {KLIbraryRepository}
 */
@Injectable()
export class KLIbraryRepositoryImpl implements KLIbraryRepository {


    /**
     * Creates an instance of KLIbraryRepositoryImpl.
     * @param {Model<KLibrary>} kLibraryModel
     * @memberof KLIbraryRepositoryImpl
     */
    constructor(@InjectModel('knowledge-library') private readonly kLibraryModel: Model<KLibrary>) { }


    updateByName(name: string, category: KLibraryCategory): Promise<UpdateWriteOpResult> {
        return this.kLibraryModel.updateMany(
            { categoryname: name },
            { $set: { categoryname: category.name, categoryicon: category.icon } }
        )
    }

    /**
     *Create new Knowledge Library
     *
     * @param {KLibrary} kLibrary
     * @return {*}  {Promise<KLibrary>}
     * @memberof KLIbraryRepositoryImpl
     */
    create(kLibrary: KLibrary): Promise<KLibrary> {
        return this.kLibraryModel.create(kLibrary);
    }


    /**
     *Get all available knowledge libraries
     *
     * @return {*}  {Promise<KLibrary[]>}
     * @memberof KLIbraryRepositoryImpl
     */
    getAll(): Promise<KLibrary[]> {
        return this.kLibraryModel.find().populate('ou');
    }


    /**
     *Update a knowledge library
     *
     * @param {UpdateKLibrary} kLibrary
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof KLIbraryRepositoryImpl
     */
    update(kLibrary: UpdateKLibrary): Promise<UpdateWriteOpResult> {
        return this.kLibraryModel.updateOne({ _id: kLibrary._id }, kLibrary);
    }


    /**
     *Delete a knowledge library
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof KLIbraryRepositoryImpl
     */
    delete(_id: string): Promise<any> {
        return this.kLibraryModel.deleteOne({ _id });
    }

    /**
     *Delete multiple knowledge libraries based on a condition
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof KLIbraryRepositoryImpl
     */
    deleteMany(query: any): Promise<any> {
        return this.kLibraryModel.deleteOne(query);
    }

}