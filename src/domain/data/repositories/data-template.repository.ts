import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DataTemplate, UpdateDataTemplate } from "../dto/data-templates.dto";
import { DataTemplateRepository } from "../interfaces/data-template-repository.interface";


// #253 Service card Template

@Injectable()
export class DataTemplateRepositoryImpl implements DataTemplateRepository {


    constructor(@InjectModel('Data-Templates') private readonly DataTemplateModel: Model<DataTemplate>) { }

    create(fieldType: DataTemplate): Promise<DataTemplate> {
        return this.DataTemplateModel.create(fieldType);
    }


    update(fieldType: UpdateDataTemplate): Promise<DataTemplate> {
        return this.DataTemplateModel.findByIdAndUpdate(fieldType._id, fieldType);
    }
 

    getAll(page: number, offset: number): Promise<DataTemplate[]> {
        //pagination 
        const skip: number = page * offset - offset;
        return this.DataTemplateModel.find().populate('type').populate('fields').populate('ou').limit(offset).skip(skip);
    }

    delete(_id: string): Promise<any> {
        return this.DataTemplateModel.deleteOne({ _id })
    }

    getOne(_id: string): Promise<DataTemplate> {
        return this.DataTemplateModel.findById({ _id })
    }

    public executePipe(pipe:Array<any>): Promise<any>{
        return this.DataTemplateModel.aggregate(pipe)
    }
    
    
    countRecord(query: any): Promise<number> {
        return this.DataTemplateModel.countDocuments(query)
    }
}