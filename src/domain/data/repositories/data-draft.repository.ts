import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DataDraft, UpdateDataDraft } from "../dto/data-draft.dto";
import { DataDraftRepository } from "../interfaces/data-draft-repository.interface";



@Injectable()
export class DataDraftRepositoryImpl implements DataDraftRepository {


    constructor(@InjectModel('Data_Draft') private readonly DataDraftModel: Model<DataDraft>) { }

    create(fieldType: DataDraft): Promise<DataDraft> {
        return this.DataDraftModel.create(fieldType);
    }


    update(fieldType: UpdateDataDraft): Promise<DataDraft> {
        return this.DataDraftModel.findByIdAndUpdate(fieldType._id, fieldType);
    }
 

    getAll(page: number, offset: number): Promise<DataDraft[]> {
        //pagination 
        const skip: number = page * offset - offset;
        return this.DataDraftModel.find().limit(offset).skip(skip);
    }

    delete(_id: string): Promise<any> {
        return this.DataDraftModel.deleteOne({ _id })
    }

    getOne(_id: string): Promise<DataDraft> {
        return this.DataDraftModel.findById({ _id })
    }
}