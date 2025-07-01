import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SettingsRepository } from "../interfaces/settings.interface";
import { Settings, UpdateSettings } from "../dto/settings.dto";




@Injectable()
export class SettingsRepositoryImpl implements SettingsRepository {


    constructor(@InjectModel('Settings') private readonly SettingsModel: Model<Settings>) { }

    create(ouType: Settings): Promise<Settings> {
        return this.SettingsModel.create(ouType);
    }

    update(ouType: UpdateSettings): Promise<UpdateSettings> {
        return this.SettingsModel.findByIdAndUpdate(ouType._id, ouType);
    }


    getAll(page: number, offset: number): Promise<Settings[]> {
        //pagination 
        const skip : number = page * offset - offset;
        return this.SettingsModel.find().limit(offset).skip(skip);
    }

    delete(_id: string): Promise<any> {
        return this.SettingsModel.deleteOne({ _id })
    }
}