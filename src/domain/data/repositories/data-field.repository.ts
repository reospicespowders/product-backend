import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import  { Model } from "mongoose";
import { DataFieldRepository } from "../interfaces/data-fields-repository.interface";
import { DataField, UpdateDataField } from "../dto/data-fields.dto";


@Injectable()
export class DataFieldRepositoryImpl implements DataFieldRepository {


    constructor(@InjectModel('Data-Fields') private readonly dataFieldModel: Model<DataField>) { }


    async getFieldsWithType(): Promise<any[]> {
        const pipe = [
            {
                '$lookup': {
                    'from': 'data-templates',
                    'localField': '_id',
                    'foreignField': 'fields',
                    'as': 'data-type',
                    'pipeline': [
                        {
                            '$lookup': {
                                'from': 'data-types',
                                'localField': 'type',
                                'foreignField': '_id',
                                'as': 'type'
                            }
                        }, {
                            '$replaceRoot': {
                                'newRoot': {
                                    '$first': '$type'
                                }
                            }
                        }
                    ]
                }
            }, {
                '$addFields': {
                    'data-type': {
                        '$map': {
                            'input': '$data-type',
                            'in': '$$this._id'
                        }
                    }
                }
            }
        ];

        return this.dataFieldModel.aggregate(pipe);
    }

    create(fieldType: DataField): Promise<DataField> {
        return this.dataFieldModel.create(fieldType);
    }


    update(fieldType: UpdateDataField): Promise<DataField> {
        return this.dataFieldModel.findByIdAndUpdate(fieldType._id, fieldType);
    }


    getAll(page: number, offset: number): Promise<DataField[]> {
        //pagination 
        const skip: number = page * offset - offset;
        return this.dataFieldModel.find().populate('type').limit(offset).skip(skip);
    }

    delete(_id: string): Promise<any> {
        return this.dataFieldModel.deleteOne({ _id })
    }

    getOne(_id: string): Promise<DataField> {
        return this.dataFieldModel.findById({ _id })
    }
}