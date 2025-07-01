import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { KLibraryLogRepository } from "../interfaces/klibrary-log-repository.interface";
import { KLibraryLog, UpdateKLibraryLog } from "../dto/Klibrary-log.dto";



/**
 *Knowledge library repository implementation
 *
 * @export
 * @class KLIbraryLogRepositoryImpl
 * @implements {KLibraryLogRepository}
 */
@Injectable()
export class KLibraryLogRepositoryImpl implements KLibraryLogRepository {


    /**
     * Creates an instance of KLIbraryLogRepositoryImpl.
     * @param {Model<KLibraryLog>} klLogModel
     * @memberof KLLibraryLogRepositoryImpl
     */
    constructor(@InjectModel('Kl-Logs') private readonly klLogModel: Model<KLibraryLog>) { }


    /**
     *Create new category
     *
     * @param {KLibraryLog} kLibrary
     * @return {*}  {Promise<KLibraryLog>}
     * @memberof KLLibraryLogRepositoryImpl
     */
    create(kLibrary: KLibraryLog): Promise<KLibraryLog> {
        // console.log("===data",kLibrary);
        return this.klLogModel.create(kLibrary);
    }


    findById(_id: string) {
        return this.klLogModel.findById(_id);
    }


    /**
     *Get all available categories
     *
     * @return {*}  {Promise<KLibraryLog[]>}
     * @memberof KLLibraryLogRepositoryImpl
     */
    getAll(page,offset,query): Promise<KLibraryLog[]> {
        const skip: number = page * offset - offset;
        return this.klLogModel.find(query).limit(offset).skip(skip).populate({path:'createdBy', select:'name'}).populate({path:'approvedBy', select:'name'}).sort({createdAt : -1 });
    }


    count(query):Promise<any>{
        return this.klLogModel.countDocuments(query);
    }

    /**
     *Update a category
     *
     * @param {UpdateKLibraryCategory} kLibrary
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof KLIbraryLogRepositoryImpl
     */
    update(kLibrary: UpdateKLibraryLog): Promise<any> {
        return this.klLogModel.updateOne({ _id: kLibrary._id }, kLibrary);
    }


    /**
     *Delete a category
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof KLIbraryLogRepositoryImpl
     */
    delete(_id: string): Promise<any> {
        return this.klLogModel.deleteOne({ _id });
    }

}