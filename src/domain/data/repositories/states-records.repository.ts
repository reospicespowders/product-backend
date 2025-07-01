import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { States, UpdateStates } from "../dto/states-records.dto";
import { StatesRepository } from "../interfaces/states-records-repository.interface";




@Injectable()
export class StatesRepositoryImpl implements StatesRepository {


    constructor(@InjectModel('Data_States') private readonly StatesModel: Model<States>) { }

    create(fieldType: States): Promise<States> {
        return this.StatesModel.create(fieldType);
    }


    update(fieldType: UpdateStates): Promise<States> {
        return this.StatesModel.findByIdAndUpdate(fieldType._id, fieldType);
    }
 

    getAll(page: number, offset: number): Promise<States[]> {
        //pagination 
        const skip: number = page * offset - offset;
        return this.StatesModel.find().limit(offset).skip(skip);
    }

    getProgress(uid : string): Promise<any[]> {
       
       let pipe = [
        {
          '$match': {
            'user._id': uid
          }
        }, {
          '$group': {
            '_id': '$service_id', 
            'viewcount': {
              '$count': {}
            }
          }
        }, {
          '$addFields': {
            '_id': {
              '$convert': {
                'input': '$_id', 
                'to': 'objectId', 
                'onError': '', 
                'onNull': ''
              }
            }
          }
        }, {
          '$lookup': {
            'from': 'data', 
            'localField': '_id', 
            'foreignField': '_id', 
            'as': 'data'
          }
        }, {
          '$addFields': {
            'data': {
              '$first': '$data'
            }
          }
        }, {
          '$addFields': {
            'data.viewcount': '$viewcount'
          }
        }, {
          '$match': {
            'data': {
              '$ne': null
            }
          }
        }, {
          '$replaceRoot': {
            'newRoot': '$data'
          }
        }, {
          '$graphLookup': {
            'from': 'organization-units', 
            'startWith': '$ous', 
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
                  'label': '$$this.name', 
                  'id': '$$this.id', 
                  'icon': '$$this.image_sq', 
                  'depth': '$$this.depth', 
                  'data_counter': '$$this.data_counter'
                }
              }
            }
          }
        }, {
          '$addFields': {
            'parent': {
              '$first': '$breadcrumbs'
            }
          }
        }, {
          '$project': {
            '_id': '$_id', 
            'name': '$name', 
            'link': {
              '$concat': [
                '/category/', {
                  '$toString': '$parent.id'
                }, '?dataId=', {
                  '$toString': '$id'
                }, '&first=0'
              ]
            }, 
            'breadcrumbs': '$breadcrumbs', 
            'ou': {
              '$reduce': {
                'input': '$breadcrumbs', 
                'initialValue': {
                  'depth': 0
                }, 
                'in': {
                  '$cond': [
                    {
                      '$gte': [
                        '$$this.depth', '$$value.depth'
                      ]
                    }, '$$this', '$$value'
                  ]
                }
              }
            }, 
            'viewcount': '$viewcount'
          }
        }
      ]
        return this.StatesModel.aggregate(pipe);
    }

    delete(_id: string): Promise<any> {
        return this.StatesModel.deleteOne({ _id })
    }

    getOne(_id: string): Promise<States> {
        return this.StatesModel.findById({ _id })
    }
}