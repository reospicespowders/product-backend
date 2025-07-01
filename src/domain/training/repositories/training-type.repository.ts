import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TrainingType, UpdateTrainingType } from "../dto/training-type.dto";
import { TrainingTypeRepository } from "../interfaces/training-type-repository.interface";




@Injectable()
export class TrainingTypeRepositoryImpl implements TrainingTypeRepository {


    constructor(@InjectModel('Training_Type') private readonly TrainingTypeModel: Model<TrainingType>) { }

    /**
     *
     *
     * @param {TrainingType} data
     * @return {*}  {Promise<TrainingType>}
     * @memberof TrainingTypeRepositoryImpl
     */
    create(data: TrainingType): Promise<TrainingType> {
        return this.TrainingTypeModel.create(data);
    }


    /**
     *
     *
     * @param {UpdateTrainingType} data
     * @return {*}  {Promise<TrainingType>}
     * @memberof TrainingTypeRepositoryImpl
     */
    update(data: UpdateTrainingType): Promise<TrainingType> {
        return this.TrainingTypeModel.findByIdAndUpdate(data._id, data);
    }
 

    /**
     *
     *
     * @param {number} page
     * @param {number} offset
     * @return {*}  {Promise<TrainingType[]>}
     * @memberof TrainingTypeRepositoryImpl
     */
    getAll(page: number, offset: number): Promise<TrainingType[]> {
        //pagination 
        const skip: number = page * offset - offset;
        return this.TrainingTypeModel.find().limit(offset).populate({path:'allowed_ou', select:"name"}).skip(skip);
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof TrainingTypeRepositoryImpl
     */
    delete(_id: any): Promise<any> {
        // console.log("===......>",_id)
        return this.TrainingTypeModel.deleteOne({ _id })
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<TrainingType>}
     * @memberof TrainingTypeRepositoryImpl
     */
    getOne(_id: string): Promise<TrainingType> {
        return this.TrainingTypeModel.findById({ _id })
    }
}