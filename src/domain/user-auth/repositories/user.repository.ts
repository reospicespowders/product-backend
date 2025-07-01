import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types, UpdateWriteOpResult } from "mongoose";
import { Active, Browser, ResetPassword, User } from "../dto/user-type..dto";
import { AuthRepository } from "../interfaces/auth-repository.interface";
import * as bcrypt from 'bcryptjs';
import { JwtService } from "@nestjs/jwt";
import { RoleRepository } from "src/domain/role/interfaces/role.repository.interface";

let refreshTokenList = []
exports.refreshTokenList = refreshTokenList;

/**
 * @export
 * @class UserRepository
 * @implements {AuthRepository}
 */
@Injectable()
export class UserRepositoryImpl implements AuthRepository {
  /**
   * Creates an instance of UserRepository.
   * @param {Model<User>} userModel
   * @param {JwtService} jwtService
   * @memberof UserRepository
   */
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @Inject('RoleRepository') private roleRepository: RoleRepository,
    private jwtService: JwtService
  ) { }


  getAllVendors(): Promise<User[]> {
    return this.userModel.find()
  }

  getByOus(ous: mongoose.Types.ObjectId[]): Promise<any[]> {
    return this.userModel.find({ ou: { $in: ous }, 'active.status': true })
  }

  getByOusAll(ous: mongoose.Types.ObjectId[]): Promise<any[]> {
    return this.userModel.find({ ou: { $in: ous } })
  }


  getByUserIds(ids: string[]): Promise<User[]> {
    return this.userModel.find({ _id: { $in: ids } }).exec();
  }

  getByUserEmails(emails: string[]): Promise<User[]> {
    return this.userModel.find({ email: { $in: emails } }).exec();
  }

  async getEmailByIds(ids: string[]): Promise<any> {
    return this.userModel.find({ _id: { $in: ids } }, { email: 1 });
  }

  async getSBCCoordinators(): Promise<any[]> {
    let role = await this.roleRepository.getSBCCoordinatorRole();
    if (role && role._id) {
      return this.userModel.find({ role: new mongoose.Types.ObjectId(role._id) })
    }
    return [];
  }

  /**
   *Add new ou id in user's manager array
   *
   * @param {string} ouId
   * @param {string[]} userIds
   * @return {*}  {Promise<void>}
   * @memberof UserRepositoryImpl
   */
  async addOuInManager(ouId: string, userIds: string[]): Promise<void> {
    let userOIds = userIds.map(u => new mongoose.Types.ObjectId(u));
    let ouOId = new mongoose.Types.ObjectId(ouId);

    await this.userModel.updateMany({ managerOus: { $in: [ouId] } }, { $pull: { managerOus: ouId } })

    let pipe: any = [
      {
        '$match': {
          '_id': {
            '$in': userOIds
          },
          'managerOus': {
            '$ne': ouOId
          }
        }
      }, {
        '$addFields': {
          'managerOus': {
            '$concatArrays': [
              {
                '$ifNull': [
                  '$managerOus', []
                ]
              }, [ouOId]
            ]
          }
        }
      }, {
        '$merge': {
          'into': 'users',
          'on': '_id',
          'whenMatched': 'replace',
          'whenNotMatched': 'insert'
        }
      }
    ];
    let res = await this.userModel.aggregate(pipe);
    // console.log(res);
  }


  update(data: any): Promise<UpdateWriteOpResult> {
    let { _id } = data;

    if (!_id) {
      return Promise.reject(new Error('Missing _id field in data'));
    }

    const objectId = new Types.ObjectId(_id);
    delete data._id;
    return this.userModel.updateOne({ _id: objectId }, { $set: data }).exec();
  }

  //User Exist Check
  async isUserExist(email) {
    try {
      const isExist = await this.userModel.exists({ email: email })
      return isExist;
    } catch (error) {
      return false;
    }
  }



  //Generate Password
  async generatePassword() {
    try {
      var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
    } catch (error) {
      return false;
    }
  }

  // Generate OTP
  async generateOTP() {
    try {
      const length = 4;
      const charset = "0123456789";
      let retVal = "";
      for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
    } catch (error) {
      return false;
    }
  }

  //hash Password
  async hashPassword(password: string) {
    try {
      const salt = await bcrypt.genSalt(10);
      const HashPassword = await bcrypt.hash(password, salt);
      return HashPassword;
    } catch (error) {
      return null;
    }
  }

  // Validating the credentials of the user
  async validatePassword(email: string, userPassword: string): Promise<Boolean> {
    try {
      const { password } = await this.userModel.findOne({ email: email }, "password");
      const isMatch = await bcrypt.compare(userPassword, password);
      return isMatch;
    } catch (error) {
      return false;
    }
  }

  //creating JWT Toke
  async createJwtTokens(email: string, uid: string): Promise<any> {
    const userData = {
      date: Date.now(),
      uid: uid,
      email: email
    }
    const accessToken = await this.jwtService.signAsync(userData, { expiresIn: process.env.TOKEN_EXPIRY, secret: process.env.ACCESS_TOKEN_SECRET });
    const refreshToken = await this.jwtService.signAsync(userData, { secret: process.env.REFRESH_TOKEN_SECRET });
    refreshTokenList.push(refreshToken);
    return { refreshToken: refreshToken, accessToken: accessToken };
  }

  // Find record of the user provide by filters and selects the keys that are present i the filds array
  async findOne(filter: Record<string, any>, fields: Array<string>): Promise<User | null> {
    try {
      // Find user with the given filter and selected fields

      // console.log(filter, fields);

      
      const user: any = await this.userModel.findOne(filter, fields)
        .populate({
          path: "role",
          populate: {
            path: "permissions",
            populate: {
              path: "permissions.ou",
            },
          },
        })
        .populate({ path: "ou", populate: { path: "type" } });
  
      if (!user) return null;

      // console.log(user)
  
      // Ensure resetPassword is an object and fix invalid data
      if (!user.resetPassword || typeof user.resetPassword !== 'object') {
        user.resetPassword = {
          status: false,
          loginAttempts: 0,
          lastPasswordReset: '',
        } as ResetPassword;
      }
  
      // Ensure active is an object and fix invalid data
      if (!user.active || typeof user.active !== 'object') {
        user.active = {
          status: true,
          activationCode: '',
          reason: '',
          activationDate: '',
        } as Active;
      }
  
      // Ensure browsers is an object and fix invalid data
      if (!user.browsers || typeof user.browsers !== 'object') {
        user.browsers = {
          code: null,
          list: [],
        } as Browser;
      }
  
      return user;
    } catch (error) {
      console.error('Error in findOne:', error);
      return null;
    }
  }
  
  

  //Incrementing Login Attempts
  async incrementLoginAttempts(email: string): Promise<any> {
    return this.userModel.updateOne({ email: email },
      { $inc: { 'resetPassword.loginAttempts': 1 } }
    )
  }

  //Update User Record
  async updateUser(filter: Record<string, any>, data: any): Promise<UpdateWriteOpResult> {
    return this.userModel.updateOne(filter, { $set: data })
  }

  // find all users
  async findAllActive(): Promise<User[]> {
    return this.userModel.find({ 'externalUser.status': { $ne: true }, 'active.status': true })
      .populate('role')
      .populate('location')
      .populate({ path: 'ou', populate: [{ path: 'location' },{ path: 'type' }] })
      .populate('managerOus')
      .sort({ createdAt: -1 });
  }

  // find all users
  async findAll(): Promise<User[]> {
    return this.userModel.find({ 'externalUser.status': { $ne: true } })
      .populate('role')
      .populate('location')
      .populate({ path: 'ou', populate: [{ path: 'location' },{ path: 'type' }] })
      .populate('managerOus')
      .sort({ createdAt: -1 });
  }

  // find all users
  async findAllFiltered(query: any): Promise<User[]> {
    return this.userModel.find(query, { password: 0, accessToken: 0, browsers: 0 })
      .populate('role')
      .populate('location')
      .populate('ou')
      .populate('externalUser.company');
  }

  //find user by Id
  async findById(id: string): Promise<User> {
    return this.userModel.findById(id)
      .populate('role')
      .populate('location')
      .populate('ou');
  }

  async getManagersByUsers(userIds: string[]): Promise<any[]> {
    let pipe: any = [
      {
        '$match': {
          '_id': {
            '$in':
              userIds.map(e => new mongoose.Types.ObjectId(e))
          }
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'ou',
          'foreignField': 'managerOus',
          'as': 'managers',
          'pipeline': [
            {
              '$project': {
                'name': 1,
                'email': 1,
                'phone': 1,
                'gender': 1,
                'location': 1,
                'role': 1,
                'ou': 1,
                'managerOus': 1
              }
            }, {
              '$lookup': {
                'from': 'roles',
                'localField': 'role',
                'foreignField': '_id',
                'as': 'role',
                'pipeline': [
                  {
                    '$project': {
                      'name': 1,
                      'description': 1
                    }
                  }
                ]
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
                'from': 'organization-units',
                'localField': 'ou',
                'foreignField': '_id',
                'as': 'ou'
              }
            }
          ]
        }
      }, {
        '$project': {
          '_id': 1,
          'ou': 1,
          'managers': '$managers'
        }
      }, {
        '$addFields': {
          'managers': {
            '$map': {
              'input': '$managers',
              'as': 'manager',
              'in': {
                '$mergeObjects': [
                  '$$manager', {
                    'ouPosition': {
                      '$reduce': {
                        'input': '$$manager.managerOus',
                        'initialValue': -1,
                        'in': {
                          '$cond': {
                            'if': {
                              '$gte': [
                                {
                                  '$indexOfArray': [
                                    '$ou', '$$this'
                                  ]
                                }, 0
                              ]
                            },
                            'then': {
                              '$cond': {
                                'if': {
                                  '$eq': [
                                    '$$value', -1
                                  ]
                                },
                                'then': {
                                  '$indexOfArray': [
                                    '$ou', '$$this'
                                  ]
                                },
                                'else': {
                                  '$min': [
                                    '$$value', {
                                      '$indexOfArray': [
                                        '$ou', '$$this'
                                      ]
                                    }
                                  ]
                                }
                              }
                            },
                            'else': '$$value'
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }, {
        '$unwind': {
          'path': '$managers',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$sort': {
          'managers.ouPosition': -1
        }
      }, {
        '$group': {
          '_id': '_id',
          'ou': {
            '$first': '$ou'
          },
          'managers': {
            '$push': '$managers'
          }
        }
      }, {
        '$addFields': {
          'default_manager': {
            '$reduce': {
              'input': '$managers',
              'initialValue': {
                'ouPosition': -1
              },
              'in': {
                '$cond': {
                  'if': {
                    '$gte': [
                      '$$this.ouPosition', '$$value.ouPosition'
                    ]
                  },
                  'then': '$$this',
                  'else': '$$value'
                }
              }
            }
          }
        }
      }
    ];

    return this.userModel.aggregate(pipe);
  }

  //find user by Id
  async findByIdWithoutOu(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  //create user
  async create(user: User): Promise<User> {
    if (user.gender == "ذكر") {
      user.image = "/public/profile/profile_male.png"
    } else {
      user.image = "/public/profile/profile_female.png"
    }
    return this.userModel.create(user);
  }

  //update multiple records
  async updateMany(ids: Array<string>, data: any) {
    return this.userModel.updateMany(
      { _id: { $in: ids } },
      { $set: data }
    )
  }

  async findManager(data: any) {
    return this.userModel.find({ ou: data.ou, 'active.status': true }).select('name')
  }

  async getSkillTrainingsForUser(data: any) {


    return this.userModel.aggregate(
      // [
      //   {
      //     '$match': {
      //       '_id': new mongoose.Types.ObjectId(data.id)
      //     }
      //   }, {
      //     '$project': {
      //       '_id': 1,
      //       'email': 1,
      //       'ou': 1
      //     }
      //   }, {
      //     '$lookup': {
      //       'from': 'training_request',
      //       'localField': 'ou',
      //       'foreignField': 'ous',
      //       'as': 'trainings',
      //       'pipeline': [
      //         {
      //           '$match': {
      //             'status': 'PUBLISHED',
      //             'registrationType': { $in : ['Self Registration' , 'Self Register Manager Approval']}
      //           }
      //         }, {
      //           '$lookup': {
      //             'from': 'courses',
      //             'localField': 'trainingId',
      //             'foreignField': '_id',
      //             'as': 'trainingId'
      //           }
      //         }, {
      //           '$unwind': {
      //             'path': '$trainingId'
      //           }
      //         }, {
      //           '$addFields': {
      //             'staringDate': {
      //               '$dateAdd': {
      //                 'startDate': {
      //                   '$toDate': '$trainingId.start_date'
      //                 },
      //                 'unit': 'hour',
      //                 'amount': 5
      //               }
      //             },
      //             'endingDate': {
      //               '$dateAdd': {
      //                 'startDate': {
      //                   '$toDate': '$trainingId.end_date'
      //                 },
      //                 'unit': 'hour',
      //                 'amount': 5
      //               }
      //             }
      //           }
      //         },
      //         {
      //           '$match': {
      //             '$or': [{
      //               'staringDate': {
      //                 '$gte': new Date(data.start_date),
      //                 '$lte': new Date(data.end_date)
      //               }
      //             },
      //             {
      //               'endingDate': {
      //                 '$gte': new Date(data.start_date),
      //                 '$lte': new Date(data.end_date)
      //               }
      //             }]
      //           }
      //         },
      //         {
      //           '$lookup': {
      //             'from': 'training-type',
      //             'localField': 'type',
      //             'foreignField': '_id',
      //             'as': 'type'
      //           }
      //         },
      //         {
      //           '$addFields': {
      //             'type': {
      //               '$first': '$type'
      //             }
      //           }
      //         }
      //       ]
      //     }
      //   }, {
      //     '$addFields': {
      //       'trainings': {
      //         '$filter': {
      //           'input': '$trainings',
      //           'cond': {
      //             '$not': {
      //               '$in': [
      //                 '$_id', '$$this.trainingId.attendees'
      //               ]
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }, {
      //     '$addFields': {
      //       'trainings': {
      //         '$filter': {
      //           'input': '$trainings',
      //           'cond': {
      //             '$not': {
      //               '$in': [
      //                 '$_id', '$$this.pendingAttendees'
      //               ]
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }, {
      //     '$addFields': {
      //       'trainings': {
      //         '$filter': {
      //           'input': '$trainings',
      //           'cond': {
      //             '$not': {
      //               '$in': [
      //                 '$_id', '$$this.completedAttendees'
      //               ]
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }
      // ]

      [
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(data.id)
          }
        }, {
          '$project': {
            '_id': 1,
            'email': 1,
            'ou': 1
          }
        }, {
          '$lookup': {
            'from': 'training_request',
            'localField': 'ou',
            'foreignField': 'ous',
            'as': 'trainings',
            'let': {
              'user': '$_id'
            },
            'pipeline': [
              {
                '$match': {
                  'status': 'PUBLISHED',
                  'registrationType': {
                    '$in': [
                      'Self Registration', 'Self Register Manager Approval'
                    ]
                  }
                }
              }, {
                '$lookup': {
                  'from': 'courses',
                  'localField': 'trainingId',
                  'foreignField': '_id',
                  'as': 'trainingId'
                }
              }, {
                '$unwind': {
                  'path': '$trainingId'
                }
              }, {
                '$addFields': {
                  'staringDate': {
                    '$dateAdd': {
                      'startDate': {
                        '$toDate': '$trainingId.start_date'
                      },
                      'unit': 'hour',
                      'amount': 5
                    }
                  },
                  'endingDate': {
                    '$dateAdd': {
                      'startDate': {
                        '$toDate': '$trainingId.end_date'
                      },
                      'unit': 'hour',
                      'amount': 5
                    }
                  }
                }
              }, {
                '$match': {
                  '$or': [{
                    'staringDate': {
                      '$gte': new Date(data.start_date),
                      '$lte': new Date(data.end_date)
                    }
                  },
                  {
                    'endingDate': {
                      '$gte': new Date(data.start_date),
                      '$lte': new Date(data.end_date)
                    }
                  }]
                }
              }, {
                '$lookup': {
                  'from': 'training-type',
                  'localField': 'type',
                  'foreignField': '_id',
                  'as': 'type'
                }
              }, {
                '$addFields': {
                  'type': {
                    '$first': '$type'
                  },
                  'userId': '$$user'
                }
              }, {
                '$match': {
                  '$expr': {
                    '$not': {
                      '$in': [
                        '$userId', {
                          '$ifNull': [
                            '$attendeesRequests', []
                          ]
                        }
                      ]
                    }
                  }
                }
              }
            ]
          }
        }, {
          '$addFields': {
            'trainings': {
              '$filter': {
                'input': '$trainings',
                'cond': {
                  '$not': {
                    '$in': [
                      '$_id', '$$this.trainingId.attendees'
                    ]
                  }
                }
              }
            }
          }
        }, {
          '$addFields': {
            'trainings': {
              '$filter': {
                'input': '$trainings',
                'cond': {
                  '$not': {
                    '$in': [
                      '$_id', '$$this.pendingAttendees'
                    ]
                  }
                }
              }
            }
          }
        }, {
          '$addFields': {
            'trainings': {
              '$filter': {
                'input': '$trainings',
                'cond': {
                  '$not': {
                    '$in': [
                      '$_id', '$$this.completedAttendees'
                    ]
                  }
                }
              }
            }
          }
        }
      ]


    )
  }

  async getTrainingUser(data: any) {
    return this.userModel.aggregate(

      [
        {
          '$match': {
            'ou': {
              '$in': data.ous.map(item => new Types.ObjectId(item))
            }
          }
        }, {
          '$addFields': {
            'training': new Types.ObjectId(data.training)
          }
        }, {
          '$addFields': {
            'trainingId': '$training'
          }
        }, {
          '$unset': [
            'browsers', 'accessToken', 'resetPassword', 'active', 'externalUser', 'password'
          ]
        }, {
          '$lookup': {
            'from': 'training_request',
            'localField': 'training',
            'foreignField': '_id',
            'as': 'courseId',
            'pipeline': [
              {
                '$project': {
                  'trainingId': 1
                }
              }
            ]
          }
        }, {
          '$lookup': {
            'from': 'training_request',
            'localField': 'training',
            'foreignField': '_id',
            'as': 'training',
            'pipeline': [
              {
                '$lookup': {
                  'from': 'courses',
                  'localField': 'trainingId',
                  'foreignField': '_id',
                  'as': 'session'
                }
              }, {
                '$unwind': {
                  'path': '$session'
                }
              }, {
                '$replaceRoot': {
                  'newRoot': '$session'
                }
              }, {
                '$unwind': {
                  'path': '$session'
                }
              }, {
                '$project': {
                  '_id': '$session'
                }
              }, {
                '$lookup': {
                  'from': 'session',
                  'localField': '_id',
                  'foreignField': '_id',
                  'as': 'session',
                  'pipeline': [
                    {
                      '$match': {
                        'sessionType': {
                          '$in': [
                            'Onsite', 'Online'
                          ]
                        }
                      }
                    }
                  ]
                }
              }, {
                '$unwind': {
                  'path': '$session'
                }
              }, {
                '$replaceRoot': {
                  'newRoot': '$session'
                }
              }, {
                '$project': {
                  'date': {
                    '$toDate': '$date'
                  },
                  'start_time': '$start_time',
                  'end_time': '$end_time'
                }
              }
            ]
          }
        }, {
          '$lookup': {
            'from': 'courses',
            'let': {
              'settraining': '$training'
            },
            'localField': '_id',
            'foreignField': 'attendees',
            'as': 'attended',
            'pipeline': [
              {
                '$project': {
                  '_id': '$session',
                  'title': 1
                }
              }, {
                '$lookup': {
                  'from': 'session',
                  'localField': '_id',
                  'foreignField': '_id',
                  'as': 'session',
                  'pipeline': [
                    {
                      '$match': {
                        'sessionType': {
                          '$in': [
                            'Onsite', 'Online'
                          ]
                        }
                      }
                    }
                  ]
                }
              }, {
                '$unwind': {
                  'path': '$session'
                }
              }, {
                '$addFields': {
                  'session.trainingTitle': '$title'
                }
              }, {
                '$replaceRoot': {
                  'newRoot': '$session'
                }
              }, {
                '$project': {
                  'date': {
                    '$toDate': '$date'
                  },
                  'start_time': '$start_time',
                  'end_time': '$end_time',
                  'training': '$$settraining',
                  'courseId': 1,
                  'title': 1,
                  'trainingTitle': 1
                }
              }, {
                '$unwind': '$training'
              }, {
                '$addFields': {
                  'date': {
                    '$dateToParts': {
                      'date': '$date'
                    }
                  },
                  'training': {
                    '$dateToParts': {
                      'date': '$training.date'
                    }
                  },
                  'start_time': {
                    '$split': [
                      '$start_time', ':'
                    ]
                  },
                  'end_time': {
                    '$split': [
                      '$end_time', ':'
                    ]
                  },
                  't_start_time': {
                    '$split': [
                      '$training.start_time', ':'
                    ]
                  },
                  't_end_time': {
                    '$split': [
                      '$training.end_time', ':'
                    ]
                  }
                }
              }, {
                '$unset': [
                  'date.hour', 'date.minute', 'date.second', 'date.millisecond', 'training.hour', 'training.minute', 'training.second', 'training.millisecond'
                ]
              }
            ]
          }
        }, {
          '$addFields': {
            'attended': {
              '$reduce': {
                'input': '$attended',
                'initialValue': [],
                'in': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$$this.date', '$$this.training'
                      ]
                    },
                    'then': {
                      '$concatArrays': [
                        '$$value', [
                          '$$this'
                        ]
                      ]
                    },
                    'else': '$$value'
                  }
                }
              }
            }
          }
        }, {
          '$addFields': {
            'attended': {
              '$reduce': {
                'input': '$attended',
                'initialValue': [],
                'in': {
                  '$cond': {
                    'if': {
                      '$or': [
                        {
                          '$and': [
                            {
                              '$gte': [
                                '$$this.start_time', '$$this.t_start_time'
                              ]
                            }, {
                              '$lte': [
                                '$$this.start_time', '$$this.t_end_time'
                              ]
                            }
                          ]
                        }, {
                          '$and': [
                            {
                              '$gte': [
                                '$$this.end_time', '$$this.t_start_time'
                              ]
                            }, {
                              '$lte': [
                                '$$this.end_time', '$$this.t_end_time'
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    'then': {
                      '$concatArrays': [
                        '$$value', [
                          '$$this'
                        ]
                      ]
                    },
                    'else': '$$value'
                  }
                }
              }
            }
          }
        }, {
          '$unwind': {
            'path': '$courseId'
          }
        }, {
          '$addFields': {
            'attended': {
              '$reduce': {
                'input': '$attended',
                'initialValue': [],
                'in': {
                  '$cond': {
                    'if': {
                      '$ne': [
                        '$$this.courseId', '$courseId.trainingId'
                      ]
                    },
                    'then': {
                      '$concatArrays': [
                        '$$value', [
                          '$$this'
                        ]
                      ]
                    },
                    'else': '$$value'
                  }
                }
              }
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
          '$addFields': {
            'attended': {
              '$filter': {
                'input': '$attended',
                'as': 'item',
                'cond': {
                  '$ne': [
                    '$$item', {}
                  ]
                }
              }
            }
          }
        }, {
          '$addFields': {
            'allowed': {
              '$cond': [
                {
                  '$arrayElemAt': [
                    '$attended', 0
                  ]
                }, false, true
              ]
            }
          }
        }
      ]
    )
  }

  async delete(id: string): Promise<any> {
    return this.userModel.deleteOne({ _id: id, isVendor: true });
  }

}