import { Inject, Injectable } from '@nestjs/common';
import { DataTemplate, UpdateDataTemplate } from 'src/domain/data/dto/data-templates.dto';
import { DataTemplateRepository } from 'src/domain/data/interfaces/data-template-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { Types } from "mongoose";

// #253 Service card Template

@Injectable()
export class DataTemplateService {

  constructor(@Inject('DataTemplateRepository') private DataTemplateRepository: DataTemplateRepository) { }

  public async getAll(page: number, offset: number): Promise<GenericResponse<DataTemplate[]>> {
    const res = await this.DataTemplateRepository.getAll(page, offset);

    const response: GenericResponse<DataTemplate[]> = {
      success: true,
      message: 'Data templates fetched Successfully',
      data: res,
    };
    return response;
  }


  public async create(data: DataTemplate): Promise<GenericResponse<DataTemplate>> {
    const res = await this.DataTemplateRepository.create(data)

    const response: GenericResponse<DataTemplate> = {
      success: true,
      message: 'Data templates added Successfully',
      data: res,
    };
    return response;
  }


  public async update(data: UpdateDataTemplate): Promise<GenericResponse<DataTemplate>> {
    const res = await this.DataTemplateRepository.update(data);

    const response: GenericResponse<DataTemplate> = {
      success: true,
      message: 'Data templates updated Successfully',
      data: res,
    };
    return response;
  }

  public async delete(_id: string): Promise<GenericResponse<any>> {
    const res = await this.DataTemplateRepository.delete(_id);

    const response: GenericResponse<any> = {
      success: true,
      message: res.deletedCount > 0 ? 'Data template deleted Successfully' : 'Data template Id not found',
      data: res,
    };
    return response;
  }

  public async getOne(_id: string): Promise<GenericResponse<DataTemplate>> {
    const res = await this.DataTemplateRepository.getOne(_id);

    const response: GenericResponse<any> = {
      success: true,
      message: res ? 'Data template fetched Successfully' : 'Data template not found',
      data: res,
    };

    return response;
  }

  public async getPopulatedData(filter: DataTemplate, page: number, offset: number): Promise<GenericResponse<any>> {
    try {
      const totalData = await this.DataTemplateRepository.countRecord(filter);
      const pipe = [
        {
          '$match': {
            'active': filter.active,
            type: new Types.ObjectId(filter.type)
          }
        }, {
          '$lookup': {
            'from': 'data-types',
            'localField': 'type',
            'foreignField': '_id',
            'as': 'type'
          }
        }, {
          '$lookup': {
            'from': 'data-fields',
            'localField': 'fields',
            'foreignField': '_id',
            'as': 'fields'
          }
        }, {
          '$unwind': {
            'path': '$fields',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'field-types',
            'localField': 'fields.type',
            'foreignField': '_id',
            'as': 'fields.type'
          }
        }, {
          '$addFields': {
            'fields.type': {
              '$ifNull': [
                {
                  '$first': '$fields.type'
                }, null
              ]
            },
            'type': {
              '$ifNull': [
                {
                  '$first': '$type'
                }, null
              ]
            }
          }
        }, {
          '$group': {
            '_id': '$_id',
            'name': {
              '$first': '$name'
            },
            'type': {
              '$first': '$type'
            },
            'fields': {
              '$addToSet': '$fields'
            },
            'active': {
              '$first': '$active'
            }
          }
        }
      ]

      const data = await this.DataTemplateRepository.executePipe(pipe)
      const response: GenericResponse<any> = {
        success: true,
        message: data ? 'Data template fetched Successfully' : 'Data template not found',
        data: {
          data: data,
          totalData: totalData
        },
      };

      return response
    } catch (error) {
      throw new Error(error);
    }
  }

  public async getAllDataTemplatesDataCreation(filter: DataTemplate, page: number, offset: number): Promise<GenericResponse<any>> {
    try {

      //getting total record Count
      const totalData = await this.DataTemplateRepository.countRecord(filter);

      const pipe = [
        {
          '$match': {
            'active': filter.active,
            'type': new Types.ObjectId(filter.type)
          }
        }, {
          '$lookup': {
            'from': 'organization-units',
            'localField': 'ou',
            'foreignField': '_id',
            'pipeline': [
              {
                '$graphLookup': {
                  'from': 'organization-units',
                  'startWith': '$_id',
                  'connectFromField': '_id',
                  'connectToField': 'parent',
                  'as': 'children',
                  'depthField': 'depth'
                }
              }
            ],
            'as': 'ou'
          }
        }, {
          '$addFields': {
            'ous': {
              '$first': '$ou.children'
            },
            'ou': {
              '$first': '$ou._id'
            }
          }
        }, {
          '$addFields': {
            'ous': {
              '$map': {
                'input': '$ous',
                'in': {
                  '_id': '$$this._id',
                  'depth': {
                    '$add': [
                      '$$this.depth', 1
                    ]
                  }
                }
              }
            }
          }
        }, {
          '$addFields': {
            'ou': {
              '$concatArrays': [
                [
                  {
                    '_id': '$ou',
                    'depth': 0
                  }
                ], '$ous'
              ]
            }
          }
        }, {
          '$unset': 'ous'
        }, {
          '$lookup': {
            'from': 'data-types',
            'localField': 'type',
            'foreignField': '_id',
            'as': 'type'
          }
        }, {
          '$lookup': {
            'from': 'data-fields',
            'localField': 'fields',
            'foreignField': '_id',
            'as': 'fields'
          }
        }, {
          '$unwind': {
            'path': '$fields',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'field-types',
            'localField': 'fields.type',
            'foreignField': '_id',
            'as': 'fields.type'
          }
        }, {
          '$addFields': {
            'fields.type': {
              '$ifNull': [
                {
                  '$first': '$fields.type'
                }, null
              ]
            },
            'type': {
              '$ifNull': [
                {
                  '$first': '$type'
                }, null
              ]
            }
          }
        }, {
          '$group': {
            '_id': '$_id',
            'name': {
              '$first': '$name'
            },
            'type': {
              '$first': '$type'
            },
            'fields': {
              '$addToSet': '$fields'
            },
            'active': {
              '$first': '$active'
            },
            'ou': {
              '$first': '$ou'
            },
            'standard': {
              '$first': '$standard'
            }
          }
        }
      ]

      const data = await this.DataTemplateRepository.executePipe(pipe)

      const response: GenericResponse<any> = {
        success: true,
        message: data ? 'Data template fetched Successfully' : 'Data template not found',
        data: {
          data: data,
          totalData: totalData
        },
      };

      return response
    } catch (error) {
      throw new Error(error);
    }
  }


}