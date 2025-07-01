import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, PipelineStage, Types } from "mongoose";
import { ContentUpdateRepository } from "../interfaces/content-update-repository.interface";
import { ContentUpdate, UpdateContentUpdate } from "../dto/content-update.dto";
import { Data, UpdateData } from "../dto/data.dto";



@Injectable()
export class ContentUpdateRepositoryImpl implements ContentUpdateRepository {

  constructor(
    @InjectModel('content-updates') private readonly ContentUpdateModel: Model<ContentUpdate>,
    @InjectModel('Data') private readonly DataModel: Model<Data>,
  ) { }

  async create(data: ContentUpdate): Promise<ContentUpdate> {
    try {
      let updatePipe: any = [
        {
          '$match': {
            'idstring': null
          }
        }, {
          '$graphLookup': {
            'from': 'organization-units',
            'startWith': '$ous',
            'connectFromField': 'parent',
            'connectToField': '_id',
            'depthField': 'depth',
            'as': 'idstring'
          }
        }, {
          '$addFields': {
            'idstring': {
              '$reduce': {
                'input': '$idstring',
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
            }
          }
        }, {
          '$addFields': {
            'idstring': {
              '$concat': [
                {
                  '$toString': '$idstring.id'
                }, ' ', {
                  '$toString': '$id'
                }, ' ', {
                  '$toString': '$idstring.id'
                }, {
                  '$toString': '$id'
                }
              ]
            }
          }
        }, {
          '$merge': {
            'into': 'data',
            'on': '_id',
            'whenMatched': 'replace',
            'whenNotMatched': 'insert'
          }
        }
      ];
      let res = await this.ContentUpdateModel.create(data);
      this.DataModel.aggregate(updatePipe);
      return res;
    } catch (error) {
      throw new Error(error)
    }
  }

  multipleDelete(data: Array<ContentUpdate>): Promise<any> {
    try {
      return this.ContentUpdateModel.insertMany(data);
    } catch (error) {
      throw new Error(error)
    }
  }

  async populateProperty(data: ContentUpdate, field: string[]): Promise<ContentUpdate> {
    let doc = new this.ContentUpdateModel(data);
    let populatedDoc = await doc.populate(field);
    return populatedDoc;
  }


  async update(data: UpdateContentUpdate): Promise<ContentUpdate | any> {
    try {
      const updateLog = await this.ContentUpdateModel.updateOne(
        { _id: data._id },
        { $set: data },
      );
      if (updateLog.modifiedCount <= 0) throw new Error("Log update fail !");
      return data

    } catch (error) {
      throw new Error(error)
    }
  }


  getAll(query: any, page: number, offset: number): Promise<ContentUpdate[]> {
    //pagination 
    const limit: number = +offset
    const skip: number = page * offset - offset;

    if (query.ous && !Array.isArray(query.ous)) {
      query.ous = new Types.ObjectId(query.ous)
    }

    if (query.ous && Array.isArray(query.ous)) {
      query.ous = { '$in': query.ous.map(e => new Types.ObjectId(e)) }
    }

    if (query.updated_by) {
      query.updated_by = new Types.ObjectId(query.updated_by)
    }

    if (query.approved_by) {
      query.approved_by = new Types.ObjectId(query.approved_by)
    }

    if (query.createdAt) {
      query.createdAt['$gte'] ? query.createdAt['$gte'] = new Date(query.createdAt['$gte']) : null
      query.createdAt['$lte'] ? query.createdAt['$lte'] = new Date(query.createdAt['$lte']) : null
    }

    if (query.updatedAt) {
      query.updatedAt['$gte'] ? query.updatedAt['$gte'] = new Date(query?.updatedAt['$gte']) : null
      query.updatedAt['$lte'] ? query.updatedAt['$lte'] = new Date(query?.updatedAt['$lte']) : null
    }


    if (query['$text'] && query['$text'] != undefined && query['$text'] != '') {

      let searchText = query['$text']
      let textQuery = searchText['$search']
      delete query['$text']

      let searchpipe: PipelineStage[] =
        [
          {
            '$match': {
              '$text': searchText
            }
          }, {
            '$graphLookup': {
              'from': 'organization-units',
              'startWith': '$ous',
              'connectFromField': 'parent',
              'connectToField': '_id',
              'as': 'string'
            }
          }, {
            '$addFields': {
              'ous': '$string._id'
            }
          }, {
            '$addFields': {
              'score': {
                '$regexMatch': {
                  'input': '$after.name',
                  'regex': textQuery
                }
              }
            }
          }, {
            '$addFields': {
              'score': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$score', true
                    ]
                  },
                  'then': 2,
                  'else': 1
                }
              }
            }
          }, {
            '$addFields': {
              'score': {
                '$multiply': [
                  '$score', { "$meta": "textScore" }
                ]
              },
              'data_type': {
                '$ifNull': [
                  '$data_type', '$after.type', '$data_type'
                ]
              }
            }
          }, {
            '$unset': 'string'
          }, {
            '$match': query
          }, {
            '$facet': {
              'data': [
                {
                  '$sort': {
                    "score": -1
                  }
                }, {
                  '$skip': skip
                }, {
                  '$limit': limit
                }, {
                  '$lookup': {
                    'from': 'users',
                    'localField': 'updated_by',
                    'foreignField': '_id',
                    'as': 'updated_by',
                    'pipeline': [
                      {
                        '$project': {
                          'name': 1,
                          'email': 1,
                          'phone': 1,
                          'gender': 1,
                          'ou': 1,
                          'location': 1
                        }
                      }, {
                        '$lookup': {
                          'from': 'organization-units',
                          'localField': 'ou',
                          'foreignField': '_id',
                          'as': 'ou',
                          'pipeline': [
                            {
                              '$project': {
                                'name': 1,
                                'image': 1
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
                        '$unwind': {
                          'path': '$location',
                          'preserveNullAndEmptyArrays': true
                        }
                      }
                    ]
                  }
                }, {
                  '$lookup': {
                    'from': 'users',
                    'localField': 'approved_by',
                    'foreignField': '_id',
                    'as': 'approved_by',
                    'pipeline': [
                      {
                        '$project': {
                          'name': 1,
                          'email': 1,
                          'phone': 1,
                          'gender': 1,
                          'ou': 1,
                          'location': 1
                        }
                      }, {
                        '$lookup': {
                          'from': 'organization-units',
                          'localField': 'ou',
                          'foreignField': '_id',
                          'as': 'ou',
                          'pipeline': [
                            {
                              '$project': {
                                'name': 1,
                                'image': 1
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
                        '$unwind': {
                          'path': '$location',
                          'preserveNullAndEmptyArrays': true
                        }
                      }
                    ]
                  }
                }, {
                  '$addFields': {
                    'approved_by': {
                      '$first': '$approved_by'
                    },
                    'updated_by': {
                      '$first': '$updated_by'
                    }
                  }
                }
              ],
              'total': [
                {
                  '$count': 'total'
                }
              ],
              'stats_type': [
                {
                  '$group': {
                    '_id': '$type',
                    'count': {
                      '$count': {}
                    }
                  }
                }
              ],
              'data_type': [
                {
                  '$addFields': {
                    'data_type': {
                      '$ifNull': [
                        '$data_type', '$after.type', '$data_type'
                      ]
                    }
                  }
                }, {
                  '$group': {
                    '_id': '$data_type',
                    'count': {
                      '$count': {}
                    }
                  }
                }, {
                  '$addFields': {
                    '_id': {
                      '$toObjectId': '$_id'
                    }
                  }
                }, {
                  '$lookup': {
                    'from': 'data-types',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': '_id',
                    'pipeline': [
                      {
                        '$project': {
                          'arabic': 1
                        }
                      }
                    ]
                  }
                }, {
                  '$addFields': {
                    '_id': {
                      '$first': '$_id.arabic'
                    }
                  }
                }
              ]
            }
          }, {
            '$addFields': {
              'total': {
                '$first': '$total.total'
              }
            }
          }
        ]

      return this.ContentUpdateModel.aggregate(searchpipe)
    }
    else {


      let sortQuery
      if (query.status == 'PENDING') {
        sortQuery = { createdAt: -1 };
      }
      else {
        sortQuery = { updatedAt: -1 };
      }

      return this.ContentUpdateModel.aggregate([
        {
          '$graphLookup': {
            'from': 'organization-units',
            'startWith': '$ous',
            'connectFromField': 'parent',
            'connectToField': '_id',
            'as': 'string'
          }
        }, {
          '$addFields': {
            'ous': '$string._id'
          }
        }, {
          '$unset': 'string'
        }, {
          '$match': query
        }, {
          '$facet': {
            'data': [
              {
                '$sort': sortQuery
              }, {
                '$skip': skip
              }, {
                '$limit': limit
              }, {
                '$lookup': {
                  'from': 'users',
                  'localField': 'updated_by',
                  'foreignField': '_id',
                  'as': 'updated_by',
                  'pipeline': [
                    {
                      '$project': {
                        'name': 1,
                        'email': 1,
                        'phone': 1,
                        'gender': 1,
                        'ou': 1,
                        'location': 1
                      }
                    }, {
                      '$lookup': {
                        'from': 'organization-units',
                        'localField': 'ou',
                        'foreignField': '_id',
                        'as': 'ou',
                        'pipeline': [
                          {
                            '$project': {
                              'name': 1,
                              'image': 1
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
                      '$unwind': {
                        'path': '$location',
                        'preserveNullAndEmptyArrays': true
                      }
                    }
                  ]
                }
              }, {
                '$lookup': {
                  'from': 'users',
                  'localField': 'approved_by',
                  'foreignField': '_id',
                  'as': 'approved_by',
                  'pipeline': [
                    {
                      '$project': {
                        'name': 1,
                        'email': 1,
                        'phone': 1,
                        'gender': 1,
                        'ou': 1,
                        'location': 1
                      }
                    }, {
                      '$lookup': {
                        'from': 'organization-units',
                        'localField': 'ou',
                        'foreignField': '_id',
                        'as': 'ou',
                        'pipeline': [
                          {
                            '$project': {
                              'name': 1,
                              'image': 1
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
                      '$unwind': {
                        'path': '$location',
                        'preserveNullAndEmptyArrays': true
                      }
                    }

                  ]
                }
              }, {
                '$addFields': {
                  'approved_by': {
                    '$first': '$approved_by'
                  },
                  'updated_by': {
                    '$first': '$updated_by'
                  }
                }
              }
            ],
            'total': [
              {
                '$count': 'total'
              }
            ],
            'stats_type': [
              {
                '$group': {
                  '_id': '$type',
                  'count': {
                    '$count': {}
                  }
                }
              }
            ],
            'data_type': [
              {
                '$addFields': {
                  'data_type': {
                    '$ifNull': [
                      '$data_type', '$after.type', '$data_type'
                    ]
                  }
                }
              }, {
                '$group': {
                  '_id': '$data_type',
                  'count': {
                    '$count': {}
                  }
                }
              }, {
                '$addFields': {
                  '_id': {
                    '$toObjectId': '$_id'
                  }
                }
              }, {
                '$lookup': {
                  'from': 'data-types',
                  'localField': '_id',
                  'foreignField': '_id',
                  'as': '_id',
                  'pipeline': [
                    {
                      '$project': {
                        'arabic': 1
                      }
                    }
                  ]
                }
              }, {
                '$addFields': {
                  '_id': {
                    '$first': '$_id.arabic'
                  }
                }
              }
            ]
          }
        }, {
          '$addFields': {
            'total': {
              '$first': '$total.total'
            }
          }
        }
      ])
    }
  }


  getUsers(page: number, offset: number) {
    return this.ContentUpdateModel.aggregate([
      {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$ous',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'as': 'string'
        }
      }, {
        '$addFields': {
          'ous': '$string._id'
        }
      }, {
        '$facet': {
          'approved_by': [
            {
              '$group': {
                '_id': null,
                'ids': {
                  '$addToSet': '$approved_by'
                }
              }
            }
          ],
          'updated_by': [
            {
              '$group': {
                '_id': null,
                'ids': {
                  '$addToSet': '$updated_by'
                }
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'approved_by': {
            '$first': '$approved_by.ids'
          },
          'updated_by': {
            '$first': '$updated_by.ids'
          }
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'updated_by',
          'foreignField': '_id',
          'as': 'updated_by'
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'approved_by',
          'foreignField': '_id',
          'as': 'approved_by'
        }
      }, {
        '$project': {
          'approved_by': {
            'name': 1,
            '_id': 1
          },
          'updated_by': {
            'name': 1,
            '_id': 1
          }
        }
      }
    ])
  }

  delete(_id: string): Promise<any> {
    return this.ContentUpdateModel.deleteOne({ _id })
  }

  getOne(_id: string): Promise<ContentUpdate> {
    return this.ContentUpdateModel.findById({ _id })
  }

  executePipe(pipe: Array<any>): Promise<any> {
    return this.ContentUpdateModel.aggregate(pipe)
  }

  executeDataPipe(pipe: Array<any>): Promise<any> {
    return this.DataModel.aggregate(pipe)
  }


  countRecord(query: any): Promise<number> {

    if (query['$text'] && query['$text'] != undefined && query['$text'] != '') {
      return this.ContentUpdateModel.countDocuments(query, { score: { $meta: "textScore" } })
    }
    else {
      return this.ContentUpdateModel.countDocuments(query)
    }

  }

  //to update data in data model
  async updateData(data: any): Promise<any> {
    try {


      let updateField = await this.DataModel.updateOne(
        { _id: data.service_id, "fields.type": data.type },
        { $set: { "fields.$.data": data.data } },
      );
      if (updateField.modifiedCount <= 0) throw new Error("Data Update Fails !");

      return
    } catch (error) {
      throw new Error(error)
    }
  }

  //add new filed in data model
  async addNewField(data: any): Promise<any> {
    try {

      let service_id = new Types.ObjectId(data.service_id)
      delete data.service_id

      let updateField = await this.DataModel.updateOne(
        { _id: service_id },
        { $push: { fields: data } }
      );
      if (updateField.modifiedCount <= 0) throw new Error("Data Update Fails !");

      return
    } catch (error) {
      throw new Error(error)
    }
  }



  updateName(data: UpdateData): Promise<Data> {
    return this.DataModel.findByIdAndUpdate(data._id, data);
  }

  createData(data: Data): Promise<any> {
    try {
      return this.DataModel.create(data);
    } catch (error) {
      throw new Error("Data not saved")
    }
  }

  //to delete data in data model
  async deleteData(data: any): Promise<any> {
    try {

      let updateField = await this.DataModel.updateOne(
        { _id: data.service_id },
        { $set: { active: false } }
      );
      if (updateField.modifiedCount <= 0) throw new Error("Data Update Fails !");

      return
    } catch (error) {
      throw new Error(error)
    }
  }

  //to delete data in data model
  async undoDeleteData(id: string): Promise<any> {
    try {

      let updateField = await this.DataModel.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { active: true } }
      );
      if (updateField.modifiedCount <= 0) throw new Error("Data Update Fails !");

      return
    } catch (error) {
      throw new Error(error)
    }
  }

}