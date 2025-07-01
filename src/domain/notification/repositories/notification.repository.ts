import { InjectModel } from "@nestjs/mongoose";
import { Notification } from "../dto/notification.dto";
import { NotificationRepository } from "../interfaces/notification-repository.interface";
import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class NotificationRepositoryImpl implements NotificationRepository {

  /**
   * Creates an instance of NotificationRepositoryImpl.
   * @param {Model<Notification>} notificationModel
   * @param {ActiveUserSocketGateway} socketGateway
   * @memberof NotificationRepositoryImpl
   */
  constructor(
    @InjectModel('notification') private readonly notificationModel: Model<Notification>
  ) { }

  /**
   *Create a new notification
   *
   * @param {Notification} notification
   * @return {*}  {Promise<Notification>}
   * @memberof NotificationRepositoryImpl
   */
  create(notification: Notification): Promise<Notification> {
    return this.notificationModel.create(notification).then(e => e.populate('sender sender.ou'));
  }

  /**
   *Mark notification as seen
   *
   * @param {string} userId
   * @param {string} notificationId
   * @return {*}  {Promise<UpdateWriteOpResult>}
   * @memberof NotificationRepositoryImpl
   */
  async addToSeen(userId: string, notificationId: string): Promise<UpdateWriteOpResult> {
    let notification = await this.notificationModel.findById(notificationId);
    notification.seenBy.push(userId);
    return this.notificationModel.updateOne({ _id: notificationId }, { $set: notification });
  }

  /**
   *Get all notifications for a specific user
   *
   * @param {string} userId
   * @return {*}  {Promise<Notification[]>}
   * @memberof NotificationRepositoryImpl
   */
  getByUser(userId: string): Promise<Notification[]> {
    let objectId = new mongoose.Types.ObjectId(userId);
    let pipe: any = [
      {
        '$match': {
          '$or': [
            {
              'receiver': {
                '$in': [objectId]
              }
            }, {
              'receiver': []
            }
          ],
          '$and': [
            {
              'sender': {
                '$ne': objectId
              }
            }
          ]
        }
      }, {
        '$addFields': {
          'dateDif': {
            '$dateDiff': {
              'startDate': {
                '$toDate': '$createdAt'
              },
              'endDate': {
                '$toDate': {
                  '$dateToString': {
                    'format': '%Y-%m-%d',
                    'date': '$$NOW'
                  }
                }
              },
              'unit': 'hour'
            }
          }
        }
      }, {
        '$match': {
          '$expr': {
            '$cond': {
              'if': {
                '$in': [
                  objectId, '$seenBy'
                ]
              },
              'then': {
                '$lte': [
                  '$dateDif', 24
                ]
              },
              'else': {}
            }
          }
        }
      }, {
        '$sort': {
          'createdAt': -1
        }
      }, {
        '$limit': 10
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'sender',
          'foreignField': '_id',
          'as': 'sender'
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'data.updated_by',
          'foreignField': '_id',
          'as': 'data.updated_by'
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'data.ou',
          'foreignField': '_id',
          'as': 'data.ou',
          'pipeline': [
            {
              '$graphLookup': {
                'from': 'organization-units',
                'startWith': '$parent',
                'connectFromField': 'parent',
                'connectToField': '_id',
                'as': 'string',
                'depthField': 'depth'
              }
            }, {
              '$addFields': {
                'image_new': {
                  '$reduce': {
                    'input': '$string',
                    'initialValue': null,
                    'in': {
                      '$cond': [
                        {
                          '$eq': [
                            '$$this.parent', null
                          ]
                        }, '$$this.image', '$$value'
                      ]
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'image': {
                  '$ifNull': [
                    '$image_new', '$image'
                  ]
                },
                'image_sq': {
                  '$ifNull': [
                    '$image_new', '$image'
                  ]
                }
              }
            }, {
              '$unset': 'string'
            }
          ]
        }
      }, {
        '$unwind': {
          'path': '$sender',
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'sender.ou',
          'foreignField': '_id',
          'as': 'sender.ou'
        }
      }, {
        '$unwind': {
          'path': '$data.ou',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$unwind': {
          'path': '$data.updated_by',
          'preserveNullAndEmptyArrays': true
        }
      }
    ];
    return this.notificationModel.aggregate(pipe);
  }

  /**
   *Get all notifications for a specific user including own
   *
   * @param {string} userId
   * @return {*}  {Promise<Notification[]>}
   * @memberof NotificationRepositoryImpl
   */  
  getByUserWithOwn(userId: string): Promise<Notification[]> {
    let objectId = new mongoose.Types.ObjectId(userId);
    let pipe: any = [
      {
        '$match': {
          '$or': [
            {
              'receiver': {
                $in: [objectId] // Convert the string to ObjectId and check if it's in the receiver array
              }
            },
            {
              'receiver': []
            },
          ]
        }
      },
      {
        '$addFields': {
          'dateDif': {
            '$dateDiff': {
              'startDate': {
                '$toDate': '$createdAt'
              },
              'endDate': {
                '$toDate': {
                  '$dateToString': {
                    'format': '%Y-%m-%d',
                    'date': '$$NOW'
                  }
                }
              },
              'unit': 'hour'
            }
          }
        }
      }, {
        '$match': {
          '$expr': {
            '$cond': {
              'if': {
                '$in': [
                  objectId, '$seenBy'
                ]
              },
              'then': {
                '$lte': [
                  '$dateDif', 24
                ]
              },
              'else': {}
            }
          }
        }
      },
      {
        '$sort': {
          'createdAt': -1
        }
      },
      {
        '$lookup': {
          'from': 'users',
          'localField': 'sender',
          'foreignField': '_id',
          'as': 'sender'
        }
      },
      {
        '$lookup': {
          'from': 'users',
          'localField': 'data.updated_by',
          'foreignField': '_id',
          'as': 'data.updated_by'
        }
      },
      {
        '$lookup': {
          'from': 'organization-units',
          'localField': 'data.ou',
          'foreignField': '_id',
          'as': 'data.ou',
          'pipeline': [
            {
              '$graphLookup': {
                'from': 'organization-units',
                'startWith': '$parent',
                'connectFromField': 'parent',
                'connectToField': '_id',
                'as': 'string',
                'depthField': 'depth'
              }
            }, {
              '$addFields': {
                'image_new': {
                  '$reduce': {
                    'input': '$string',
                    'initialValue': null,
                    'in': {
                      '$cond': [
                        {
                          '$eq': [
                            '$$this.parent', null
                          ]
                        }, '$$this.image', '$$value'
                      ]
                    }
                  }
                }
              }
            }, {
              '$addFields': {
                'image': {
                  '$ifNull': [
                    '$image_new', '$image'
                  ]
                },
                'image_sq': {
                  '$ifNull': [
                    '$image_new', '$image'
                  ]
                }
              }
            }, {
              '$unset': 'string'
            }
          ]
        }
      },
      {
        '$unwind': {
          'path': '$sender',
          'preserveNullAndEmptyArrays': false
        }
      },
      {
        '$unwind': {
          'path': '$data.ou',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$unwind': {
          'path': '$data.updated_by',
          'preserveNullAndEmptyArrays': true
        }
      }
    ];
    return this.notificationModel.aggregate(pipe);
  }

}


