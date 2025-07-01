import { Injectable } from "@nestjs/common";
import { CourseRepository } from "../interfaces/course-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types, UpdateWriteOpResult } from "mongoose";
import { Course, CourseMaterialDto } from "../dto/course.dto";
import { User } from "src/domain/user-auth/dto/user-type..dto";

@Injectable()
export class CourseRepositoryImpl implements CourseRepository {

  constructor(@InjectModel('course') private readonly courseModal: Model<Course>) { }


  deleteByProgramId(programId: any): Promise<any> {
    return this.courseModal.deleteMany({ "programId._id": programId });
  }

  /**
   *
   *
   * @param {Course} course
   * @return {*}  {Promise<Course>}
   * @memberof CourseRepositoryImpl
   */
  public create(course: Course): Promise<Course> {
    return this.courseModal.create(course);
  }

  getSimpleCourse(_id: string): Promise<Course> {
    return this.courseModal.findById(_id);
  }

  getCourseUsers(courseId: string): Promise<any[]> {
    return this.courseModal.find({ _id: courseId }, { attendees: 1 }).populate({ path: 'attendees', populate: { path: 'location' } }).exec()
  }

  updateCourseUsers(courseId: any, users: string[]): Promise<UpdateWriteOpResult> {
    return this.courseModal.updateOne({ _id: courseId }, { $set: { attendees: users } })
  }


  getTrainingCompletedUsers(id: string): Promise<any> {
    return this.courseModal.aggregate([
      {
        '$match': {
          '_id': new mongoose.Types.ObjectId(id)
        }
      }, {
        '$project': {
          'title': 1,
          'session': 1,
          'attendees': 1
        }
      }, {
        '$lookup': {
          'from': 'session',
          'localField': 'session',
          'foreignField': '_id',
          'as': 'session'
        }
      }, {
        '$addFields': {
          'surveys': {
            '$map': {
              'input': '$session',
              'in': {
                '$cond': {
                  'if': {
                    '$or': [
                      {
                        '$eq': [
                          '$$this.sessionType', 'Survey'
                        ]
                      }
                    ]
                  },
                  'then': {
                    '$toObjectId': '$$this.surveyId'
                  },
                  'else': null
                }
              }
            }
          },
          'assessments': {
            '$map': {
              'input': '$session',
              'in': {
                '$cond': {
                  'if': {
                    '$or': [
                      {
                        '$eq': [
                          '$$this.sessionType', 'Assessment'
                        ]
                      }
                    ]
                  },
                  'then': {
                    '$toObjectId': '$$this.assessmentId'
                  },
                  'else': null
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'surveys': {
            '$filter': {
              'input': '$surveys',
              'cond': {
                '$ne': [
                  '$$this', null
                ]
              }
            }
          },
          'assessments': {
            '$filter': {
              'input': '$assessments',
              'cond': {
                '$ne': [
                  '$$this', null
                ]
              }
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'surveys',
          'localField': 'surveys',
          'foreignField': '_id',
          'as': 'surveysAtten',
          'pipeline': [
            {
              '$project': {
                '_id': 1
              }
            }, {
              '$lookup': {
                'from': 'survey-attempts',
                'localField': '_id',
                'foreignField': 'surveyId',
                'as': 'surveys',
                'pipeline': [
                  {
                    '$project': {
                      '_id': 0,
                      'email': 1
                    }
                  }, {
                    '$lookup': {
                      'from': 'users',
                      'localField': 'email',
                      'foreignField': 'email',
                      'as': 'seenby',
                      'pipeline': [
                        {
                          '$project': {
                            '_id': 1
                          }
                        }
                      ]
                    }
                  }, {
                    '$addFields': {
                      'seenby': {
                        '$map': {
                          'input': '$seenby',
                          'in': '$$this._id'
                        }
                      }
                    }
                  }
                ]
              }
            }, {
              '$project': {
                '_id': 1,
                'seenby': {
                  '$reduce': {
                    'input': {
                      '$map': {
                        'input': '$surveys',
                        'as': 'survey',
                        'in': '$$survey.seenby'
                      }
                    },
                    'initialValue': [],
                    'in': {
                      '$setUnion': [
                        '$$value', '$$this'
                      ]
                    }
                  }
                }
              }
            }
          ]
        }
      }, {
        '$lookup': {
          'from': 'assessments',
          'localField': 'assessments',
          'foreignField': '_id',
          'as': 'assessmentAtten',
          'pipeline': [
            {
              '$project': {
                '_id': 1
              }
            }, {
              '$lookup': {
                'from': 'assessment-attempts',
                'localField': '_id',
                'foreignField': 'assessmentId',
                'as': 'assessments',
                'pipeline': [
                  {
                    '$project': {
                      '_id': 0,
                      'email': 1
                    }
                  }, {
                    '$lookup': {
                      'from': 'users',
                      'localField': 'email',
                      'foreignField': 'email',
                      'as': 'seenby',
                      'pipeline': [
                        {
                          '$project': {
                            '_id': 1
                          }
                        }
                      ]
                    }
                  }, {
                    '$addFields': {
                      'seenby': {
                        '$map': {
                          'input': '$seenby',
                          'in': '$$this._id'
                        }
                      }
                    }
                  }
                ]
              }
            }, {
              '$project': {
                '_id': 1,
                'seenby': {
                  '$reduce': {
                    'input': {
                      '$map': {
                        'input': '$assessments',
                        'as': 'assessments',
                        'in': '$$assessments.seenby'
                      }
                    },
                    'initialValue': [],
                    'in': {
                      '$setUnion': [
                        '$$value', '$$this'
                      ]
                    }
                  }
                }
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'session': {
            '$concatArrays': [
              '$session', '$surveysAtten', '$assessmentAtten'
            ]
          }
        }
      }, {
        '$addFields': {
          'sessionAtten': {
            '$map': {
              'input': '$session',
              'in': {
                '$cond': {
                  'if': {
                    '$or': [
                      {
                        '$eq': [
                          '$$this.sessionType', 'Online'
                        ]
                      }, {
                        '$eq': [
                          '$$this.sessionType', 'Onsite'
                        ]
                      }
                    ]
                  },
                  'then': '$$this.attendees',
                  'else': {
                    '$cond': {
                      'if': {
                        '$or': [
                          {
                            '$eq': [
                              '$$this.sessionType', 'Survey'
                            ]
                          }, {
                            '$eq': [
                              '$$this.sessionType', 'Assessment'
                            ]
                          }, {
                            '$eq': [
                              '$$this.sessionType', 'Certificate'
                            ]
                          }
                        ]
                      },
                      'then': null,
                      'else': '$$this.seenby'
                    }
                  }
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'sessionAtten': {
            '$filter': {
              'input': '$sessionAtten',
              'cond': {
                '$ne': [
                  '$$this', null
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'sessionAtten': {
            '$map': {
              'input': '$sessionAtten',
              'in': {
                '$map': {
                  'input': '$$this',
                  'as': 'item',
                  'in': {
                    '$toObjectId': '$$item'
                  }
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'completedUsers': {
            '$reduce': {
              'input': '$sessionAtten',
              'initialValue': [],
              'in': {
                '$cond': [
                  {
                    '$eq': [
                      '$$value', []
                    ]
                  }, '$$this', {
                    '$setIntersection': [
                      '$$value', '$$this'
                    ]
                  }
                ]
              }
            }
          }
        }
      }, {
        '$unwind': {
          'path': '$completedUsers'
        }
      }, {
        '$project': {
          '_id': '$completedUsers'
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': '_id',
          'foreignField': '_id',
          'as': 'user',
          'pipeline': [
            {
              '$project': {
                'name': 1,
                'email': 1,
                'image': 1,
                'ou': 1,
                'phone': 1
              }
            }
          ]
        }
      }, {
        '$unwind': {
          'path': '$user',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$addFields': {
          'user._id': '$_id'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$user'
        }
      }
    ]);
  }
  /**
   *
   *
   * @param {*} id
   * @return {*}  {Promise<Course[]>}
   * @memberof CourseRepositoryImpl
   */
  public getSpecificCourse(id): Promise<Course[]> {


    let pipe = [
      {
        $match:
        {
          request_id: new Types.ObjectId(id)
        },
      },
      {
        $lookup: {
          from: "session",
          localField: "session",
          foreignField: "_id",
          as: "session",
          pipeline: [
            {
              $addFields: {
                typeId: {
                  $cond: {
                    if: {
                      $eq: [
                        {
                          $type: "$typeId",
                        },
                        "objectId",
                      ],
                    },
                    then: "$typeId",
                    else: {
                      //$toObjectId: "$typeId",
                      $convert: { input: '$typeId', to: 'objectId', onError: '', onNull: '' }
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                assessmentId: {
                  $cond: {
                    if: {
                      $eq: ["$type", "ASSESSMENT"],
                    },
                    then: "$typeId",
                    else: null,
                  },
                },
                surveyId: {
                  $cond: {
                    if: {
                      $eq: ["$type", "SURVEY"],
                    },
                    then: "$typeId",
                    else: null,
                  },
                },
                sessionId: {
                  $cond: {
                    if: {
                      $eq: ["$type", "SESSION"],
                    },
                    then: "$typeId",
                    else: null,
                  },
                },
              },
            },
            {
              $lookup: {
                from: "program",
                localField: "sessionId",
                foreignField: "_id",
                as: "sessionId",
              },
            },
            {
              $lookup: {
                from: "surveys",
                localField: "surveyId",
                foreignField: "_id",
                as: "surveyId",
              },
            },
            {
              $lookup: {
                from: "assessments",
                localField: "assessmentId",
                foreignField: "_id",
                as: "assessmentId",
              },
            },
            {
              $addFields: {
                sessionId: {
                  $first: "$sessionId",
                },
                assessmentId: {
                  $first: "$assessmentId",
                },
                surveyId: {
                  $first: "$surveyId",
                },
              },
            },
            {
              $addFields: {
                typeId: {
                  $ifNull: [
                    "$assessmentId",
                    {
                      $ifNull: [
                        "$surveyId",
                        "$sessionId",
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    ]
    return this.courseModal.aggregate(pipe);
  }

  public getStructuredCourseById(id: string): Promise<any> {
    let pipe =
      [
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(id)
          }
        }, {
          '$lookup': {
            'from': 'training_request',
            'localField': 'request_id',
            'foreignField': '_id',
            'as': 'training_request',
            'pipeline': [
              {
                '$lookup': {
                  'from': 'training-type',
                  'localField': 'type',
                  'foreignField': '_id',
                  'as': 'type'
                }
              }, {
                '$unwind': {
                  'path': '$type'
                }
              }
            ]
          }
        }, {
          '$unwind': {
            'path': '$training_request',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'session',
            'localField': 'session',
            'foreignField': '_id',
            'as': 'session',
            'pipeline': [
              {
                '$addFields': {
                  'survey': {
                    '$cond': {
                      'if': {
                        '$eq': [
                          '$sessionType', 'Survey'
                        ]
                      },
                      'then': {
                        '$toObjectId': '$surveyId'
                      },
                      'else': null
                    }
                  },
                  'assessment': {
                    '$cond': {
                      'if': {
                        '$eq': [
                          '$sessionType', 'Assessment'
                        ]
                      },
                      'then': {
                        '$toObjectId': '$assessmentId'
                      },
                      'else': null
                    }
                  }
                }
              }, {
                '$lookup': {
                  'from': 'program',
                  'localField': 'sessionId',
                  'foreignField': '_id',
                  'as': 'session'
                }
              }, {
                '$lookup': {
                  'from': 'surveys',
                  'localField': 'survey',
                  'foreignField': '_id',
                  'as': 'survey'
                }
              }, {
                '$lookup': {
                  'from': 'assessments',
                  'localField': 'assessment',
                  'foreignField': '_id',
                  'as': 'assessment'
                }
              }, {
                '$addFields': {
                  'session': {
                    '$first': '$session'
                  },
                  'assessment': {
                    '$first': '$assessment'
                  },
                  'survey': {
                    '$first': '$survey'
                  }
                }
              }
            ]
          }
        }
      ];
    return this.courseModal.aggregate(pipe);
  }


  public courseCertificate(data: any): Promise<Course[]> {


    // console.log("test - 3Session details", data)



    let pipe: any = [
      {
        '$match': {
          '_id': new mongoose.Types.ObjectId(data.id)
        }
      }, {
        '$lookup': {
          'from': 'session',
          'localField': 'certificate.session.id',
          'foreignField': '_id',
          'as': 'certificate.sessiondetails'
        }
      }, {
        '$addFields': {
          'certificate.session': {
            '$map': {
              'input': '$certificate.session',
              'as': 'session',
              'in': {
                'id': '$$session.id',
                'visible': '$$session.visible',
                'details': {
                  '$reduce': {
                    'input': '$certificate.sessiondetails',
                    'initialValue': {},
                    'in': {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$$session.id', '$$this._id'
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
          }
        }
      }, {
        '$unset': 'certificate.sessiondetails'
      }
    ];

    // if user pipeline is called
    if (data.userFlag) {
      pipe = [
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(data.id)
          }
        }, {
          '$addFields': {
            "user": data.email
          }
        }, {
          '$lookup': {
            'from': 'session',
            'localField': 'certificate.session.id',
            'foreignField': '_id',
            'as': 'certificate.sessiondetails',
            'let': {
              'user': '$user'
            },
            'pipeline': [
              {
                '$addFields': {
                  'assessmentId': {
                    '$toObjectId': '$assessmentId'
                  },
                  'user': '$$user'
                }
              }, {
                '$lookup': {
                  'from': 'assessment-results',
                  'localField': 'assessmentId',
                  'foreignField': 'assessmentId',
                  'let': {
                    'user': '$user'
                  },
                  'as': 'assessmentResult',
                  'pipeline': [
                    {
                      '$match': {
                        '$expr': {
                          '$eq': [
                            '$email', '$$user'
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        }, {
          '$addFields': {
            'certificate.session': {
              '$map': {
                'input': '$certificate.session',
                'as': 'session',
                'in': {
                  'id': '$$session.id',
                  'visible': '$$session.visible',
                  'details': {
                    '$reduce': {
                      'input': '$certificate.sessiondetails',
                      'initialValue': {},
                      'in': {
                        '$cond': {
                          'if': {
                            '$eq': [
                              '$$session.id', '$$this._id'
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
            }
          }
        }, {
          '$unset': 'certificate.sessiondetails'
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'user',
            'foreignField': 'email',
            'as': 'user',
            'pipeline': [
              {
                '$project': {
                  'name': 1,
                  'email': 1,
                  'phoneNumber': 1,
                  'gender': 1,
                  'image': 1,
                  'ou': 1
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
                        'parent': 1,
                        'image': 1
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }


    return this.courseModal.aggregate(pipe);
  }


  public getCourseByID(id: string): Promise<Course> {
    return this.courseModal.findById(id).populate({ path: 'attendees', select: ['name', 'email'] })
  }

  public getCourseUserByID(id: string): Promise<any> {

    let pipe =

      [
        {
          '$match': {
            '_id': new Types.ObjectId(id)
          }
        }, {
          '$addFields': {
            'attendees': {
              '$map': {
                'input': '$attendees',
                'in': {
                  '$toObjectId': '$$this'
                }
              }
            }
          }
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'attendees',
            'foreignField': '_id',
            'as': 'attendees',
            'pipeline': [
              {
                '$project': {
                  'name': 1,
                  'email': 1
                }
              }
            ]
          }
        }, {
          '$unwind': {
            'path': '$attendees'
          }
        }, {
          '$addFields': {
            'attendees.courseId': '$_id'
          }
        }, {
          '$replaceRoot': {
            'newRoot': '$attendees'
          }
        }, {
          '$addFields': {
            'userId': {
              '$toString': '$_id'
            }
          }
        }, {
          '$lookup': {
            'from': 'survey-attempts',
            'localField': 'userId',
            'foreignField': 'ratingForID',
            'let': {
              'courseId': '$courseId'
            },
            'as': 'rating',
            'pipeline': [
              {
                '$addFields': {
                  'matchId': {
                    '$eq': [
                      '$$courseId', '$courseId'
                    ]
                  }
                }
              }, {
                '$match': {
                  'ratingFor': 'User',
                  'matchId': true
                }
              }
            ]
          }
        }, {
          '$addFields': {
            'questions': {
              '$reduce': {
                'input': '$rating',
                'initialValue': [],
                'in': {
                  '$concatArrays': [
                    '$$value', '$$this.questions'
                  ]
                }
              }
            }
          }
        }, {
          '$addFields': {
            'meta': {
              '$reduce': {
                'input': '$questions',
                'initialValue': [],
                'in': {
                  '$cond': [
                    {
                      '$eq': [
                        '$$this.type', 'STAR_RATING'
                      ]
                    }, {
                      '$concatArrays': [
                        '$$value', '$$this.meta.fields'
                      ]
                    }, {
                      '$concatArrays': [
                        '$$value', []
                      ]
                    }
                  ]
                }
              }
            }
          }
        }, {
          '$addFields': {
            'score': {
              '$reduce': {
                'input': '$meta',
                'initialValue': {
                  'sum': 0,
                  'count': 0
                },
                'in': {
                  'sum': {
                    '$add': [
                      '$$value.sum', '$$this.value'
                    ]
                  },
                  'count': {
                    '$add': [
                      '$$value.count', 1
                    ]
                  }
                }
              }
            }
          }
        }, {
          '$addFields': {
            'avg_rating': {
              '$cond': {
                'if': {
                  '$ne': [
                    '$score.count', 0
                  ]
                },
                'then': {
                  '$divide': [
                    '$score.sum', '$score.count'
                  ]
                },
                'else': null
              }
            }
          }
        }, {
          '$unset': [
            'questions', 'meta'
          ]
        }
      ]
    return this.courseModal.aggregate(pipe);
  }

  public addNewBranchUser(course: any): Promise<UpdateWriteOpResult> {
    let _id = course._id;
    delete course._id;
    return this.courseModal.updateOne({ _id }, { $push: { attendees: course.newAttendee } })
  }

  /**
   *
   *
   * @param {*} id
   * @return {*}  {Promise<Course[]>}
   * @memberof CourseRepositoryImpl
   */
  public getSpecificCourseById(id): Promise<Course[]> {


    let pipe = [
      {
        $match:
        {
          _id: new Types.ObjectId(id)
        },
      },
      {
        $lookup: {
          from: "session",
          localField: "session",
          foreignField: "_id",
          as: "session",
          pipeline: [
            {
              $addFields: {
                typeId: {
                  $cond: {
                    if: {
                      $eq: [
                        {
                          $type: "$typeId",
                        },
                        "objectId",
                      ],
                    },
                    then: "$typeId",
                    else: {
                      //$toObjectId: "$typeId",
                      $convert: { input: '$typeId', to: 'objectId', onError: '', onNull: '' }
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                assessmentId: {
                  $cond: {
                    if: {
                      $eq: ["$type", "ASSESSMENT"],
                    },
                    then: "$typeId",
                    else: null,
                  },
                },
                surveyId: {
                  $cond: {
                    if: {
                      $eq: ["$type", "SURVEY"],
                    },
                    then: "$typeId",
                    else: null,
                  },
                },
                sessionId: {
                  $cond: {
                    if: {
                      $eq: ["$type", "SESSION"],
                    },
                    then: "$typeId",
                    else: null,
                  },
                },
              },
            },
            {
              $lookup: {
                from: "program",
                localField: "sessionId",
                foreignField: "_id",
                as: "sessionId",
              },
            },
            {
              $lookup: {
                from: "surveys",
                localField: "surveyId",
                foreignField: "_id",
                as: "surveyId",
              },
            },
            {
              $lookup: {
                from: "assessments",
                localField: "assessmentId",
                foreignField: "_id",
                as: "assessmentId",
              },
            },
            {
              $addFields: {
                sessionId: {
                  $first: "$sessionId",
                },
                assessmentId: {
                  $first: "$assessmentId",
                },
                surveyId: {
                  $first: "$surveyId",
                },
              },
            },
            {
              $addFields: {
                typeId: {
                  $ifNull: [
                    "$assessmentId",
                    {
                      $ifNull: [
                        "$surveyId",
                        "$sessionId",
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    ]
    return this.courseModal.aggregate(pipe);
  }


  public getStructuredCourseWithImpactById(id: string, trainer: string): Promise<Course[]> {
    return this.courseModal.aggregate(
      [
        {
          '$match': {
            '_id': new Types.ObjectId(id)
          }
        }, {
          '$lookup': {
            'from': 'training_request',
            'localField': 'request_id',
            'foreignField': '_id',
            'as': 'training_request',
            'pipeline': [
              {
                '$lookup': {
                  'from': 'training-type',
                  'localField': 'type',
                  'foreignField': '_id',
                  'as': 'type'
                }
              }, {
                '$unwind': {
                  'path': '$type'
                }
              }, {
                '$unwind': {
                  'path': '$impactSettings.users',
                  'preserveNullAndEmptyArrays': true
                }
              }, {
                '$unwind': {
                  'path': '$impactSettings.trainers'
                }
              }, {
                '$match': {
                  'impactSettings.trainers': trainer
                }
              }, {
                '$addFields': {
                  'impactSettings.trainers': {
                    '$toObjectId': '$impactSettings.trainers'
                  }
                }
              }, {
                '$lookup': {
                  'from': 'users',
                  'localField': 'impactSettings.trainers',
                  'foreignField': '_id',
                  'as': 'impactSettings.trainers',
                  'pipeline': [
                    {
                      '$project': {
                        'name': 1,
                        'email': 1
                      }
                    }
                  ]
                }
              }, {
                '$unwind': {
                  'path': '$impactSettings.trainers'
                }
              }, {
                '$addFields': {
                  'impactSettings.users._id': {
                    '$toObjectId': '$impactSettings.users.userId'
                  }
                }
              }, {
                '$lookup': {
                  'from': 'users',
                  'localField': 'impactSettings.users._id',
                  'foreignField': '_id',
                  'as': 'impactSettings.users.user',
                  'pipeline': [
                    {
                      '$project': {
                        'name': 1,
                        'email': 1
                      }
                    }
                  ]
                }
              }, {
                '$unwind': {
                  'path': '$impactSettings.users.user'
                }
              }, {
                '$addFields': {
                  'surveyId': {
                    '$toObjectId': '$impactSettings.surveyId'
                  }
                }
              }, {
                '$lookup': {
                  'from': 'survey-attempts',
                  'localField': 'surveyId',
                  'foreignField': 'surveyId',
                  'let': {
                    'user': '$impactSettings.users._id',
                    'manager': '$impactSettings.trainers.email'
                  },
                  'as': 'impactSettings.users.survey',
                  'pipeline': [
                    {
                      '$addFields': {
                        'userId': '$$user',
                        'manager': '$$manager'
                      }
                    }, {
                      '$addFields': {
                        'match': {
                          '$eq': [
                            '$userId', '$attemptFor'
                          ]
                        },
                        'managerMatch': {
                          '$eq': [
                            '$email', '$manager'
                          ]
                        }
                      }
                    }, {
                      '$match': {
                        'match': true,
                        'managerMatch': true
                      }
                    }
                  ]
                }
              }, {
                '$project': {
                  'root': '$$ROOT',
                  'user': '$impactSettings.users'
                }
              }, {
                '$group': {
                  '_id': '$_id',
                  'root': {
                    '$first': '$root'
                  },
                  'users': {
                    '$addToSet': '$user'
                  }
                }
              }, {
                '$addFields': {
                  'root.impactSettings.users': '$users'
                }
              }, {
                '$replaceRoot': {
                  'newRoot': '$root'
                }
              }
            ]
          }
        }, {
          '$unwind': {
            'path': '$training_request',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'session',
            'localField': 'session',
            'foreignField': '_id',
            'as': 'session'
          }
        }
      ])
  }


  /**
   *
   *
   * @param {*} id
   * @return {*}  {Promise<Course[]>}
   * @memberof CourseRepositoryImpl
   */
  public getUserCourse(id): Promise<Course[]> {
    let pipe = [
      {
        '$match': {
          'active': true,
          attendees: new Types.ObjectId(id)
        }
      }, {
        '$lookup': {
          'from': 'training_request',
          'localField': 'request_id',
          'foreignField': '_id',
          'as': 'request_id'
        }
      }, {
        '$unwind': {
          'path': '$request_id',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'training-type',
          'localField': 'request_id.type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$unwind': {
          'path': '$type',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'session',
          'localField': 'session',
          'foreignField': '_id',
          'as': 'session',
          'pipeline': [
            {
              '$addFields': {
                'typeId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        {
                          '$type': '$typeId'
                        }, 'objectId'
                      ]
                    },
                    'then': '$typeId',
                    'else': {
                      '$convert': {
                        'input': '$typeId',
                        'to': 'objectId',
                        'onError': '',
                        'onNull': ''
                      }
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'assessmentId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$type', 'ASSESSMENT'
                      ]
                    },
                    'then': '$typeId',
                    'else': null
                  }
                },
                'surveyId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$type', 'SURVEY'
                      ]
                    },
                    'then': '$typeId',
                    'else': null
                  }
                },
                'sessionId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$type', 'SESSION'
                      ]
                    },
                    'then': '$typeId',
                    'else': null
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'program',
                'localField': 'sessionId',
                'foreignField': '_id',
                'as': 'sessionId'
              }
            }, {
              '$lookup': {
                'from': 'surveys',
                'localField': 'surveyId',
                'foreignField': '_id',
                'as': 'surveyId'
              }
            }, {
              '$lookup': {
                'from': 'assessments',
                'localField': 'assessmentId',
                'foreignField': '_id',
                'as': 'assessmentId'
              }
            }, {
              '$addFields': {
                'sessionId': {
                  '$first': '$sessionId'
                },
                'assessmentId': {
                  '$first': '$assessmentId'
                },
                'surveyId': {
                  '$first': '$surveyId'
                }
              }
            }, {
              '$addFields': {
                'typeId': {
                  '$ifNull': [
                    '$assessmentId', {
                      '$ifNull': [
                        '$surveyId', '$sessionId'
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    ]

    // [
    //   {
    //     $match:
    //     {
    //       active: true,
    //       attendees: new Types.ObjectId(id)
    //     },
    //   },
    //   {
    //     '$lookup': {
    //       'from': 'session',
    //       'localField': 'session',
    //       'foreignField': '_id',
    //       'as': 'session',
    //       'pipeline': [
    //         {
    //           '$addFields': {
    //             'typeId': {
    //               '$cond': {
    //                 'if': {
    //                   '$eq': [
    //                     {
    //                       '$type': '$typeId'
    //                     }, 'objectId'
    //                   ]
    //                 },
    //                 'then': '$typeId',
    //                 'else': {
    //                   //'$toObjectId': '$typeId'
    //                   '$convert': { 'input': '$typeId', 'to': 'objectId', 'onError': '', 'onNull': '' }
    //                 }
    //               }
    //             }
    //           }
    //         }, {
    //           '$addFields': {
    //             'assessmentId': {
    //               '$cond': {
    //                 'if': {
    //                   '$eq': [
    //                     '$type', 'ASSESSMENT'
    //                   ]
    //                 },
    //                 'then': '$typeId',
    //                 'else': null
    //               }
    //             },
    //             'surveyId': {
    //               '$cond': {
    //                 'if': {
    //                   '$eq': [
    //                     '$type', 'SURVEY'
    //                   ]
    //                 },
    //                 'then': '$typeId',
    //                 'else': null
    //               }
    //             },
    //             'sessionId': {
    //               '$cond': {
    //                 'if': {
    //                   '$eq': [
    //                     '$type', 'SESSION'
    //                   ]
    //                 },
    //                 'then': '$typeId',
    //                 'else': null
    //               }
    //             }
    //           }
    //         }, {
    //           '$lookup': {
    //             'from': 'program',
    //             'localField': 'sessionId',
    //             'foreignField': '_id',
    //             'as': 'sessionId'
    //           }
    //         }, {
    //           '$lookup': {
    //             'from': 'surveys',
    //             'localField': 'surveyId',
    //             'foreignField': '_id',
    //             'as': 'surveyId'
    //           }
    //         }, {
    //           '$lookup': {
    //             'from': 'assessments',
    //             'localField': 'assessmentId',
    //             'foreignField': '_id',
    //             'as': 'assessmentId'
    //           }
    //         }, {
    //           '$addFields': {
    //             'sessionId': {
    //               '$first': '$sessionId'
    //             },
    //             'assessmentId': {
    //               '$first': '$assessmentId'
    //             },
    //             'surveyId': {
    //               '$first': '$surveyId'
    //             }
    //           }
    //         }, {
    //           '$addFields': {
    //             'typeId': {
    //               '$ifNull': [
    //                 '$assessmentId', {
    //                   '$ifNull': [
    //                     '$surveyId', '$sessionId'
    //                   ]
    //                 }
    //               ]
    //             }
    //           }
    //         }
    //       ]
    //     }
    //   }
    // ]
    return this.courseModal.aggregate(pipe);
  }

  public async addSessionToCourse(courseId: string, sessionId: string, remove: boolean, type?: string): Promise<void> {
    if (remove) {
      await this.courseModal.updateOne({ _id: courseId }, { $pull: { session: sessionId } }, { new: true })

      // fetch all course data
      let courseData: any = await this.courseModal.findOne({ _id: courseId })

      let sessions = courseData.certificate.session
      //filter the session
      const filteredArray = sessions.filter(session => session.id != sessionId);
      //update new list      
      await this.courseModal.updateOne({ _id: courseId }, { 'certificate.session': filteredArray })

    } else {
      await this.courseModal.updateOne({ _id: courseId }, { $push: { session: sessionId } }, { new: true })

      if (type != 'Video' && type != 'Survey' && type != 'Material_Text' && type != 'Material') {
        await this.courseModal.updateOne({ _id: courseId }, { $push: { 'certificate.session': { id: sessionId, visible: false } } })
      }
    }



  }


  public async addMaterialToCourse(material: CourseMaterialDto): Promise<void> {
    if (material.remove) {
      await this.courseModal.updateOne({ _id: material.courseId }, { $pull: { courseMaterial: { title: material.title, url: material.url, order: material.order } } }, { new: true })
    } else {
      await this.courseModal.updateOne({ _id: material.courseId }, { $push: { courseMaterial: { title: material.title, url: material.url, order: material.order } } }, { new: true })
    }
  }

  public async updateMaterialOrder(material: CourseMaterialDto[], courseId: string): Promise<UpdateWriteOpResult> {
    return await this.courseModal.updateOne({ _id: courseId }, { $set: { courseMaterial: material } })
  }


  /**
   *
   *
   * @param {number} page
   * @param {number} size
   * @return {*}  {Promise<Course[]>}
   * @memberof CourseRepositoryImpl
   */
  public getAll(page: number, size: number): Promise<Course[]> {
    let pipe = [
      {
        $match:
        {
          active: true
        },
      },
      {
        '$lookup': {
          'from': 'session',
          'localField': 'session',
          'foreignField': '_id',
          'as': 'session',
          'pipeline': [
            {
              '$addFields': {
                'typeId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        {
                          '$type': '$typeId'
                        }, 'objectId'
                      ]
                    },
                    'then': '$typeId',
                    'else': {
                      //'$toObjectId': '$typeId'
                      '$convert': { 'input': '$typeId', 'to': 'objectId', 'onError': '', 'onNull': '' }
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'assessmentId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$type', 'ASSESSMENT'
                      ]
                    },
                    'then': '$typeId',
                    'else': null
                  }
                },
                'surveyId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$type', 'SURVEY'
                      ]
                    },
                    'then': '$typeId',
                    'else': null
                  }
                },
                'sessionId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$type', 'SESSION'
                      ]
                    },
                    'then': '$typeId',
                    'else': null
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'program',
                'localField': 'sessionId',
                'foreignField': '_id',
                'as': 'sessionId'
              }
            }, {
              '$lookup': {
                'from': 'surveys',
                'localField': 'surveyId',
                'foreignField': '_id',
                'as': 'surveyId'
              }
            }, {
              '$lookup': {
                'from': 'assessments',
                'localField': 'assessmentId',
                'foreignField': '_id',
                'as': 'assessmentId'
              }
            }, {
              '$addFields': {
                'sessionId': {
                  '$first': '$sessionId'
                },
                'assessmentId': {
                  '$first': '$assessmentId'
                },
                'surveyId': {
                  '$first': '$surveyId'
                }
              }
            }, {
              '$addFields': {
                'typeId': {
                  '$ifNull': [
                    '$assessmentId', {
                      '$ifNull': [
                        '$surveyId', '$sessionId'
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    ]
    return this.courseModal.aggregate(pipe);
  }

  /**
   *
   *
   * @param {*} course
   * @return {*}  {Promise<UpdateWriteOpResult>}
   * @memberof CourseRepositoryImpl
   */
  public update(course: any): Promise<UpdateWriteOpResult> {
    let _id = course._id;
    delete course._id;
    return this.courseModal.updateOne({ _id }, { $set: course })
  }
  /**
   *
   *
   * @param {*} course
   * @return {*}  {Promise<UpdateWriteOpResult>}
   * @memberof CourseRepositoryImpl
   */
  public activateRequested(course: any): Promise<UpdateWriteOpResult> {
    let _id = course._id;
    delete course._id;
    return this.courseModal.updateOne({ request_id: _id }, { $set: course })
  }

  /**
   *
   *
   * @param {string} _id
   * @return {*}  {Promise<any>}
   * @memberof CourseRepositoryImpl
   */
  public delete(_id: string): Promise<any> {
    return this.courseModal.deleteOne({ _id });
  }


  getUserProfileCalender(query): Promise<any> {
    return this.courseModal.aggregate([
      {
        '$match': {
          'active': true,
          'attendees': new Types.ObjectId(query.uid)
        }
      }, {
        '$addFields': {
          'start_date_logical': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$start_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          },
          'end_date_logical': {
            '$dateAdd': {
              'startDate': {
                '$toDate': '$end_date'
              },
              'unit': 'hour',
              'amount': 5
            }
          }
        }
      }, {
        '$match': {
          '$or': [{
            'start_date_logical': {
              '$gte': new Date(query.start_date),
              '$lte': new Date(query.end_date)
            }
          },
          {
            'end_date_logical': {
              '$gte': new Date(query.start_date),
              '$lte': new Date(query.end_date)
            }
          }]
        }
      }, {
        '$lookup': {
          'from': 'training_request',
          'localField': 'request_id',
          'foreignField': '_id',
          'as': 'request_id'
        }
      }, {
        '$unwind': {
          'path': '$request_id',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'training-type',
          'localField': 'request_id.type',
          'foreignField': '_id',
          'as': 'type'
        }
      }, {
        '$unwind': {
          'path': '$type',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'session',
          'localField': 'session',
          'foreignField': '_id',
          'as': 'session',
          'pipeline': [
            {
              '$addFields': {
                'typeId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        {
                          '$type': '$typeId'
                        }, 'objectId'
                      ]
                    },
                    'then': '$typeId',
                    'else': {
                      '$convert': {
                        'input': '$typeId',
                        'to': 'objectId',
                        'onError': '',
                        'onNull': ''
                      }
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'assessmentId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$type', 'ASSESSMENT'
                      ]
                    },
                    'then': '$typeId',
                    'else': null
                  }
                },
                'surveyId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$type', 'SURVEY'
                      ]
                    },
                    'then': '$typeId',
                    'else': null
                  }
                },
                'sessionId': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$type', 'SESSION'
                      ]
                    },
                    'then': '$typeId',
                    'else': null
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'program',
                'localField': 'sessionId',
                'foreignField': '_id',
                'as': 'sessionId'
              }
            }, {
              '$lookup': {
                'from': 'surveys',
                'localField': 'surveyId',
                'foreignField': '_id',
                'as': 'surveyId'
              }
            }, {
              '$lookup': {
                'from': 'assessments',
                'localField': 'assessmentId',
                'foreignField': '_id',
                'as': 'assessmentId'
              }
            }, {
              '$addFields': {
                'sessionId': {
                  '$first': '$sessionId'
                },
                'assessmentId': {
                  '$first': '$assessmentId'
                },
                'surveyId': {
                  '$first': '$surveyId'
                }
              }
            }, {
              '$addFields': {
                'typeId': {
                  '$ifNull': [
                    '$assessmentId', {
                      '$ifNull': [
                        '$surveyId', '$sessionId'
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'start_date_logical': {
            '$dateToParts': {
              'date': '$start_date_logical'
            }
          },
          'end_date_logical': {
            '$dateToParts': {
              'date': '$end_date_logical'
            }
          }
        }
      }, {
        '$addFields': {
          'dates': {
            '$map': {
              'input': {
                '$range': [
                  '$start_date_logical.day', {
                    '$cond': [
                      {
                        '$gt': [
                          '$end_date_logical.month', '$start_date_logical.month'
                        ]
                      }, 32, {
                        '$add': [
                          '$end_date_logical.day', 1
                        ]
                      }
                    ]
                  }, 1
                ]
              },
              'in': {
                'year': '$start_date_logical.year',
                'month': '$start_date_logical.month',
                'day': '$$this'
              }
            }
          }
        }
      }, {
        '$unwind': {
          'path': '$dates'
        }
      }, {
        '$group': {
          '_id': '$dates',
          'data': {
            '$push': '$$ROOT'
          }
        }
      }
    ])
  }

  public checkUser(courseId: string, userId: string, typeId: string, type: string): Promise<Course[]> {
    let pipe = [
      {
        '$match': {
          '_id': new mongoose.Types.ObjectId(courseId)
        }
      }, {
        '$lookup': {
          'from': 'session',
          'localField': 'session',
          'foreignField': '_id',
          'as': 'session',
          'pipeline': [
            {
              '$match': {
                '$or': [
                  {
                    'sessionType': 'Survey'
                  }, {
                    'sessionType': 'Assessment'
                  }
                ]
              }
            }
          ]
        }
      }, {
        '$project': {
          'isUserIn': {
            '$in': [new mongoose.Types.ObjectId(userId), '$attendees']
          },
          'IsActiveToday': {
            '$and': [
              { '$gte': ['$$NOW', { '$toDate': '$start_date' }] },
              { '$lte': ['$$NOW', { '$toDate': '$end_date' }] }
            ]
          }
        }
      }
    ];

    if (type === 'assessment') {
      pipe[2]['$project']['isAssessmentIn'] = {
        '$in': [new mongoose.Types.ObjectId(typeId), '$session.assessmentId']
      };
    } else if (type === 'survey') {
      pipe[2]['$project']['isSurveyIn'] = {
        '$in': [new mongoose.Types.ObjectId(typeId), '$session.surveyId']
      };
    }

    return this.courseModal.aggregate(pipe);
  }

  /**
     *Get all assessment survey by user
     *
     * @param {string} uid
     * @return {*}  {Promise<any[]>}
     * @memberof CourseRepositoryImpl
     */
  async GetAllAssessmentSurveyByUser(uid: string): Promise<any> {
    let oId = new mongoose.Types.ObjectId(uid)
    let pipeAssesssment: any = [
      {
        '$match': {
          '$and': [
            {
              'attendees': {
                '$in': [oId, new mongoose.Types.ObjectId('65b891b2664fcb8124ddb933')]
              },
              'active': true
            }
          ]
        }
      }, {
        '$lookup': {
          'from': 'session',
          'localField': 'session',
          'foreignField': '_id',
          'as': 'session',
          'pipeline': [
            {
              '$match': {
                'assessmentId': {
                  '$ne': null

                }
              }
            }, {
              '$addFields': {
                'assessmentId': {
                  '$toObjectId': '$assessmentId'
                }
              }
            }, {
              '$lookup': {
                'from': 'assessments',
                'localField': 'assessmentId',
                'foreignField': '_id',
                'as': 'assessment'
              }
            }, {
              '$unwind': {
                'path': '$assessment'
              }
            }, {
              '$replaceRoot': {
                'newRoot': '$assessment'
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
      }
    ]

    const assessment = await this.courseModal.aggregate(pipeAssesssment).exec();


    let pipeSurvey: any = [
      {
        '$match': {
          '$and': [
            {
              'attendees': {
                '$in': [oId, new mongoose.Types.ObjectId('65b891b2664fcb8124ddb933')]
              },
              'active': true
            }
          ]
        }
      }, {
        '$lookup': {
          'from': 'session',
          'localField': 'session',
          'foreignField': '_id',
          'as': 'session',
          'pipeline': [
            {
              '$match': {
                'surveyId': {
                  '$ne': null
                }
              }
            }, {
              '$addFields': {
                'surveyId': {
                  '$toObjectId': '$surveyId'
                }
              }
            }, {
              '$lookup': {
                'from': 'surveys',
                'localField': 'surveyId',
                'foreignField': '_id',
                'as': 'survey'
              }
            }, {
              '$unwind': {
                'path': '$survey'
              }
            }, {
              '$replaceRoot': {
                'newRoot': '$survey'
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
      }
    ]

    const survey = await this.courseModal.aggregate(pipeSurvey).exec();

    return { assessmentData: assessment, surveyData: survey }
  }

  async getCourseResults(id: string): Promise<any> {
    let courseId = new mongoose.Types.ObjectId(id);
    let pipe: any = [
      {
        '$match': {
          '_id': courseId
        }
      }, {
        '$lookup': {
          'from': 'session',
          'localField': 'session',
          'foreignField': '_id',
          'as': 'session'
        }
      }, {
        '$addFields': {
          'trainers': {
            '$setUnion': [
              '$session.trainer', []
            ]
          },
          'sessiontype': '$session.sessionType'
        }
      }, {
        '$addFields': {
          'sessiontype': {
            '$arrayToObject': {
              '$map': {
                'input': {
                  '$setUnion': '$sessiontype'
                },
                'as': 'sessionType',
                'in': {
                  'k': '$$sessionType',
                  'v': {
                    '$reduce': {
                      'input': '$sessiontype',
                      'initialValue': 0,
                      'in': {
                        '$cond': [
                          {
                            '$eq': [
                              '$$this', '$$sessionType'
                            ]
                          }, {
                            '$add': [
                              '$$value', 1
                            ]
                          }, '$$value'
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'survey-attempts',
          'localField': '_id',
          'foreignField': 'courseId',
          'as': 'ratings',
          'pipeline': [
            {
              '$addFields': {
                'ratingId': {
                  '$toObjectId': '$ratingForID'
                }
              }
            }, {
              '$lookup': {
                'from': 'users',
                'localField': 'ratingId',
                'foreignField': '_id',
                'as': 'ratingId',
                'pipeline': [
                  {
                    '$project': {
                      '_id': 1,
                      'email': 1
                    }
                  }
                ]
              }
            }, {
              '$addFields': {
                'ratingEmail': {
                  '$first': '$ratingId.email'
                }
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'trainerRatings': {
            '$reduce': {
              'input': '$ratings',
              'initialValue': [],
              'in': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$$this.ratingFor', 'Trainer'
                    ]
                  },
                  'then': {
                    '$concatArrays': [
                      '$$value', [
                        {
                          'email': '$$this.ratingEmail',
                          'userId': {
                            '$toObjectId': '$$this.ratingForID'
                          },
                          'surveyId': '$$this.surveyId',
                          'questions': {
                            '$reduce': {
                              'input': '$$this.questions',
                              'initialValue': [],
                              'in': {
                                '$cond': [
                                  {
                                    '$eq': [
                                      '$$this.type', 'STAR_RATING'
                                    ]
                                  }, {
                                    '$concatArrays': [
                                      '$$value', '$$this.meta.fields'
                                    ]
                                  }, {
                                    '$concatArrays': [
                                      '$$value', []
                                    ]
                                  }
                                ]
                              }
                            }
                          }
                        }
                      ]
                    ]
                  },
                  'else': '$$value'
                }
              }
            }
          },
          'userRatings': {
            '$reduce': {
              'input': '$ratings',
              'initialValue': [],
              'in': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$$this.ratingFor', 'User'
                    ]
                  },
                  'then': {
                    '$concatArrays': [
                      '$$value', [
                        {
                          'email': '$$this.ratingEmail',
                          'userId': {
                            '$toObjectId': '$$this.ratingForID'
                          },
                          'surveyId': '$$this.surveyId',
                          'questions': {
                            '$reduce': {
                              'input': '$$this.questions',
                              'initialValue': [],
                              'in': {
                                '$cond': [
                                  {
                                    '$eq': [
                                      '$$this.type', 'STAR_RATING'
                                    ]
                                  }, {
                                    '$concatArrays': [
                                      '$$value', '$$this.meta.fields'
                                    ]
                                  }, {
                                    '$concatArrays': [
                                      '$$value', []
                                    ]
                                  }
                                ]
                              }
                            }
                          }
                        }
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
          'userRatings': {
            '$map': {
              'input': {
                '$setUnion': '$trainerRatings.email'
              },
              'as': 'traineremail',
              'in': {
                'email': '$$traineremail',
                'surveyIds': {
                  '$reduce': {
                    'input': '$trainerRatings',
                    'initialValue': [],
                    'in': {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$$this.email', '$$traineremail'
                          ]
                        },
                        'then': {
                          '$concatArrays': [
                            '$$value', [
                              '$$this.surveyId'
                            ]
                          ]
                        },
                        'else': '$$value'
                      }
                    }
                  }
                },
                'score': {
                  '$reduce': {
                    'input': '$trainerRatings',
                    'initialValue': [],
                    'in': {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$$this.email', '$$traineremail'
                          ]
                        },
                        'then': {
                          '$concatArrays': [
                            '$$value', '$$this.questions'
                          ]
                        },
                        'else': '$$value'
                      }
                    }
                  }
                },
                'userId': {
                  '$reduce': {
                    'input': '$trainerRatings',
                    'initialValue': '',
                    'in': {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$$this.email', '$$traineremail'
                          ]
                        },
                        'then': '$$this.userId',
                        'else': '$$value'
                      }
                    }
                  }
                }
              }
            }
          },
          'trainerRatings': {
            '$map': {
              'input': {
                '$setUnion': '$userRatings.email'
              },
              'as': 'useremail',
              'in': {
                'email': '$$useremail',
                'surveyIds': {
                  '$reduce': {
                    'input': '$userRatings',
                    'initialValue': [],
                    'in': {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$$this.email', '$$useremail'
                          ]
                        },
                        'then': {
                          '$concatArrays': [
                            '$$value', [
                              '$$this.surveyId'
                            ]
                          ]
                        },
                        'else': '$$value'
                      }
                    }
                  }
                },
                'score': {
                  '$reduce': {
                    'input': '$userRatings',
                    'initialValue': [],
                    'in': {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$$this.email', '$$useremail'
                          ]
                        },
                        'then': {
                          '$concatArrays': [
                            '$$value', '$$this.questions'
                          ]
                        },
                        'else': '$$value'
                      }
                    }
                  }
                },
                'userId': {
                  '$reduce': {
                    'input': '$userRatings',
                    'initialValue': '',
                    'in': {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$$this.email', '$$useremail'
                          ]
                        },
                        'then': '$$this.userId',
                        'else': '$$value'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'trainerRatings': {
            '$map': {
              'input': '$trainerRatings',
              'in': {
                'email': '$$this.email',
                'surveyIds': '$$this.surveyIds',
                'userId': '$$this.userId',
                'score': {
                  '$reduce': {
                    'input': '$$this.score',
                    'initialValue': {
                      'sum': 0,
                      'count': 0
                    },
                    'in': {
                      'sum': {
                        '$add': [
                          '$$value.sum', '$$this.value'
                        ]
                      },
                      'count': {
                        '$add': [
                          '$$value.count', 1
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          'userRatings': {
            '$map': {
              'input': '$userRatings',
              'in': {
                'email': '$$this.email',
                'surveyIds': '$$this.surveyIds',
                'userId': '$$this.userId',
                'score': {
                  '$reduce': {
                    'input': '$$this.score',
                    'initialValue': {
                      'sum': 0,
                      'count': 0
                    },
                    'in': {
                      'sum': {
                        '$add': [
                          '$$value.sum', '$$this.value'
                        ]
                      },
                      'count': {
                        '$add': [
                          '$$value.count', 1
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'trainerRatings': {
            '$map': {
              'input': '$trainerRatings',
              'in': {
                'email': '$$this.email',
                'userId': '$$this.userId',
                'surveyIds': {
                  '$first': '$$this.surveyIds'
                },
                'score': '$$this.score',
                'avg': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$$this.score.count', 0
                      ]
                    },
                    'then': null,
                    'else': {
                      '$divide': [
                        '$$this.score.sum', '$$this.score.count'
                      ]
                    }
                  }
                }
              }
            }
          },
          'userRatings': {
            '$map': {
              'input': '$userRatings',
              'in': {
                'email': '$$this.email',
                'userId': '$$this.userId',
                'surveyIds': {
                  '$first': '$$this.surveyIds'
                },
                'score': '$$this.score',
                'avg': {
                  '$cond': {
                    'if': {
                      '$eq': [
                        '$$this.score.count', 0
                      ]
                    },
                    'then': null,
                    'else': {
                      '$divide': [
                        '$$this.score.sum', '$$this.score.count'
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'avgTrainerRating': {
            '$reduce': {
              'input': '$trainerRatings',
              'initialValue': {
                'sum': 0,
                'count': 0
              },
              'in': {
                'sum': {
                  '$add': [
                    '$$value.sum', '$$this.avg'
                  ]
                },
                'count': {
                  '$add': [
                    '$$value.count', {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$$this.avg', null
                          ]
                        },
                        'then': 0,
                        'else': 1
                      }
                    }
                  ]
                }
              }
            }
          },
          'avgUserRating': {
            '$reduce': {
              'input': '$userRatings',
              'initialValue': {
                'sum': 0,
                'count': 0
              },
              'in': {
                'sum': {
                  '$add': [
                    '$$value.sum', '$$this.avg'
                  ]
                },
                'count': {
                  '$add': [
                    '$$value.count', {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$$this.avg', null
                          ]
                        },
                        'then': 0,
                        'else': 1
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'avgTrainerRating': {
            '$cond': {
              'if': {
                '$eq': [
                  '$avgTrainerRating.count', 0
                ]
              },
              'then': null,
              'else': {
                '$divide': [
                  '$avgTrainerRating.sum', '$avgTrainerRating.count'
                ]
              }
            }
          },
          'avgUserRating': {
            '$cond': {
              'if': {
                '$eq': [
                  '$avgUserRating.count', 0
                ]
              },
              'then': null,
              'else': {
                '$divide': [
                  '$avgUserRating.sum', '$avgUserRating.count'
                ]
              }
            }
          }
        }
      }, {
        '$facet': {
          'Training Details': [
            {
              '$project': {
                'title': '$title',
                'start_date': '$start_date',
                'end_date': '$end_date',
                'number_of_users': {
                  '$size': '$attendees'
                },
                'number_of_trainers': {
                  '$size': '$trainers'
                },
                'session_count': '$sessiontype',
                'completed_attendees': {
                  '$size': '$userRatings'
                }
              }
            }
          ],
          'Rating': [
            {
              '$project': {
                'user_ratings': '$userRatings',
                'trainer_ratings': '$trainerRatings',
                'avgTrainerRating': 1,
                'avgUserRating': 1
              }
            }
          ]
        }
      }, {
        '$unwind': {
          'path': '$Training Details',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$unwind': {
          'path': '$Rating',
          'preserveNullAndEmptyArrays': true
        }
      }
    ];
    return await this.courseModal.aggregate(pipe).exec();
  }

}