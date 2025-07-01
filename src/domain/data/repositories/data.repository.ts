import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Data, UpdateData } from "../dto/data.dto";
import { DataRepository } from "../interfaces/data-repository.interface";
import { OrganizationalUnit } from "src/domain/organizational-unit/dto/organizational-unit.dto";
import { SignHistory } from "../dto/sign-history.dto";
import { types } from "joi";



@Injectable()
export class DataRepositoryImpl implements DataRepository {

  constructor(
    @InjectModel('Data') private readonly DataModel: Model<Data>,
    @InjectModel('view_data') private readonly DataViewModel: Model<any>,
    @InjectModel('view_content_updates') private readonly ContentUpdateViewModel: Model<any>,
    @InjectModel("Organizational-Unit") private readonly ouModal: Model<OrganizationalUnit>,
    @InjectModel("sign-history") private readonly signHistory: Model<SignHistory>,
  ) { }


  getDataFromOuAndType(ou: number, type: string) {
    try {

      let pipe: any = [
        {
          '$project': {
            'id': 1,
            'name': 1,
            'type': 1,
            'score': 1,
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
          '$addFields': {
            'type': {
              '$first': '$type'
            }
          }
        }, {
          '$graphLookup': {
            'from': 'organization-units',
            'startWith': '$ous',
            'connectFromField': 'parent',
            'connectToField': '_id',
            'depthField': 'depth',
            'as': 'ous'
          }
        }, {
          '$addFields': {
            'ous': {
              '$map': {
                'input': '$ous',
                'in': '$$this.id'
              }
            }
          }
        }, {
          '$match': {
            'ous': ou,
            'type.arabic': type
          }
        }
      ]

      return this.DataModel.aggregate(pipe);

    } catch (error) {
      // console.log(error);
      return null
    }
  }

  create(data: Data): Promise<Data | null> {
    try {
      return this.DataModel.create(data);
    } catch (error) {
      return null
    }
  }


  public async dataCleanQuery() {
    try {
      let dataPipe: any = [
        {
          '$lookup': {
            'from': 'organization-units',
            'localField': 'ous',
            'foreignField': '_id',
            'as': 'result'
          }
        }, {
          '$addFields': {
            'result': {
              '$first': '$result'
            }
          }
        }, {
          '$match': {
            'result': null
          }
        }, {
          '$addFields': {
            'active': false
          }
        }, {
          '$unset': 'result'
        }, {
          '$merge': {
            'into': 'data',
            'on': '_id',
            'whenMatched': 'replace',
            'whenNotMatched': 'insert'
          }
        }
      ];

      this.DataModel.aggregate(dataPipe);
    } catch (e) {
      throw e;
    }
  }

  async getOneEnhanced(id: number): Promise<any> {
    // console.log(id);
    let pipe = [
      {
        '$match': {
          'id': Number(id)
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
                '_id': '$$this._id',
                'label': '$$this.name',
                'id': '$$this.id',
                'icon': '$$this.image_sq',
                'depth': '$$this.depth',
                'active': '$$this.active'
              }
            }
          }
        }
      },
      {
        '$match':
        {
          "breadcrumbs.active": { $ne: false }
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
          }
        }
      }
    ];
    let res = await this.DataModel.aggregate(pipe);
    // console.log(res);
    return res;
  }

  async textSearch(textSearch: string, ou?: number, ous?: string[], signedArray?: string[], unsignedArray?: string[], fav?: Number[]): Promise<Data[]> {

    let breadcrumb_match = {}
    let match1 = {}
    let ouMatch = {}
    let scoreLogic: any = { '$toInt': '1' }
    let signedMatch = {};



    if (ou) {
      breadcrumb_match = {
        "breadcrumbs.id": Number(ou)
      }
    }

    if (!!signedArray && !!unsignedArray) {
      signedMatch = {
        $or: [
          { ous: { $in: unsignedArray.map(e => new mongoose.Types.ObjectId(e)) } },
          {
            $and: [
              { ous: { $in: signedArray.map(e => new mongoose.Types.ObjectId(e)) } },
              { "signed.status": true }
            ]
          }
        ]
      }
    }

    const ogText = textSearch.replaceAll(/['"]/g, '');
    const a_b_relation = [
      { a: "ا", b: "أ" },
      { a: "ا", b: "إ" },
      { a: "ا", b: "ى" },
      { a: "أ", b: "ى" },
      { a: "أ", b: "إ" },
      { a: "إ", b: "ى" },
      { a: "ه", b: "ة" },
      { a: "و", b: "ؤ" },
      { a: "ت", b: "ة" },
      { a: "ض", b: "ظ" },
      { a: "ئ", b: "ء" },
    ];

    const containsPercentSign = ogText.includes("%");

    const SearchTerm = new Set();

    function handleArabicPrefixes(item) {
      if (item.startsWith("ال")) {
        SearchTerm.add(item.substring(2));
        // console.log(`Removed "ال" from ${item} to ${item.substring(2)}`);
      } else {
        SearchTerm.add(`ال${item}`);
      }
    }

    function handleA_B_Relation(item) {
      a_b_relation.forEach((rel) => {
        SearchTerm.add(item.replace(rel.a, rel.b));
        SearchTerm.add(item.replaceAll(rel.a, rel.b));
        SearchTerm.add(item.replaceAll(rel.b, rel.a));
        SearchTerm.add(item.replace(rel.b, rel.a));
      });
    }

    ogText.split(" ").forEach((item) => {
      SearchTerm.add(item);
      handleArabicPrefixes(item);
      handleA_B_Relation(item);
    });

    // Duplicate the terms without Arabic prefixes
    const tempTerms = [...SearchTerm];
    tempTerms.forEach((item) => {
      handleArabicPrefixes(item);
      handleA_B_Relation(item);
    });

    SearchTerm.add(ogText);

    const SearchText = [...SearchTerm].join(" ");

    // console.log(SearchText)

    if (!!ous && ous.length > 0) {
      ouMatch = {
        ous: {
          $in: [...ous.map(e => new mongoose.Types.ObjectId(e))],
        },
      }
    }

    if (textSearch != 'all' && textSearch != 'fav') {
      match1 = {
        '$text': {
          '$search': SearchText
        }
      };
      scoreLogic = {
        '$meta': 'textScore'
      }
    }

    if (textSearch == 'fav') {
      match1 = {
        'id': {
          '$in': fav
        }
      };
    }

    // if (!!ous && ous.length > 0) {
    //   ouMatch = {
    //     ous: {
    //       $in: [...ous.map(e => new mongoose.Types.ObjectId(e))],
    //     },
    //   };
    // }

    // console.log("function: ", breadcrumb_match);
    let pipe: any = [
      {
        '$match': match1
      }, {
        '$match': ouMatch
      }, {
        '$match': {
          'active': true,
          '$or': [
            { 'tempInactive': { '$exists': false } }, // Check if 'tempInactive' doesn't exist
            { 'tempInactive': false } // Check if 'tempInactive' exists and is false
          ]
        }
      }, {
        $match: signedMatch
      }, {
        '$project': {
          'id': 1,
          'name': 1,
          'ous': 1,
          'type': 1
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
      },
      {
        '$addFields': {
          'score': {
            '$regexMatch': {
              'input': '$name',
              'regex': textSearch
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
              '$score', scoreLogic
            ]
          }
        }
      },
      {
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
                '_id': '$$this._id',
                'label': '$$this.name',
                'id': '$$this.id',
                'icon': '$$this.image_sq',
                'depth': '$$this.depth',
                'active': '$$this.active'
              }
            }
          }
        }
      },
      {
        '$match':
        {
          "breadcrumbs.active": { $ne: false }
        }
      },
      {
        '$match': breadcrumb_match
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
          }
        }
      }, {
        '$sort': {
          'score': -1
        }
      }
    ];
    let res = await this.DataModel.aggregate(pipe);
    // console.log(res);
    return res;
  }

  async advanceSearch(structuredMatch: any, ou?: number): Promise<OrganizationalUnit[]> {
    let ouMatch = {}
    if (ou) {
      ouMatch = {
        "breadcrumbs.id": ou
      }
    }

    // console.log(JSON.stringify(structuredMatch));

    let pattern = structuredMatch.pattern;
    if (pattern) {
      delete structuredMatch.pattern;
    } else {
      pattern = []
    }

    let pipe: any = [
      {
        '$match': {
          'active': true
        }
      }, {
        '$match': structuredMatch
      }, {
        '$project': {
          'id': 1,
          'name': 1,
          'type': 1,
          'score': 1,
          'data': {
            '$reduce': {
              'input': '$fields.data',
              'initialValue': '',
              'in': {
                '$concat': [
                  '$$value', '$$this'
                ]
              }
            }
          },
          'ous': 1
        }
      }, {
        '$addFields': {
          'matchingWords': {
            '$filter': {
              'input': pattern,
              'as': 'pattern',
              'cond': {
                '$regexMatch': {
                  'input': '$name',
                  'regex': '$$pattern'
                }
              }
            }
          },
          'matchingData': {
            '$filter': {
              'input': pattern,
              'as': 'pattern',
              'cond': {
                '$regexMatch': {
                  'input': '$data',
                  'regex': '$$pattern'
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'score': {
            '$add': [
              {
                '$multiply': [
                  {
                    '$size': '$matchingWords'
                  }, 2
                ]
              }, {
                '$size': '$matchingData'
              }
            ]
          }
        }
      }, {
        '$unset': 'data'
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
                '_id': '$$this._id',
                'label': '$$this.name',
                'id': '$$this.id',
                'icon': '$$this.image_sq',
                'depth': '$$this.depth',
                'active': '$$this.active'
              }
            }
          }
        }
      },
      {
        '$match':
        {
          "breadcrumbs.active": { $ne: false }
        }
      }, {
        '$match': ouMatch
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
          }
        }
      },

      {
        '$sort': {
          'score': -1
        }
      }
    ]


    return this.DataModel.aggregate(pipe);
  }


  update(data: UpdateData): Promise<Data> {
    return this.DataModel.findByIdAndUpdate(data._id, data);
  }


  getAll(page: number, offset: number): Promise<Data[]> {
    //pagination 
    const skip: number = page * offset - offset;
    return this.DataModel.find().limit(offset).skip(skip);
  }

  getViewData(page: number, offset: number): Promise<any> {
    try {
      //pagination 
      const skip: number = page * offset - offset;
      return this.DataViewModel.find({ active: true });
    } catch (error) {
      throw new Error(error)
    }
  }

  getFilteredViewData(query: any, page: number, offset: number): Promise<any> {
    try {
      //pagination 
      const skip: number = page * offset - offset;
      let signedFilter = {};

      if (!!query.unsignedArray && !!query.signedArray) {
        signedFilter = {
          $and: [
            {
              $or: [
                { ous: { $in: query.unsignedArray.map(e => new mongoose.Types.ObjectId(e)) } },
                {
                  $and: [
                    { ous: { $in: query.signedArray.map(e => new mongoose.Types.ObjectId(e)) } },
                    { "signed.status": true }
                  ]
                }
              ]
            },
          ]
        }
        delete query.unsignedArray;
        delete query.signedArray;
      }

      let searchText: any = undefined

      if (query.text) {
        searchText = query?.text
        searchText = searchText.replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, '');
        // console.log("sorted test", searchText)
        delete query.text
      }

      let pipe: any = [
        {
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
                  'description': '$$this.description',
                  'active': '$$this.active'
                }
              }
            }
          }
        },
        {
          '$match':
          {
            "breadcrumbs.active": { $ne: false }
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
            'tempInactive': {
              '$first': '$tempInactive'
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
        },
        { $match: signedFilter },
        { $match: query },

      ]

      if (searchText) {

        const words = searchText.split(/\s+/); // Split by whitespace
        // Create regex patterns for each word
        const regex = words.map(word => new RegExp(word, 'i'));

        let arr = regex.flatMap(regex => [
          { name: { $regex: regex } },
          { "fields.data": { $regex: regex } },
          { "breadcrumbs.label": { $regex: regex } }
        ])

        pipe.push(
          {
            $match: {
              $or: arr
            }
          }, {
          $addFields: {
            score: {
              $sum: regex.map(regex => ({
                $cond: [
                  { $regexMatch: { input: "$name", regex } },
                  1,
                  0
                ]
              }))
            }
          }
        },
          { $sort: { score: -1 } })
      }


      return this.DataModel.aggregate(pipe);

    } catch (error) {
      throw new Error(error)
    }
  }

  getExportViewData(query: any, page: number, offset: number): Promise<any> {
    try {
      //pagination 
      const skip: number = page * offset - offset;
      let signedFilter = {};
      if (!!query.unsignedArray && !!query.signedArray) {
        signedFilter = {
          $and: [
            {
              $or: [
                { ous: { $in: query.unsignedArray.map(e => new mongoose.Types.ObjectId(e)) } },
                {
                  $and: [
                    { ous: { $in: query.signedArray.map(e => new mongoose.Types.ObjectId(e)) } },
                    { "signed.status": true }
                  ]
                }
              ]
            },
          ]
        }
        delete query.unsignedArray;
        delete query.signedArray;
      }

      let searchText: any = undefined

      if (query.text) {
        searchText = query?.text
        searchText = searchText.replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, '');
        // console.log("sorted test", searchText)
        delete query.text
      }

      let pipe: any = [
        { $match: signedFilter },
        { $match: query },

      ]

      if (searchText) {

        const words = searchText.split(/\s+/); // Split by whitespace
        // Create regex patterns for each word
        const regex = words.map(word => new RegExp(word, 'i'));

        let arr = regex.flatMap(regex => [
          { name: { $regex: regex } },
          { "fields.data": { $regex: regex } },
          { "breadcrumbs.label": { $regex: regex } }
        ])

        pipe.push(
          {
            $match: {
              $or: arr
            }
          }, {
          $addFields: {
            score: {
              $sum: regex.map(regex => ({
                $cond: [
                  { $regexMatch: { input: "$name", regex } },
                  1,
                  0
                ]
              }))
            }
          }
        },
          { $sort: { score: -1 } },

        )


      }

      pipe.push({
        '$project': {
          'العنوان': '$name',
          'الوزارات / كيانات أخرى': {
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
          'النوع': '$type.arabic',
          'العنوان الرئيسي': {
            '$reduce': {
              'input': '$breadcrumbs',
              'initialValue': {
                'depth': 0
              },
              'in': {
                '$cond': [
                  {
                    '$eq': [
                      '$$this.depth', 1
                    ]
                  }, '$$this.label', '$$value'
                ]
              }
            }
          },
          'العنوان الفرعي': {
            '$reduce': {
              'input': '$breadcrumbs',
              'initialValue': {
                'depth': 0
              },
              'in': {
                '$cond': [
                  {
                    '$eq': [
                      '$$this.depth', 0
                    ]
                  }, '$$this.label', '$$value'
                ]
              }
            }
          },
          'link': {
            '$concat': [
              'https://kgate.bc.gov.sa/data/', {
                '$toString': '$id'
              }
            ]
          },
          'fields': {
            '$map': {
              'input': '$fields',
              'in': {
                'k': '$$this.label.name',
                'v': '$$this.data'
              }
            }
          }
        }
      }, {
        '$addFields': {
          'الوزارات / كيانات أخرى': '$الوزارات / كيانات أخرى.label'
        }
      }, {
        '$addFields': {
          'fields': {
            '$arrayToObject': '$fields'
          }
        }
      })

      // console.log("new pipe",pipe)

      return this.DataViewModel.aggregate(pipe);

    } catch (error) {
      throw new Error(error)
    }
  }

  getContentUpdateView(page: number, offset: number): Promise<any> {
    try {
      //pagination 
      const skip: number = page * offset - offset;
      return this.ContentUpdateViewModel.find();
    } catch (error) {
      throw new Error(error)
    }
  }

  delete(_id: string): Promise<any> {
    return this.DataModel.deleteOne({ _id })
  }

  getOne(_id: string): Promise<Data> {
    return this.DataModel.findById({ _id })
  }

  executePipe(pipe: Array<any>): Promise<any> {
    return this.DataModel.aggregate(pipe)
  }


  countRecord(query: any): Promise<number> {
    return this.DataModel.countDocuments(query)
  }

  async insertMany(data: Data[]): Promise<Data[]> {
    let res = await this.DataModel.create(data);

    let getLatestCount = await this.DataModel.find().sort({ id: -1 }).limit(1);

    let latestCount = getLatestCount[0].id;


    let updatePipe: any = [
      {
        '$group': {
          '_id': '$id',
          'count': {
            '$sum': 1
          },
          'docs': {
            '$push': '$$ROOT'
          }
        }
      }, {
        '$match': {
          'count': {
            '$gt': 1
          }
        }
      }, {
        '$unwind': {
          'path': '$docs'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$docs'
        }
      }, {
        '$setWindowFields': {
          'sortBy': {
            '_id': 1
          },
          'output': {
            'id': {
              '$documentNumber': {}
            }
          }
        }
      }, {
        '$match': {
          'idstring': null
        }
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$ous',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'as': 'keywords',
          'depthField': 'depth'
        }
      }, {
        '$addFields': {
          'keywords': {
            '$map': {
              'input': '$keywords',
              'in': '$$this.name'
            }
          },
          'idstring': {
            '$reduce': {
              'input': '$keywords',
              'initialValue': {},
              'in': {
                '$cond': [
                  {
                    '$gt': [
                      '$$value.depth', '$$this.depth'
                    ]
                  }, '$$value', '$$this'
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
        '$addFields': {
          'id': {
            '$sum': [
              latestCount, '$id'
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
    this.DataModel.aggregate(updatePipe)
    return res;
  }

  updateBulkStatus(data: any): Promise<any> {
    return this.DataModel.updateMany(
      { _id: { $in: data.data } },
      { $set: { tempInactive: data.status } })
      .then(result => {
        // console.log('Update successful:', result);
        return new Promise((resolve) => {
          setTimeout(() => {
            // console.log('Waited 10 seconds to ensure all changes are applied.');

            let pipe2: any = [
              {
                '$match': {
                  'parent': null
                }
              }, {
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
                '$merge': {
                  'into': 'organization-units',
                  'on': '_id',
                  'whenMatched': 'replace',
                  'whenNotMatched': 'insert'
                }
              }
            ]

            this.ouModal.aggregate(pipe2);

            resolve(result);
          }, 10000); // 10000 ms = 10 seconds
        });
      }).catch(error => {
        console.error('Update failed:', error);
        throw error;
      });
  }

  public async getDataFromOuId(ou: number, signedArray?: string[], unsignedArray?: string[]): Promise<any> {

    // console.log("OU",ou)
    let signedMatch = {}
    if (!!signedArray && !!unsignedArray) {
      signedMatch = {
        $or: [
          { ous: { $in: unsignedArray.map(e => new mongoose.Types.ObjectId(e)) } },
          {
            $and: [
              { ous: { $in: signedArray.map(e => new mongoose.Types.ObjectId(e)) } },
              { $eq: ["$signed.status", true] }
            ]
          }
        ]
      }
    }

    let pipe: any = [
      {
        '$match': {
          'id': ou
        }
      }, {
        '$match': signedMatch
      }, {
        '$lookup': {
          'from': 'data',
          'localField': '_id',
          'foreignField': 'ous',
          'as': 'data'
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

    let res = await this.ouModal.aggregate(pipe);

    // console.log(res);

    return res;
  }

  public async cleanOu(ous: any): Promise<any> {

    let pipe: any = [
      {
        '$match': {
          '_id': {
            '$in': ous.map(e => new mongoose.Types.ObjectId(e))
          }
        }
      }, {
        '$graphLookup': {
          'from': 'organization-units',
          'startWith': '$parent',
          'connectFromField': 'parent',
          'connectToField': '_id',
          'as': 'string'
        }
      }, {
        '$addFields': {
          'string': {
            '$concatArrays': [
              '$string', [
                {
                  '_id': '$_id',
                  'name': '$name',
                  'parent': '$parent',
                  'category': '$category',
                  'type': '$type',
                  'location': '$location',
                  'image': '$image',
                  'image_sq': '$image_sq',
                  'isManager': '$isManager',
                  'managers': '$managers',
                  'active': '$active',
                  'id': '$id',
                  'allowSingleUser': '$allowSingleUser',
                  'createdAt': '$createdAt',
                  'updatedAt': '$updatedAt',
                  '__v': '$__v',
                  'data_counter': '$data_counter',
                  'score': '$score'
                }
              ]
            ]
          }
        }
      }, {
        '$unwind': {
          'path': '$string'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$string'
        }
      }, {
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
        '$merge': {
          'into': 'organization-units',
          'on': '_id',
          'whenMatched': 'replace',
          'whenNotMatched': 'insert'
        }
      }
    ]

    this.ouModal.aggregate(pipe);

    let pipe2: any = [
      {
        '$match': {
          'parent': null
        }
      }, {
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
        '$merge': {
          'into': 'organization-units',
          'on': '_id',
          'whenMatched': 'replace',
          'whenNotMatched': 'insert'
        }
      }
    ]

    this.ouModal.aggregate(pipe2);
  }

  public async updateCreateSignHistory(data: any) {
    const filter = { data_id: data._id };
    try {
      // Check if the document exists
      const existingRecord = await this.signHistory.findOne(filter);

      if (existingRecord) {
        // If document exists, push to the history array
        const update = { $push: { history: data.signed } };
        const result = await this.signHistory.updateOne(filter, update);
        return result;
      } else {
        // If document does not exist, create a new document with initial history entry
        const newRecord = { data_id: data._id, history: [data.signed] };
        const result = await this.signHistory.create(newRecord);
        return result;
      }
    } catch (error) {
      throw new Error(`Failed to update or create record: ${error.message}`);
    }
  }

  getSignHistory(_id: string): Promise<Data> {
    return this.signHistory.findOne({ data_id: new mongoose.Types.ObjectId(_id) })
  }

  dataStates(data: any): Promise<any> {

    if (data.ous) {
      data.ous = new mongoose.Types.ObjectId(data.ous);
    }

    return this.DataModel.aggregate([
      {
        '$match': {
          'active': true
        }
      }, {
        '$unset': 'fields'
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
                'active': '$$this.active',
              }
            }
          },
          'ous': {
            '$map': {
              'input': '$breadcrumbs',
              'in': '$$this._id'
            }
          }
        }
      },
      {
        '$match':
        {
          "breadcrumbs.active": { $ne: false }
        }
      },
      {
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
          'ous': {
            '$first': '$ous'
          },
          'active': {
            '$first': '$active'
          },
          'tempInactive': {
            '$first': '$tempInactive'
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
      }, {
        '$match': data
      }, {
        '$facet': {
          'active': [
            {
              '$group': {
                '_id': '$tempInactive',
                'count': {
                  '$count': {}
                }
              }
            }, {
              '$project': {
                '_id': 0,
                'k': {
                  '$ifNull': [
                    {
                      '$toString': '$_id'
                    }, 'unknown'
                  ]
                },
                'v': '$count'
              }
            }
          ],
          'signed': [
            {
              '$group': {
                '_id': '$signed.status',
                'count': {
                  '$count': {}
                }
              }
            }, {
              '$project': {
                '_id': 0,
                'k': {
                  '$ifNull': [
                    {
                      '$toString': '$_id'
                    }, 'unknown'
                  ]
                },
                'v': '$count'
              }
            }
          ],
          'type': [
            {
              '$group': {
                '_id': '$type',
                'count': {
                  '$count': {}
                }
              }
            }, {
              '$project': {
                '_id': 0,
                'k': {
                  '$ifNull': [
                    {
                      '$toString': '$_id.name'
                    }, 'unknown'
                  ]
                },
                'v': '$count'
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'active': {
            '$arrayToObject': '$active'
          },
          'signed': {
            '$arrayToObject': '$signed'
          },
          'type': {
            '$arrayToObject': '$type'
          }
        }
      }, {
        '$addFields': {
          'type.active': '$active.false',
          'type.inactive': '$active.true',
          'type.signed': '$signed.true',
          'type.unsigned': '$signed.false'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$type'
        }
      }
    ])
  }




}