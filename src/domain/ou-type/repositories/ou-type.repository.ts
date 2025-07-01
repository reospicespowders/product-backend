import { Injectable } from "@nestjs/common";
import { OUTypeRepository } from "../interfaces/ou-type-repository.interface";
import { OUType, UpdateOUType } from "../dto/ou-type.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

/**
 *
 *
 * @export
 * @class OUTypeRepositoryImpl
 * @implements {OUTypeRepository}
 */
@Injectable()
export class OUTypeRepositoryImpl implements OUTypeRepository {


    /**
     * Creates an instance of OUTypeRepositoryImpl.
     * @param {Model<OUType>} ouTypeModel
     * @memberof OUTypeRepositoryImpl
     */
    constructor(@InjectModel('OU-Type') private readonly ouTypeModel: Model<OUType>) { }


    /**
     *
     *
     * @param {OUType} ouType
     * @return {*}  {Promise<OUType>}
     * @memberof OUTypeRepositoryImpl
     */
    create(ouType: OUType): Promise<OUType> {
        return this.ouTypeModel.create(ouType);
    }


    /**
     *
     *
     * @param {UpdateOUType} ouType
     * @return {*}  {Promise<OUType>}
     * @memberof OUTypeRepositoryImpl
     */
    update(ouType: UpdateOUType): Promise<OUType> {
        return this.ouTypeModel.findByIdAndUpdate(ouType._id, ouType);
    }


    /**
     *
     *
     * @return {*}  {Promise<OUType[]>}
     * @memberof OUTypeRepositoryImpl
     */
    getAll(): Promise<OUType[]> {
        return this.ouTypeModel.find();
    }


    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof OUTypeRepositoryImpl
     */
    delete(_id: string): Promise<any> {
        return this.ouTypeModel.deleteOne({ _id })
    }

    /**
     *
     *
     * @return {*}  {Promise<OUType[]>}
     * @memberof OUTypeRepositoryImpl
     */
    async getBranches(): Promise<OUType[]> {

        const pipe = [
            {
              '$match': {
                'tag': 'Branches'
              }
            }, {
              '$lookup': {
                'from': 'organization-units', 
                'localField': '_id', 
                'foreignField': 'type', 
                'as': 'result', 
                'pipeline': [
                  {
                    '$project': {
                      'name': 1, 
                      'parent': 1, 
                      'category': 1, 
                      'type': 1, 
                      'location': 1, 
                      'image': 1, 
                      'image_sq': 1
                    }
                  }
                ]
              }
            }, {
              '$unwind': {
                'path': '$result'
              }
            }, {
              '$replaceRoot': {
                'newRoot': '$result'
              }
            }, {
              '$graphLookup': {
                'from': 'organization-units', 
                'startWith': '$parent', 
                'connectFromField': 'parent', 
                'connectToField': '_id', 
                'depthField': 'depth', 
                'as': 'breadcrumbs'
              }
            }, {
              '$addFields': {
                'breadcrumbs': {
                  '$map': {
                    'input': '$breadcrumbs', 
                    'in': {
                      '_id': '$$this._id', 
                      'label': '$$this.name', 
                      'id': '$$this.id', 
                      'icon': '$$this.image_sq', 
                      'depth': '$$this.depth'
                    }
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'org-types', 
                'localField': 'type', 
                'foreignField': '_id', 
                'as': 'type', 
                'pipeline': [
                  {
                    '$project': {
                      'name': 1, 
                      'icon': 1, 
                      'tag': 1
                    }
                  }
                ]
              }
            }, {
              '$lookup': {
                'from': 'locations', 
                'localField': 'location', 
                'foreignField': '_id', 
                'as': 'location', 
                'pipeline': [
                  {
                    '$project': {
                      'name': 1
                    }
                  }
                ]
              }
            }, {
              '$lookup': {
                'from': 'org-categories', 
                'localField': 'category', 
                'foreignField': '_id', 
                'as': 'category', 
                'pipeline': [
                  {
                    '$project': {
                      'name': 1, 
                      'icon': 1
                    }
                  }
                ]
              }
            }, {
              '$addFields': {
                'category': {
                  '$first': '$category'
                }, 
                'type': {
                  '$first': '$type'
                }, 
                'location': {
                  '$first': '$location'
                }
                }
            }
        ];
        return await this.ouTypeModel.aggregate(pipe);
    }

}