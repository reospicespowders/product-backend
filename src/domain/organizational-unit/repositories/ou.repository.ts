import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, PipelineStage } from "mongoose";
import { OrganizationalUnit, UpdateOUDto } from "../dto/organizational-unit.dto";
import { Injectable } from "@nestjs/common";
import { OURepository } from "../interfaces/ou-repository.interface";
import { SearchHistory } from "../dto/search-history.dto";
import { Theme } from "../dto/theme.dto";



/**
 *
 *
 * @export
 * @class OURepositoryImpl
 * @implements {OURepository}
 */
@Injectable()
export class OURepositoryImpl implements OURepository {
  DataModel: any;
  constructor(
    @InjectModel("Organizational-Unit") private readonly ouModal: Model<OrganizationalUnit>,
    @InjectModel("search-history") private readonly shModel: Model<SearchHistory>,
    @InjectModel('default-theme') private readonly defaultThemeModal : Model <Theme>
  ) { }



  getParentAndChildOuIds(ous: string[]): Promise<any> {
    let pipe = [
      {
        '$match': {
          $or: [
            {
              '_id': {
                '$in': [...ous.map(e => new mongoose.Types.ObjectId(e))]
              }
            },
            {
              'type': {
                '$in': [...ous.map(e => new mongoose.Types.ObjectId(e))]
              }
            }
          ]
        }
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$parent',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'depthField': 'depth',
          'as': 'parents'
        }
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$_id',
          'connectFromField': '_id',
          'connectToField': 'parent',
          'depthField': 'depth',
          'as': 'child'
        }
      }, {
        '$project': {
          'parents': '$parents._id',
          'child': '$child._id'
        }
      }, {
        '$project': {
          'all': {
            '$concatArrays': [
              [
                '$_id'
              ], '$parents', '$child'
            ]
          },
          'content': {
            '$concatArrays': [
              [
                '$_id'
              ], '$child'
            ]
          }
        }
      }, {
        '$group': {
          '_id': null,
          'all': {
            '$push': '$all'
          },
          'content': {
            '$push': '$content'
          }
        }
      }, {
        '$addFields': {
          'all': {
            '$reduce': {
              'input': '$all',
              'initialValue': [],
              'in': {
                '$concatArrays': [
                  '$$value', '$$this'
                ]
              }
            }
          },
          'content': {
            '$reduce': {
              'input': '$content',
              'initialValue': [],
              'in': {
                '$concatArrays': [
                  '$$value', '$$this'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'all': {
            '$setUnion': [
              '$all', []
            ]
          },
          'content': {
            '$setUnion': [
              '$content', []
            ]
          }
        }
      }
    ]

    return this.ouModal.aggregate(pipe);
  }


  public async getByOuId(id: string): Promise<any> {
    try {
      return await this.ouModal.aggregate([
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(id)
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
          '$addFields': {
            'managers': {
              '$map': {
                'input': '$managers',
                'in': {
                  '$toObjectId': '$$this'
                }
              }
            }
          }
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'managers',
            'foreignField': '_id',
            'as': 'managers',
            'pipeline': [
              {
                '$project': {
                  'name': 1,
                  'email': 1
                }
              }
            ]
          }
        }
      ])
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getById(id: number): Promise<OrganizationalUnit[]> {
    const pipe = [
      {
        '$match': {
          'id': Number(id)
        }
      }, {
        '$addFields': {
          'data_counter': {
            '$map': {
              'input': '$data_counter',
              'in': {
                'k': '$$this._id',
                'v': '$$this.count'
              }
            }
          },
          'data_counter_signed': {
            '$map': {
              'input': '$data_counter',
              'in': {
                'k': '$$this._id',
                'v': '$$this.signed'
              }
            }
          }
        }
      }, {
        '$addFields': {
          'data_counter': {
            '$arrayToObject': '$data_counter'
          },
          'data_counter_signed': {
            '$arrayToObject': '$data_counter_signed'
          }
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'parent',
          'foreignField': '_id',
          'as': 'parent',
          'pipeline': [
            {
              '$project': {
                'name': 1,
                'id': 1,
                'image': 1,
                'image_sq': 1,
                'parent': 1,
                'data_counter': {
                  '$map': {
                    'input': '$data_counter',
                    'in': {
                      'k': '$$this._id',
                      'v': '$$this.count'
                    }
                  }
                },
                'data_counter_signed': {
                  '$map': {
                    'input': '$data_counter',
                    'in': {
                      'k': '$$this._id',
                      'v': '$$this.signed'
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'data_counter': {
                  '$arrayToObject': '$data_counter'
                },
                'data_counter_signed': {
                  '$arrayToObject': '$data_counter_signed'
                }
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'parent': {
            '$ifNull': [
              {
                '$first': '$parent'
              }, null
            ]
          }
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'parent.parent',
          'foreignField': '_id',
          'as': 'grandparent',
          'pipeline': [
            {
              '$project': {
                'name': 1,
                'id': 1,
                'image': 1,
                'image_sq': 1,
                'parent': 1,
                'data_counter': {
                  '$map': {
                    'input': '$data_counter',
                    'in': {
                      'k': '$$this._id',
                      'v': '$$this.count'
                    }
                  }
                },
                'data_counter_signed': {
                  '$map': {
                    'input': '$data_counter',
                    'in': {
                      'k': '$$this._id',
                      'v': '$$this.signed'
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'data_counter': {
                  '$arrayToObject': '$data_counter'
                },
                'data_counter_signed': {
                  '$arrayToObject': '$data_counter_signed'
                }
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'grandparent': {
            '$ifNull': [
              {
                '$first': '$grandparent'
              }, null
            ]
          }
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': '_id',
          'foreignField': 'parent',
          'as': 'children',
          'pipeline': [
            {
              '$project': {
                'name': 1,
                'id': 1,
                'image': 1,
                'image_sq': 1,
                'data_counter': {
                  '$map': {
                    'input': '$data_counter',
                    'in': {
                      'k': '$$this._id',
                      'v': '$$this.count'
                    }
                  }
                },
                'data_counter_signed': {
                  '$map': {
                    'input': '$data_counter',
                    'in': {
                      'k': '$$this._id',
                      'v': '$$this.signed'
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'data_counter': {
                  '$arrayToObject': '$data_counter'
                },
                'data_counter_signed': {
                  '$arrayToObject': '$data_counter_signed'
                }
              }

            }
          ]
        }
      }
    ]

    // console.log(JSON.stringify(pipe));

    const reply = await this.ouModal.aggregate(pipe);

    // console.log(JSON.stringify(reply));

    return reply;
  }


  public async searchCategory(keyword: string, categoryId?: number): Promise<OrganizationalUnit[]> {
    let match = {};

    if (categoryId) {
      match["id"] = categoryId;
    }

    const pipe = [
      {
        '$match': {
          '$text': {
            '$search': keyword
          }
        }
      }, {
        '$addFields': {
          'score': {
            '$meta': 'textScore'
          }
        }
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$ous',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'depthField': 'depth',
          'as': 'allous'
        }
      }, {
        '$addFields': {
          'breadcrumbs': {
            '$map': {
              'input': '$allous',
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
          'from': 'data-types',
          'localField': 'type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$addFields': {
          'type': {
            '$first': '$type'
          }
        }
      }, {
        '$unwind': {
          'path': '$fields'
        }
      }, {
        '$lookup': {
          'from': 'data-fields',
          'localField': 'fields.type',
          'foreignField': '_id',
          'as': 'fields.type'
        }
      }, {
        '$addFields': {
          'fields.type': {
            '$first': '$fields.type'
          },
          'fields.field': '$fields.type'
        }
      }, {
        '$lookup': {
          'from': 'field-types',
          'localField': 'fields.type.type',
          'foreignField': '_id',
          'as': 'fields.type'
        }
      }, {
        '$addFields': {
          'fields.type': {
            '$first': '$fields.type'
          },
          'fields.label': {
            '$ifNull': [
              {
                '$first': '$fields.field'
              }, '$fields.label'
            ]
          },
          'fields.field': {
            '$first': '$fields.field'
          }
        }
      }, {
        '$addFields': {
          'service': {
            '$cond': {
              'if': {
                '$eq': [
                  '$fields.type.name', 'Data Item'
                ]
              },
              'then': {
                '$convert': {
                  'input': '$fields.data',
                  'to': 'objectId',
                  'onError': '',
                  'onNull': ''
                }
              },
              'else': null
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'view_data_dup',
          'localField': 'service',
          'foreignField': '_id',
          'as': 'service'
        }
      }, {
        '$addFields': {
          'service': {
            '$first': '$service'
          }
        }
      }, {
        '$addFields': {
          'fields.data': {
            '$ifNull': [
              '$service', '$fields.data', '$service'
            ]
          }
        }
      }, {
        '$group': {
          '_id': '$_id',
          'id': {
            '$first': '$id'
          },
          'name': {
            '$first': '$name'
          },
          'type': {
            '$first': '$type'
          },
          'fields': {
            '$addToSet': '$fields'
          },
          'ous': {
            '$first': '$ous'
          },
          'active': {
            '$first': '$active'
          },
          'comments': {
            '$first': '$comments'
          },
          'breadcrumbs': {
            '$first': '$breadcrumbs'
          },
          'updatedAt': {
            '$first': '$updatedAt'
          },
          'signed': {
            '$first': '$signed'
          },
          'score': {
            '$first': '$score'
          },
          'allous': {
            '$first': '$allous'
          }
        }
      }, {
        '$addFields': {
          'parent': {
            '$reduce': {
              'input': '$breadcrumbs',
              'initialValue': {
                'depth': 0
              },
              'in': {
                '$cond': [
                  {
                    '$eq': [
                      '$$this.depth', '$$value.depth'
                    ]
                  }, '$$this', '$$value'
                ]
              }
            }
          },
          'ministry': {
            '$reduce': {
              'input': '$allous',
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
        '$sort': {
          'score': -1
        }
      }, {
        '$group': {
          '_id': '$ministry.id',
          'data_items': {
            '$push': '$$ROOT'
          },
          'ministry': {
            '$first': '$ministry'
          }
        }
      }, {
        '$match': match
      }, {
        '$lookup': {
          'from': 'locations',
          'localField': 'ministry.location',
          'foreignField': '_id',
          'as': 'ministry.location'
        }
      }, {
        '$lookup': {
          'from': 'org-types',
          'localField': 'ministry.type',
          'foreignField': '_id',
          'as': 'ministry.type'
        }
      }, {
        '$lookup': {
          'from': 'org-categories',
          'localField': 'ministry.category',
          'foreignField': '_id',
          'as': 'ministry.category'
        }
      }, {
        '$addFields': {
          'ministry.location': {
            '$first': '$ministry.location'
          },
          'ministry.type': {
            '$first': '$ministry.type'
          },
          'ministry.category': {
            '$first': '$ministry.category'
          }
        }
      }, {
        '$addFields': {
          'ministry.data_items': '$data_items',
          'ministry.score': {
            '$sum': '$ministry.data_counter.count'
          }
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$ministry'
        }
      }, {
        '$sort': {
          'score': -1
        }
      }
    ]


    let res = await this.DataModel.aggregate(pipe);
    return res;
  }

  //Create search history log

  public async createSearchHistory(searchHistory: SearchHistory): Promise<SearchHistory> {
    return this.shModel.create(searchHistory);
  }

  public async getByCategoryId(id: number): Promise<any> {
    let pipe = [
      {
        '$match': {
          'id': Number(id)
        }
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$parent',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'as': 'breadcrumbs',
          'depthField': 'depth'
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': '_id',
          'foreignField': 'parent',
          'as': 'children'
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'parent',
          'foreignField': '_id',
          'as': 'parent'
        }
      }, {
        '$addFields': {
          'parent': {
            '$ifNull': [
              {
                '$first': '$parent'
              }, null
            ]
          }
        }
      }
    ];

    return await this.ouModal.aggregate(pipe).exec();
  }

  //Create 
  public async getParentID(query: any): Promise<any> {
    try {
      let pipeline = [
        {
          '$lookup': {
            'from': 'organization-units',
            'localField': 'parent',
            'foreignField': '_id',
            'as': 'parent'
          }
        }, {
          '$addFields': {
            'parent': {
              '$ifNull': [
                {
                  '$first': '$parent.name'
                }, null
              ]
            }
          }
        }, {
          '$match': {
            'name': query.name,
            'parent': query.parent
          }
        }
      ]

      let res = await this.ouModal.aggregate(pipeline).exec();

      return res


    } catch (error) {
      throw new Error(error)
    }
  }


  //Get search history
  public async getSearchHistory(uid: string): Promise<string[]> {
    return await this.shModel.aggregate([{
      '$group': {
        '_id': '$keyword',
        'count': {
          '$count': {}
        }
      }
    }, {
      '$match': {
        '_id': {
          '$ne': null
        }
      }
    }, {
      '$sort': {
        'count': -1
      }
    }, {
      '$limit': 15
    }])

    // // return (await this.shModel.find({ user_id: uid })
    //   .sort({ createdAt: -1 })
    // //   .limit(15).exec()).map((e: SearchHistory) => e.keyword);
  }


  public async ouCleanQuery() {
    try {
      let ouPipe = [
        {
          '$lookup': {
            'from': 'organization-units',
            'localField': 'parent',
            'foreignField': '_id',
            'as': 'resultforparent'
          }
        }, {
          '$addFields': {
            'resultforparent': {
              '$first': '$resultforparent'
            }
          }
        }, {
          '$match': {
            '$or': [
              {
                'parent': null
              }, {
                'resultforparent': {
                  '$ne': null
                }
              }
            ]
          }
        }, {
          '$unset': 'resultforparent'
        }, {
          '$out': 'organization-units'
        }
      ];

      return this.ouModal.aggregate(ouPipe);
    } catch (e) {
      // console.log(e);
      throw e;
    }
  }

  public async documentCount(): Promise<number> {
    return this.ouModal.countDocuments();
  }


  //Get all ous without parent
  public async getWithoutParent(): Promise<OrganizationalUnit[]> {

    // console.log("Pipe for Parent")
    try {
      let pipeline: PipelineStage[] = [
        {
          '$match': {
            'parent': null,
            'active': true
          }
        }, {
          '$lookup': {
            'from': 'org-types',
            'localField': 'type',
            'foreignField': '_id',
            'as': 'type'
          }
        }, {
          '$unwind': '$type'
        }, {
          '$lookup': {
            'from': 'organization-units',
            'localField': '_id',
            'foreignField': 'parent',
            'as': 'children',
            'pipeline': [
              {
                '$lookup': {
                  'from': 'org-types',
                  'localField': 'type',
                  'foreignField': '_id',
                  'as': 'type'
                }
              }, {
                '$unwind': '$type'
              }, {
                '$match': {
                  'type.tag': { $in: ['Ministries/Entities', 'Organisational Units'] }
                }
              }
            ]
          }
        }, {
          '$addFields': {
            'data_object': {
              '$arrayToObject': {
                '$map': {
                  'input': '$data_counter',
                  'in': {
                    'k': '$$this._id',
                    'v': '$$this.count'
                  }
                }
              }
            },
            'data_counter_signed': {
              '$arrayToObject': {
                '$map': {
                  'input': '$data_counter',
                  'in': {
                    'k': '$$this._id',
                    'v': '$$this.signed'
                  }
                }
              }
            }
          }
        }, {
          '$match': {
            'score': {
              '$gt': 0
            }
          }
        }, {
          '$sort': {
            'score': -1
          }
        }
      ];
      return this.ouModal.aggregate(pipeline).allowDiskUse(true);
    } catch (error) {
      throw new Error(error)
    }
  }


  public async getOuManagersByIds(ous: mongoose.Types.ObjectId[]): Promise<any[]> {
    let data = await this.ouModal.find({ _id: { $in: ous } }, { managers: 1 })
    let managers = data.map(e => e.managers)
    return managers.flat();
  }


  //Get ous with children
  public async getWithChildren(removeInactive: boolean): Promise<any> {
    let match: any = {
      'parent': null
    }
    if (removeInactive) {
      match = {
        'parent': null,
        'active': true
      };
    }
    const pipe: any = [
      {
        '$match': match
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$_id',
          'connectFromField': '_id',
          'connectToField': 'parent',
          'as': 'children',
          'depthField': 'depth'
        }
      }, {
        '$lookup': {
          'from': 'locations',
          'localField': 'location',
          'foreignField': '_id',
          'as': 'location'
        }
      }, {
        '$lookup': {
          'from': 'org-types',
          'localField': 'type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$lookup': {
          'from': 'org-categories',
          'localField': 'category',
          'foreignField': '_id',
          'as': 'category'
        }
      }, {
        '$addFields': {
          'location': {
            '$first': '$location'
          },
          'type': {
            '$first': '$type'
          },
          'category': {
            '$first': '$category'
          }
        }
      }, {
        '$unwind': {
          'path': '$children',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'org-types',
          'localField': 'children.type',
          'foreignField': '_id',
          'as': 'children.type'
        }
      }, {
        '$lookup': {
          'from': 'org-categories',
          'localField': 'children.category',
          'foreignField': '_id',
          'as': 'children.category'
        }
      }, {
        '$lookup': {
          'from': 'locations',
          'localField': 'children.location',
          'foreignField': '_id',
          'as': 'children.location'
        }
      }, {
        '$addFields': {
          'children.location': {
            '$first': '$children.location'
          },
          'children.type': {
            '$first': '$children.type'
          },
          'children.category': {
            '$first': '$children.category'
          }
        }
      }, {
        '$group': {
          '_id': '$_id',
          'name': {
            '$first': '$name'
          },
          'parent': {
            '$first': '$parent'
          },
          'category': {
            '$first': '$category'
          },
          'type': {
            '$first': '$type'
          },
          'location': {
            '$first': '$location'
          },
          'image': {
            '$first': '$image'
          },
          'image_sq': {
            '$first': '$image_sq'
          },
          'isManager': {
            '$first': '$isManager'
          },
          'active': {
            '$first': '$active'
          },
          'id': {
            '$first': '$id'
          },
          'createdAt': {
            '$first': '$createdAt'
          },
          'updatedAt': {
            '$first': '$updatedAt'
          },
          '__v': {
            '$first': '$__v'
          },
          'data_counter': {
            '$first': '$data_counter'
          },
          'score': {
            '$first': '$score'
          },
          'children': {
            '$push': '$children'
          }
        }
      }, {
        '$sort': {
          "_id": 1
        }
      }
    ];

    return await this.ouModal.aggregate(pipe);

  }

  //Get ous with children
  public async getWithGraph(query: any): Promise<any> {

    if (query.id) {
      query.id = Number(query.id);
    }

    const pipe = [
      {
        '$match': query
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$_id',
          'connectFromField': '_id',
          'connectToField': 'parent',
          'as': 'children',
          'depthField': 'depth'
        }
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$parent',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'as': 'parents',
          'depthField': 'depth'
        }
      }, {
        '$lookup': {
          'from': 'locations',
          'localField': 'location',
          'foreignField': '_id',
          'as': 'location'
        }
      }, {
        '$lookup': {
          'from': 'org-types',
          'localField': 'type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$lookup': {
          'from': 'org-categories',
          'localField': 'category',
          'foreignField': '_id',
          'as': 'category'
        }
      }, {
        '$addFields': {
          'location': {
            '$first': '$location'
          },
          'type': {
            '$first': '$type'
          },
          'category': {
            '$first': '$category'
          }
        }
      }, {
        '$addFields': {
          'string': {
            '$concatArrays': [
              '$children._id', [
                '$_id'
              ]
            ]
          }
        }
      }, {
        '$lookup': {
          'from': 'data',
          'localField': 'string',
          'foreignField': 'ous',
          'pipeline': [
            {
              '$match': {
                'active': true
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
                      'depth': '$$this.depth'
                    }
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'data-types',
                'localField': 'type',
                'foreignField': '_id',
                'as': 'type'
              }
            }, {
              '$addFields': {
                'type': {
                  '$first': '$type'
                }
              }
            }, {
              '$unwind': {
                'path': '$fields'
              }
            }, {
              '$lookup': {
                'from': 'data-fields',
                'localField': 'fields.type',
                'foreignField': '_id',
                'as': 'fields.type'
              }
            }, {
              '$addFields': {
                'fields.type': {
                  '$first': '$fields.type'
                },
                'fields.field': '$fields.type'
              }
            }, {
              '$lookup': {
                'from': 'field-types',
                'localField': 'fields.type.type',
                'foreignField': '_id',
                'as': 'fields.type'
              }
            }, {
              '$addFields': {
                'fields.type': {
                  '$first': '$fields.type'
                },
                'fields.label': {
                  '$ifNull': [
                    {
                      '$first': '$fields.field'
                    }, '$fields.label'
                  ]
                },
                'fields.field': {
                  '$first': '$fields.field'
                }
              }
            }, {
              '$addFields': {
                'service': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$fields.type.name', 'Data Item'
                      ]
                    },
                    'then': {
                      //'$toObjectId': '$fields.data'
                      '$convert': { 'input': '$fields.data', 'to': 'objectId', 'onError': '', 'onNull': '' }
                    },
                    'else': null
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'view_data_dup',
                'localField': 'service',
                'foreignField': '_id',
                'as': 'service'
              }
            }, {
              '$addFields': {
                'service': {
                  '$first': '$service'
                }
              }
            }, {
              '$addFields': {
                'fields.data': {
                  '$ifNull': [
                    '$service', '$fields.data', '$service'
                  ]
                }
              }
            }, {
              '$group': {
                '_id': '$_id',
                'id': {
                  '$first': '$id'
                },
                'name': {
                  '$first': '$name'
                },
                'type': {
                  '$first': '$type'
                },
                'fields': {
                  '$addToSet': '$fields'
                },
                'ous': {
                  '$first': '$ous'
                },
                'active': {
                  '$first': '$active'
                },
                'comments': {
                  '$first': '$comments'
                },
                'breadcrumbs': {
                  '$first': '$breadcrumbs'
                },
                'updatedAt': {
                  '$first': '$updatedAt'
                },
                'signed': {
                  '$first': '$signed'
                }
              }
            }
          ],
          'as': 'data_items'
        }
      }, {
        '$addFields': {
          'score': {
            '$sum': '$data_counter.count'
          }
        }
      }, {
        '$unset': 'string'
      }
    ]

    return await this.ouModal.aggregate(pipe);

  }

  //create Organizational unit Implementation
  public async create(ou: OrganizationalUnit): Promise<OrganizationalUnit> {

    if (!ou.id || ou.id == null) {

      let pipe = [
        {
          $group: {
            _id: null,
            id: { $max: "$id" }
          }
        }
      ]
      let last = await this.ouModal.aggregate(pipe).exec();
      if (last && last[0].id != null) {
        ou.id = last[0].id + 1;
      } else {
        throw new Error('ID not fetched')
      }
    }
    return await this.ouModal.create(ou);
  }
  //get all Organizational units Implementation
  public async getAll(): Promise<OrganizationalUnit[]> {
    return await this.ouModal.find().populate('location').populate('type').populate('category').populate('parent');
  }
  //update Organizational unit Implementation
  public async update(ou: UpdateOUDto): Promise<OrganizationalUnit> {
    const pipe: any = [
      {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$_id',
          'connectFromField': '_id',
          'connectToField': 'parent',
          'as': 'string'
        }
      }, {
        '$addFields': {
          'string': {
            '$concatArrays': [
              '$string._id', [
                '$_id'
              ]
            ]
          }
        }
      }, {
        '$lookup': {
          'from': 'data',
          'localField': 'string',
          'foreignField': 'ous',
          'pipeline': [
            {
              '$match': {
                'active': true,
                'tempInactive': false
              }
            }, {
              '$lookup': {
                'from': 'data-types',
                'localField': 'type',
                'foreignField': '_id',
                'as': 'type'
              }
            }, {
              '$addFields': {
                'type': {
                  '$first': '$type'
                }
              }
            }, {
              '$group': {
                '_id': '$type.arabic',
                'count': {
                  '$count': {}
                },
                'signed': {
                  '$sum': {
                    '$cond': [
                      {
                        '$eq': [
                          '$signed.status', true
                        ]
                      }, 1, 0
                    ]
                  }
                },
                'icon': {
                  '$first': '$type.icon'
                }
              }
            }
          ],
          'as': 'data_counter'
        }
      }, {
        '$addFields': {
          'score': {
            '$sum': '$data_counter.count'
          }
        }
      }, {
        '$sort': {
          'score': -1
        }
      }, {
        '$unset': 'string'
      }, {
        '$out': 'organization-units'
      }
    ];

    let res = await this.ouModal.findByIdAndUpdate(ou._id, ou, { new: false }).exec();

    await this.ouModal.aggregate(pipe);

    return res;
  }
  //delete Organizational unit Implementation
  public async delete(_id: string): Promise<any> {
    return await this.ouModal.findByIdAndDelete(_id).exec();
  }

  public async clean(): Promise<any> {
    const pipe: any = [
      {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$_id',
          'connectFromField': '_id',
          'connectToField': 'parent',
          'as': 'string'
        }
      }, {
        '$addFields': {
          'string': {
            '$concatArrays': [
              '$string._id', [
                '$_id'
              ]
            ]
          }
        }
      }, {
        '$lookup': {
          'from': 'data',
          'localField': 'string',
          'foreignField': 'ous',
          'pipeline': [
            {
              '$match': {
                'active': true,
                'tempInactive': false
              }
            }, {
              '$lookup': {
                'from': 'data-types',
                'localField': 'type',
                'foreignField': '_id',
                'as': 'type'
              }
            }, {
              '$addFields': {
                'type': {
                  '$first': '$type'
                }
              }
            }, {
              '$group': {
                '_id': '$type.arabic',
                'count': {
                  '$count': {}
                },
                'signed': {
                  '$sum': {
                    '$cond': [
                      {
                        '$eq': [
                          '$signed.status', true
                        ]
                      }, 1, 0
                    ]
                  }
                },
                'icon': {
                  '$first': '$type.icon'
                }
              }
            }
          ],
          'as': 'data_counter'
        }
      }, {
        '$addFields': {
          'score': {
            '$sum': '$data_counter.count'
          }
        }
      }, {
        '$sort': {
          'score': -1
        }
      }, {
        '$unset': 'string'
      }, {
        '$out': 'organization-units'
      }
    ]

    return await this.ouModal.aggregate(pipe);
  }

  public async insertMany(data: OrganizationalUnit[]): Promise<OrganizationalUnit[]> {
    return this.ouModal.create(data);
  }

  public async getDataFromOuId(ou: number, signedArray?: string[], unsignedArray?: string[]): Promise<any> {

    if (typeof ou !== 'number') {
      ou = Number(ou)
    }
    let pipeline = []
    if (!!signedArray && !!unsignedArray) {
      pipeline = [{
        $match: {
          $or: [
            { ous: { $in: unsignedArray.map(e => new mongoose.Types.ObjectId(e)) } },
            {
              $and: [
                { ous: { $in: signedArray.map(e => new mongoose.Types.ObjectId(e)) } },
                { 'signed.status': true }
              ]
            }
          ]

        }
      }]
    }
    // console.log()
    // console.log("OU", ou);

    let pipe: any = [
      {
        '$match': {
          'id': ou
        }
      }, {
        '$lookup': {
          'from': 'data',
          'localField': '_id',
          'foreignField': 'ous',
          'as': 'data',
          pipeline: pipeline
        }
      }, {
        '$unwind': {
          'path': '$data'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$data'
        }
      }, {
        '$match': {
          'active': true,
          'tempInactive': false
        }
      }, {
        '$project': {
          'id': 1,
          'name': 1,
          'type': 1,
          'ous': 1
        }
      }, {
        '$lookup': {
          'from': 'data-types',
          'localField': 'type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$unwind': {
          'path': '$type'
        }
      }
    ];

    return await this.ouModal.aggregate(pipe);
  }

  public async getBranchCity(ids: string[]): Promise<any> {

    let branchIds = ids.map(id => new mongoose.Types.ObjectId(id));

    let pipe: any = [
      {
        '$match': {
          '_id': {
            '$in': branchIds
          }
        }
      }, {
        '$lookup': {
          'from': 'locations',
          'localField': 'location',
          'foreignField': '_id',
          'as': 'location'
        }
      }, {
        '$unwind': {
          'path': '$location'
        }
      }, {
        '$project': {
          '_id': 1,
          'city': '$location.name'
        }
      }
    ]

    return await this.ouModal.aggregate(pipe);
  }


  public async getOuManager(id: string): Promise<any> {
    let pipe: any = [
      {
        '$match': {
          '_id': new mongoose.Types.ObjectId(id)
        }
      }, {
        '$lookup': {
          'from': 'users',
          'let': {
            'managersList': '$managers'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$in': [
                    '$_id', {
                      '$map': {
                        'input': '$$managersList',
                        'as': 'm',
                        'in': {
                          '$toObjectId': '$$m'
                        }
                      }
                    }
                  ]
                }
              }
            }, {
              '$project': {
                '_id': 1,
                'email': 1,
                'name': 1
              }
            }
          ],
          'as': 'managers'
        }
      }, {
        '$unwind': {
          'path': '$managers'
        }
      }, {
        '$group': {
          '_id': '$_id',
          'managers': {
            '$push': '$managers'
          }
        }
      }
    ]
    return await this.ouModal.aggregate(pipe);
  }

  async getUserTheme(ous: Array<any>): Promise<any> {
    ous = ous.map(ou => new mongoose.Types.ObjectId(ou));
    return this.ouModal.aggregate([
      {
        '$match': {
          '_id': {
            '$in': ous
          },
          'theme.active': true,
          'theme': {
            '$ne': null
          }
        }
      }, {
        '$project': {
          'theme': 1
        }
      }
    ])
  }

  async getThemeById(ou: string): Promise<any> {
    return this.ouModal.aggregate([
      {
        '$match': {
          '_id': new mongoose.Types.ObjectId(ou),
        }
      }, {
        '$project': {
          'theme': 1
        }
      }
    ])
  }

  async saveDefaultTheme(theme: any, uid: string): Promise<any> {
    try {

      console.log("theme==>",theme);
      // Always create a new theme record
      return this.defaultThemeModal.create({
        theme: theme?.theme,
        created_by: new mongoose.Types.ObjectId(uid),
        created_at: new Date(),
        updated_by: new mongoose.Types.ObjectId(uid),
        updated_at: new Date()
      });
    } catch (error) {
      throw new Error(`Failed to save default theme: ${error.message}`);
    }
  }
  
  async getDefaultTheme(): Promise<any> {
    try {
      return await this.defaultThemeModal
        .findOne()
        .sort({ created_at: -1 })  // Sort by created_at in descending order to get most recent
        .exec();
    } catch (error) {
      throw new Error(`Failed to get default theme: ${error.message}`);
    }
  }
}
