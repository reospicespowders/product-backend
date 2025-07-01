import { Inject, Injectable } from '@nestjs/common';
import { ContentUpdate, UpdateContentUpdate } from 'src/domain/data/dto/content-update.dto';
import { ContentUpdateRepository } from 'src/domain/data/interfaces/content-update-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationService } from '../notification/notification.service';
import { Types } from 'mongoose';

@Injectable()
export class ContentUpdateService {

  constructor(
    @Inject('ContentUpdateRepository') private contentUpdateRepository: ContentUpdateRepository,
    private notificationService: NotificationService
  ) { }

  public async getAll(query, page, offset): Promise<GenericResponse<any>> {
    const res = await this.contentUpdateRepository.getAll(query, page, offset);
    
    const response: GenericResponse<any> = {
      success: true,
      message: 'Content update log fetched Successfully',
      data: res,
    };
    return response;
  }

  public async getUsers(page, offset): Promise<GenericResponse<any>> {
    const res = await this.contentUpdateRepository.getUsers(page, offset);
    
    const response: GenericResponse<any> = {
      success: true,
      message: 'Content update users fetched Successfully',
      data: res,
    };
    return response;
  }



  public async create(data: ContentUpdate): Promise<GenericResponse<ContentUpdate>> {
    const res = await this.contentUpdateRepository.create(data);


    // console.log("COntemt update : = ",data )

    let doc: any = await this.contentUpdateRepository.populateProperty(data, ['ous', 'updated_by']);

    let docData: any = { ...doc._doc };
    docData['ou'] = docData.ous;
    delete docData.ous;
    //Content received for approval
    const notification: Notification = {
      receiver: [],
      seenBy: [],
      sender: docData.updated_by._id.toString(),
      type: NotificationType.CONTENT_RECEIVED_FOR_APPROVAL,
      category: NotificationCategory.DATA_EVENTS,
      data: docData
    }
    this.notificationService.create(notification);

    const response: GenericResponse<ContentUpdate> = {
      success: true,
      message: 'Content update log added Successfully',
      data: res,
    };
    return response;
  }

  public async multipleDelete(data: Array<ContentUpdate>): Promise<GenericResponse<any>> {
    const res = await this.contentUpdateRepository.multipleDelete(data);
    // let doc: any = await this.contentUpdateRepository.populateProperty(data, ['ous', 'updated_by']);

    // let docData: any = { ...doc._doc };
    // docData['ou'] = docData.ous;
    // delete docData.ous;
    // //Content received for approval
    // const notification: Notification = {
    //   receiver: [],
    //   seenBy: [],
    //   sender: docData.updated_by._id.toString(),
    //   type: NotificationType.CONTENT_RECEIVED_FOR_APPROVAL,
    //   category: NotificationCategory.DATA_EVENTS,
    //   data: docData
    // }
    // this.notificationService.create(notification);

    const response: GenericResponse<ContentUpdate> = {
      success: true,
      message: 'Content update log added Successfully',
      data: res,
    };
    return response;
  }


  public async update(data: UpdateContentUpdate): Promise<GenericResponse<ContentUpdate>> {
    const res = await this.contentUpdateRepository.update(data);

    const response: GenericResponse<ContentUpdate> = {
      success: true,
      message: 'Content update log updated Successfully',
      data: res,
    };
    return response;
  }

  public async getView(status: string, page: number, offset: number): Promise<GenericResponse<ContentUpdate[]>> {

    let pipe = [
      {
        '$match': {
          'status': status
        }
      }, {
        '$addFields': {
          'service_id': {
            '$ifNull': [
              '$service_id', {
                '$concat': [
                  '$after.name', '-', '$after.ous'
                ]
              }
            ]
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
        '$addFields': {
          'updated_by': {
            '$ifNull': [
              {
                '$first': '$updated_by'
              }, 'no user found'
            ]
          },
          'approved_by': {
            '$ifNull': [
              {
                '$first': '$approved_by'
              }, 'no user found'
            ]
          }
        }
      }, {
        '$group': {
          '_id': '$service_id',
          'content_updates': {
            '$addToSet': {
              '_id': '$_id',
              'status': '$status',
              'type': '$type',
              'before': '$before',
              'after': '$after',
              'service_id': '$service_id',
              'updated_by': '$updated_by',
              'approved_by': '$approved_by',
              'reject_reason': '$reject_reason',
              'updatedAt': '$updatedAt',
              'createdAt': '$createdAt',
              'adminChange': '$adminChange'
            }
          },
          'ous': {
            '$first': '$ous'
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
        '$lookup': {
          'from': 'data',
          'localField': '_id',
          'foreignField': '_id',
          'as': 'service'
        }
      }, {
        '$addFields': {
          'id': {
            '$ifNull': [
              {
                '$first': '$service.id'
              }, null
            ]
          },
          'name': {
            '$ifNull': [
              {
                '$first': '$service.name'
              }, {
                '$first': '$content_updates.after.name'
              }
            ]
          },
          'type': {
            '$ifNull': [
              {
                '$first': '$service.type'
              }, {
                //'$toObjectId': {'$first': '$content_updates.after.type'}
                '$convert': {'input': {'$first': '$content_updates.after.type'}, 'to' : 'objectId', 'onError': '','onNull': ''}
              }
            ]
          },
          'active': {
            '$ifNull': [
              {
                '$first': '$service.active'
              }, false
            ]
          },
          'updatedAt': {
            '$ifNull': [
              {
                '$first': '$service.updatedAt'
              }, null
            ]
          },
          'last_update': {
            '$max': '$content_updates.updatedAt'
          }
        }
      }, {
        '$match': {
          'id': {
            '$ne': null
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
          },
          'service': {
            '$first': '$service'
          }
        }
      }, {
        '$sort': {
          'last_update': -1
        }
      }, {
        '$unset': 'ous'
      }
    ]

    const res = await this.contentUpdateRepository.executePipe(pipe);

    const response: GenericResponse<ContentUpdate[]> = {
      success: true,
      message: 'Content update log fetched Successfully',
      data: res,
    };
    return response;
  }

  public async delete(_id: string): Promise<GenericResponse<any>> {
    const res = await this.contentUpdateRepository.delete(_id);

    const response: GenericResponse<any> = {
      success: true,
      message: res.deletedCount > 0 ? 'Data field deleted Successfully' : 'Data field Id not found',
      data: res,
    };
    return response;
  }

  public async getOne(_id: string): Promise<GenericResponse<ContentUpdate>> {
    const res = await this.contentUpdateRepository.getOne(_id);

    const response: GenericResponse<any> = {
      success: true,
      message: res ? 'Data field fetched Successfully' : 'Data field not found',
      data: res,
    };

    return response;
  }

  public async approve(data: UpdateContentUpdate | any): Promise<GenericResponse<ContentUpdate>> {
    try {

      switch (data.type) {
        //If Data edit request is approved
        case 'EDIT':
          if (data.after.name !== data.before.name) {

            let updateName: any = {
              _id: data.service_id,
              name: data.after.name
            }

            await this.contentUpdateRepository.updateName(updateName)
          }

          //updating service

          for (let i = 0; i < data.after.fields.length; i++) {
            if(data.after.fields[i].isNew && data.after.fields[i].isChecked == true) {
              let newField = {
                service_id: data.service_id,
                data : data.after.fields[i].data,
                type: new Types.ObjectId(data.after.fields[i]._id),
                label : data.after.fields[i].name
              }
             
              await this.contentUpdateRepository.addNewField(newField)
            }
            else if (data.after.fields[i].isChecked == true) {
        
              if (data.after.fields[i].type.name == 'Data Item') {
                await this.contentUpdateRepository.updateData({
                  service_id: data.service_id,
                  data: data.after.fields[i].data._id,
                  type: data.after.fields[i].field._id
                })
              }
              else {
                await this.contentUpdateRepository.updateData({
                  service_id: data.service_id,
                  data: data.after.fields[i].data,
                  type: data.after.fields[i].field._id
                })
              }
            }
          }


          // let editData = await this.contentUpdateRepository.updateData(data)


          //Retrieving older data
          let previousLog :any = await this.contentUpdateRepository.getOne(data._id)

          //fields fo previous log
          let f10 = previousLog.after.fields
          //fields on approval time
          let f20 = data.after.fields
          //Fields changed by the admin
          let changedFields0 = []

          // separating fields that are changes by the admin
          for (let i = 0; i < f10.length; i++) {
            if (f10[i].isChecked) {
              const f1Obj0 = f10[i];
              const f2Obj0 = f20.filter(e => e.label.name == f1Obj0.label.name)[0];
              //check for type Data Item
              if (typeof f1Obj0.data === 'object') {
                if (f1Obj0.data._id != f2Obj0.data._id) {
                  changedFields0.push(f2Obj0)
                }
              } else {
                if (f1Obj0.data != f2Obj0.data) {
                  changedFields0.push(f2Obj0)
                }
              }

            }
          }
         
          // to set is isEdited check to user after logs

          for(let i = 0 ; i < previousLog.after.fields.length ; i++){
            const matchingItem = data.after.fields.find((item1 : any) => (
              !previousLog.after.fields[i]?.isNew && item1?.field?._id === previousLog.after.fields[i]?.field?._id) || 
              (previousLog.after.fields[i]?.isNew &&  item1?._id === previousLog.after.fields[i]?._id));
           
             

            if(!previousLog.after.fields[i].wasEdited){
              previousLog.after.fields[i].wasEdited =  matchingItem.isChecked;
            }
            else previousLog.after.fields[i].wasEdited =  matchingItem.wasEdited;
            previousLog.after.fields[i].isChecked =  matchingItem.isChecked;
          }

          data.service_id = data.service_id
          data.adminChange = { fields: changedFields0 }
          data.after = previousLog.after

          

          //Updating log
          let updateLog = await this.contentUpdateRepository.update(data);


          //Populating ou and approved_by in update log
          let doc: any = await this.contentUpdateRepository.populateProperty(previousLog, ['ous','updated_by']);

          let docData: any = { ...doc._doc };
          docData['ou'] = docData.ous;
          delete docData.ous;

          //Data Update notificaiton here
          const notification: Notification = {
            receiver: [],
            seenBy: [],
            sender: data.approved_by,
            type: NotificationType.DATA_UPDATE,
            category: NotificationCategory.DATA_EVENTS,
            data: docData
          }
          this.notificationService.create(notification);
          break;
        //If Add Data request is approved
        case 'ADD SERVICE':

          if (data.id == null) {
            //Retrieving greatest Id
            const greatestID = await this.contentUpdateRepository.executeDataPipe([
              {
                $group: {
                  _id: null,
                  id: { $max: "$id" }
                }
              }
            ])
            data.after.id = greatestID[0].id + 1
          }

          //Retrieving older data
          let preLog = await this.contentUpdateRepository.getOne(data._id)

          //fields fo previous log
          let f1 = preLog.after.fields
          //fields on approval time
          let f2 = data.after.fields
          //Fields changed by the admin
          let changedFields = []

          // separating fields that are changes by the admin
          for (let i = 0; i < f1.length; i++) {
            const f1Obj = f1[i];
            const f2Obj = f2.filter(e => e.label == f1Obj.label)[0];
            //check for type Data Item
            if (typeof f1Obj.data === 'object') {
              if (f1Obj.data._id != f2Obj.data._id) {
                changedFields.push(f2Obj)
              }
            } else {
              if (f1Obj.data != f2Obj.data) {
                changedFields.push(f2Obj)
              }
            }

          }

          //validation for license

          const modifiedObject = { ...data }; // Create a copy to avoid modifying the original object

          if (modifiedObject.after && Array.isArray(modifiedObject.after.fields)) {
            modifiedObject.after.fields = modifiedObject.after.fields.map((field) => {
              if (typeof field.data === 'object' && field.data._id) {
                return {
                  data: field.data._id,
                  label: field.label,
                  type: field.type,
                  item_Id: field.item_Id,
                  item_Field: field.item_Id
                };
              }
              return field;
            });
          }

          // Creating data

          const addData = await this.contentUpdateRepository.createData(modifiedObject.after);


          data.service_id = addData._id
          data.adminChange = { fields: changedFields }
          data.after = preLog.after

          let updateLog2 = await this.contentUpdateRepository.update(data);

          break
        case 'DELETE':
          const isUpdated = await this.contentUpdateRepository.deleteData(data)
          //Updating log
          let updateLog3 = await this.contentUpdateRepository.update(data);
          break;
        case 'OU CHANGE':
          let updateName1: any = {
            _id: data.service_id,
            ous: data.after.newOu._id
          }
          let ouChange = await this.contentUpdateRepository.updateName(updateName1)
          //Updating log
          let updateLog4 = await this.contentUpdateRepository.update(data);
          break;
        default:
          throw new Error("Invalid Log");
      }
      const response: GenericResponse<ContentUpdate> = {
        success: true,
        message: 'Changes Accepted Successfully',
        data: null,
      };
      return response;

    } catch (error) {
      throw new Error(error)
    }
  }


  public async  undoDelete (data : any): Promise<GenericResponse<any>> {
    try {



      let dataUpdate = await this.contentUpdateRepository.undoDeleteData(data.service_id);
      
      let updateLog : any= {
        _id : data._id,
        isUndoDelete : true
      }

      await this.contentUpdateRepository.update(updateLog);

      const response: GenericResponse<any> = {
        success: true,
        message: 'Changes reverted Successfully',
        data: null,
      };
      return response;

    } catch (error) {
      throw new Error(error)
    }
  }

  public async reject(data: UpdateContentUpdate | any): Promise<GenericResponse<ContentUpdate>> {
    try {

      let updateLog = await this.contentUpdateRepository.update(data);

      const response: GenericResponse<ContentUpdate> = {
        success: true,
        message: 'Changes Rejected Successfully',
        data: null,
      };
      return response;

    } catch (error) {
      throw new Error(error)
    }
  }

  
}