import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DataType, UpdateDataType } from "../dto/data-type.dto";
import { DataTypeRepository } from "../interfaces/data-type-repository.interface";



@Injectable()
export class DataTypeRepositoryImpl implements DataTypeRepository {


    constructor(@InjectModel('Data-Type') private readonly DataTypeModel: Model<DataType>) { }

    create(fieldType: DataType): Promise<DataType> {
        return this.DataTypeModel.create(fieldType);
    }


    update(fieldType: UpdateDataType): Promise<DataType> {
        return this.DataTypeModel.findByIdAndUpdate(fieldType._id, fieldType);
    }
 

    getAll(page: number, offset: number): Promise<DataType[]> {
        //pagination 
        const skip: number = page * offset - offset;
        return this.DataTypeModel.find().limit(offset).skip(skip);
    }

    delete(_id: string): Promise<any> {
        return this.DataTypeModel.deleteOne({ _id })
    }

    getOne(_id: string): Promise<DataType> {
        return this.DataTypeModel.findById({ _id })
    }
}