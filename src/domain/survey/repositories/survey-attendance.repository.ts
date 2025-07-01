import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { Attendance, SurveyAttendance } from "../dto/survey-attendance.dto";
import { SurveyAttendanceRepository } from "../interfaces/survey-attendance-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from '@nestjs/common';

@Injectable()
export class SurveyAttendanceRepositoryImpl implements SurveyAttendanceRepository {

    constructor(@InjectModel('survey-attendance') private surveyAttendanceModal: Model<SurveyAttendance>) { }


    markAttendance(attendance: Attendance, surveyId: string): Promise<mongoose.UpdateWriteOpResult> {
        return this.surveyAttendanceModal.updateOne(
            { surveyId: surveyId }, // Match all documents
            {
                $set: { "attendance.$[elem]": attendance } // Update the "marked" field
            },
            {
                arrayFilters: [{ "elem.email": attendance.email }] // Condition to match the specific email
            }
        )
    }

    createBlankEntries(attendences: Attendance[], surveyId: string) {
        return this.surveyAttendanceModal.updateOne({ surveyId }, { $addToSet: { attendance: attendences } })
    }

    create(surveyAttendance: SurveyAttendance): Promise<SurveyAttendance> {
        return this.surveyAttendanceModal.create(surveyAttendance);
    }


    createBulk(surveyAttendances: SurveyAttendance[]): Promise<SurveyAttendance[]> {
        return this.surveyAttendanceModal.create(surveyAttendances);
    }


    async getByEmailAndId(id: string, email: string): Promise<SurveyAttendance> {
        let pipe = [
            {
                '$match': {
                    '$and': [
                        {
                            'email': email
                        }, {
                            'surveyId': new mongoose.Types.ObjectId(id)
                        }
                    ]
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'email',
                    'foreignField': 'email',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': true
                }
            }
        ];
        let res = await this.surveyAttendanceModal.aggregate(pipe);
        return res.length > 0 ? res[0] : [];
    }


    update(surveyAttendance: SurveyAttendance): Promise<UpdateWriteOpResult> {
        return this.surveyAttendanceModal.updateOne({ surveyId: surveyAttendance.surveyId }, { $set: surveyAttendance })
    }


    async getBySurveyId(id: string): Promise<SurveyAttendance> {
        let pipe = [
            {
              '$match': {
                'surveyId': new mongoose.Types.ObjectId(id)
              }
            }, {
              '$unwind': '$attendance'
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'attendance.email', 
                'foreignField': 'email', 
                'as': 'attendance.user'
              }
            }, {
              '$unwind': {
                'path': '$attendance.user', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$group': {
                '_id': '$_id', 
                'attendance': {
                  '$push': {
                    'email': '$attendance.email', 
                    'status': '$attendance.status', 
                    'markType': '$attendance.markType', 
                    'timestamp': '$attendance.timestamp', 
                    'user': '$attendance.user'
                  }
                }, 
                'surveyId': {
                  '$first': '$surveyId'
                }, 
                'createdAt': {
                  '$first': '$createdAt'
                }, 
                'updatedAt': {
                  '$first': '$updatedAt'
                }, 
                '__v': {
                  '$first': '$__v'
                }
              }
            }, {
              '$lookup': {
                'from': 'survey-attempts', 
                'localField': 'surveyId', 
                'foreignField': 'surveyId', 
                'as': 'attempts'
              }
            }, {
              '$addFields': {
                'attendance': {
                  '$map': {
                    'input': '$attendance', 
                    'as': 'att', 
                    'in': {
                      '$mergeObjects': [
                        '$$att', {
                          'externalName': {
                            '$reduce': {
                              'input': '$attempts', 
                              'initialValue': '', 
                              'in': {
                                '$cond': [
                                  {
                                    '$eq': [
                                      '$$this.email', '$$att.email'
                                    ]
                                  }, '$$this.externalName', '$$value'
                                ]
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
              '$unset': 'attempts'
            }
        ];
        let res = await this.surveyAttendanceModal.aggregate(pipe);
        return res.length > 0 ? res[0] : null
    }
}