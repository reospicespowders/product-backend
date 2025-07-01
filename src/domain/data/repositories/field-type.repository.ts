import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FieldType, UpdateFieldType } from "../dto/field-type.dto";
import { FieldTypeRepository } from "../interfaces/field-type-repository.interface";



@Injectable()
export class FieldTypeRepositoryImpl implements FieldTypeRepository {


    constructor(@InjectModel('Field-Types') private readonly FieldTypeModel: Model<FieldType>) { }

    create(ouType: FieldType): Promise<FieldType> {
        return this.FieldTypeModel.create(ouType);
    }

    update(ouType: UpdateFieldType): Promise<UpdateFieldType> {
        return this.FieldTypeModel.findByIdAndUpdate(ouType._id, ouType);
    }


    getAll(page: number, offset: number): Promise<FieldType[]> {
        //pagination 
        const skip : number = page * offset - offset;
        return this.FieldTypeModel.find().limit(offset).skip(skip);
    }

    delete(_id: string): Promise<any> {
        return this.FieldTypeModel.deleteOne({ _id })
    }
}