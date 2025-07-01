import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, ObjectId } from "mongoose";
import { ContentUpdateReports, UpdateContentUpdateReports } from "../dto/content-update-reports.dto";
import { ContentUpdateReportsRepository } from "../interfaces/content-update-reports.interface";
import { PermissionRepository } from "src/domain/permission/interfaces/permission.repository.interface";
import { Permission } from "src/domain/permission/dto/permission.dto";

@Injectable()
export class ContentUpdateReportsRepositoryImpl implements ContentUpdateReportsRepository {

    constructor(@InjectModel('content-update-reports') private readonly ContentUpdateReportsModel: Model<ContentUpdateReports>,
    @InjectModel('Permission') private readonly permissionModel: Model<Permission>
  ) { }

    create(report: ContentUpdateReports): Promise<ContentUpdateReports> {
        return this.ContentUpdateReportsModel.create(report);
    }

    update(report: UpdateContentUpdateReports): Promise<any> {
        console.log(report);
        return this.ContentUpdateReportsModel.updateOne({ _id: new mongoose.Types.ObjectId(report._id) }, report);
    }

    getAll(page: number, offset: number, filters?: Object): Promise<ContentUpdateReports[]> {
        const skip: number = page * offset - offset;

        if (filters) {
            if (filters['ou'] && Array.isArray(filters['ou'])) {
                filters['ou'] = { $in: filters['ou'].map(id => new mongoose.Types.ObjectId(id)) };
            } else if (filters['ou']) {
                filters['ou'] = new mongoose.Types.ObjectId(filters['ou']);
            }
        }

        const pipeline = [
            { "$match": filters },
            {
                '$lookup': {
                  'from': 'organization-units', 
                  'localField': 'ou', 
                  'foreignField': '_id', 
                  'as': 'ou'
                }
              }, {
                '$unwind': {
                  'path': '$ou', 
                  'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$sort': {
                    'createdAt': -1
                }
            },
            {
                '$facet': {
                    'data': [
                        { '$skip': skip },
                        { '$limit': offset }
                    ],
                    'totalCount': [
                        { '$count': 'count' }
                    ]
                }
            }
        ];

    
        return this.ContentUpdateReportsModel.aggregate(pipeline as any);
    }

    getAllWithoutPagination(filters?: Object): Promise<ContentUpdateReports[]> {
        if (filters) {
            if (filters['ou'] && Array.isArray(filters['ou'])) {
                filters['ou'] = { $in: filters['ou'].map(id => new mongoose.Types.ObjectId(id)) };
            } else if (filters['ou']) {
                filters['ou'] = new mongoose.Types.ObjectId(filters['ou']);
            }
        }


        const pipeline = [
            { "$match": filters },
            {
                '$lookup': {
                    'from': 'organization-units',
                    'localField': 'ou',
                    'foreignField': '_id',
                    'as': 'ou'
                }
            },
            {
                '$unwind': {
                    'path': '$ou',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$sort': {
                    'createdAt': -1
                }
            }
        ];

        return this.ContentUpdateReportsModel.aggregate(pipeline as any);
    }

    
    delete(_id: string): Promise<any> {
        return this.ContentUpdateReportsModel.deleteOne({ _id });
    }

    getOne(_id: string): Promise<ContentUpdateReports> {
        return this.ContentUpdateReportsModel.findById({ _id });
    }

    getReportsToRegenerate(): Promise<ContentUpdateReports[]> {

        let pipeline = [
          {
            '$match': {
              'isRegenerated': false
            }
          }, {
            '$addFields': {
              'daysBefore': {
                '$dateDiff': {
                  'startDate': '$$NOW', 
                  'endDate': {
                    '$toDate': '$sendingDate'
                  }, 
                  'unit': 'day'
                }
              }
            }
          }, {
            '$addFields': {
              'matchDateTime': {
                '$concat': [
                  {
                    '$substr': [
                      '$sendingDate', 0, 11
                    ]
                  }, {
                    '$let': {
                      'vars': {
                        'hour': {
                          '$toInt': {
                            '$substr': [
                              '$time', 0, 2
                            ]
                          }
                        }, 
                        'ampm': {
                          '$substr': [
                            '$time', 5, 2
                          ]
                        }
                      }, 
                      'in': {
                        '$toString': {
                          '$cond': {
                            'if': {
                              '$eq': [
                                '$$ampm', 'AM'
                              ]
                            }, 
                            'then': {
                              '$cond': {
                                'if': {
                                  '$eq': [
                                    '$$hour', 12
                                  ]
                                }, 
                                'then': 0, 
                                'else': '$$hour'
                              }
                            }, 
                            'else': {
                              '$cond': {
                                'if': {
                                  '$eq': [
                                    '$$hour', 12
                                  ]
                                }, 
                                'then': 12, 
                                'else': {
                                  '$add': [
                                    '$$hour', 12
                                  ]
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }, ':00:00.000Z'
                ]
              }
            }
          }, {
            '$addFields': {
              'hoursBefore': {
                '$dateDiff': {
                  'startDate': '$$NOW', 
                  'endDate': {
                    '$toDate': '$matchDateTime'
                  }, 
                  'unit': 'hour'
                }
              }
            }
          }, {
            '$match': {
              'daysBefore': 0, 
              'hoursBefore': {
                '$lte': 3
              }
            }
          }
        ];


        return this.ContentUpdateReportsModel.aggregate(pipeline as any);
    }

    getOuContentUpdateReport(ous : Array<string>){

      let pipeline :any = [
        {
          '$match': {
            '_id': {
              '$in': ous.map(ou => new mongoose.Types.ObjectId(ou))
            }
          }
        }, {
          '$unset': [
            'category', 'type', 'location'
          ]
        }, {
          '$graphLookup': {
            'from': 'organization-units', 
            'startWith': '$_id', 
            'connectFromField': '_id', 
            'connectToField': 'parent', 
            'as': 'children'
          }
        }, {
          '$addFields': {
            'children': {
              '$map': {
                'input': '$children', 
                'as': 'child', 
                'in': '$$child._id'
              }
            }
          }
        }, {
          '$lookup': {
            'from': 'content-updates', 
            'localField': 'children', 
            'foreignField': 'ous', 
            'as': 'content-updates', 
            'pipeline': [
              {
                '$group': {
                  '_id': {
                    'status': '$status', 
                    'type': '$type', 
                    'data_type': {
                      '$toObjectId': '$data_type'
                    }
                  }, 
                  'count': {
                    '$count': {}
                  }
                }
              }, {
                '$addFields': {
                  '_id.count': '$count'
                }
              }, {
                '$replaceRoot': {
                  'newRoot': '$_id'
                }
              }, {
                '$match': {
                  'status': {
                    '$ne': 'PENDING'
                  }
                }
              }, {
                '$lookup': {
                  'from': 'data-types', 
                  'localField': 'data_type', 
                  'foreignField': '_id', 
                  'as': 'data_type'
                }
              }, {
                '$unwind': {
                  'path': '$data_type'
                }
              }, {
                '$sort': {
                  'count': -1
                }
              }, {
                '$group': {
                  '_id': {
                    'status': '$status', 
                    'type': '$type'
                  }, 
                  'data': {
                    '$push': {
                      'data_type': '$data_type', 
                      'count': '$count'
                    }
                  }, 
                  'count': {
                    '$sum': '$count'
                  }
                }
              }, {
                '$project': {
                  '_id': 0, 
                  'status': '$_id.status', 
                  'type': '$_id.type', 
                  'data': '$data', 
                  'count': '$count'
                }
              }, {
                '$sort': {
                  'count': -1
                }
              }
            ]
          }
        }
      ]

      return this.ContentUpdateReportsModel.aggregate(pipeline);

    }


async getContentExperts(ou: string): Promise<any> {
    try {

      console.log('ou',ou,new mongoose.Types.ObjectId(ou))

        const pipeline = [
          {
            '$unwind': {
              'path': '$permissions'
            }
          }, {
            '$match': {
              'permissions.children.name': 'CONTENT_APPROVE', 
              'permissions.children.options.options.allow': true, 
              'permissions.ou': new mongoose.Types.ObjectId(ou)
            }
          }, {
            '$lookup': {
              'from': 'roles', 
              'localField': '_id', 
              'foreignField': 'permissions', 
              'as': 'roles'
            }
          }, {
            '$addFields': {
              'roles': '$roles._id'
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'roles', 
              'foreignField': 'role', 
              'let': {
                'ouMatch': '$permissions.ou'
              }, 
              'as': 'users', 
              'pipeline': [
                {
                  '$set': {
                    'ouM': '$$ouMatch'
                  }
                }, {
                  '$set': {
                    'ifMatch': {
                      '$cond': [
                        {
                          '$eq': [
                            '$ouM', null
                          ]
                        }, true, {
                          '$in': [
                            '$$ouMatch', '$ou'
                          ]
                        }
                      ]
                    }
                  }
                }, {
                  '$match': {
                    'ifMatch': true
                  }
                }, {
                  '$project': {
                    '_id': 1, 
                    'email': 1, 
                    'name': 1, 
                    'ifMatch': 1
                  }
                }
              ]
            }
          }, {
            '$unwind': {
              'path': '$users'
            }
          }, {
            '$replaceRoot': {
              'newRoot': '$users'
            }
          }
        ]


        return this.permissionModel.aggregate(pipeline);
      
    } catch (error) {
        throw new Error(error);
    }
}
}

