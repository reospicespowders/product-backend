import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, SchedulerRegistry, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Survey } from 'src/domain/survey/dto/survey.dto';
import { Assessment } from 'src/domain/assessment/dto/assessment.dto';
import { TrainingRequestRepository } from 'src/domain/training/interfaces/training-request-repository.interface';
import { Reminder } from 'src/domain/reminder/dto/reminder.dto';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';
import { NotificationService } from '../../notification/notification.service';
import { MailService } from '../../mail/mail.service';
import { ContentUpdateReportsService } from 'src/usecase/services/data/content-update-report.service';


@Injectable()
export class CronService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject('TrainingRequestRepository') private TrainingRequestRepository: TrainingRequestRepository,
    @InjectModel('survey') private readonly surveyModel: Model<Survey>,
    @InjectModel('assessment') private readonly assessmentModel: Model<Assessment>,
    @InjectModel('reminder') private readonly reminderModel: Model<Reminder>,
    private notificaitonService: NotificationService,
    private mailService: MailService,
    private readonly contentUpdateReportsRepository: ContentUpdateReportsService
  ) { }


  // @Cron(CronExpression.EVERY_5_SECONDS)
  // async testCrown(): Promise<void> {
  //     console.log("---> Test crown started")
  // }

  @Cron(CronExpression.EVERY_WEEKEND)
  async rejectWeekly() {
    try {
      // console.log('Reject Weekly Tasks Cron Started...');
      const requests: any = await this.TrainingRequestRepository.rejectWeekly();
      // console.log("Crown end : ",requests);
    } catch (error) {
      // console.log(error)
    }
  }




  /**
   *
   * Auto Generate Training Requests
   * @memberof CronService
   */
  @Cron(CronExpression.EVERY_WEEKEND)
  async autoGenerateWeeklyTrainingRequest() {
    try {
      // console.log('Weekly Tasks Cron Started...');
      // Get the current date
      // const currentDate = new Date();
      // // Calculate the number of days from today to the last Sunday (0 for Sunday, 1 for Monday, and so on)
      // const daysUntilLastSunday = (currentDate.getDay() + 7 - 0) % 7;
      // // Calculate the date for the last Sunday by subtracting the days
      // const lastSunday = new Date(currentDate);
      // lastSunday.setDate(currentDate.getDate() - daysUntilLastSunday);

      // const query: any = {
      //     'type.name': 'WEEKLY',
      //     createdAt: {
      //         $gte: lastSunday, // Greater than or equal to one week ago
      //         $lt: new Date() // Less than the current date
      //     }
      // };

      // const requests: any = await this.TrainingRequestRepository.getAllForCrown(query);

      // for (let i = 0; i < requests.length; i++) {
      //     let data: TrainingRequest | any = {
      //         topic: requests[i].topic,
      //         type: requests[i].type._id,
      //         ou: requests[i].ou,
      //         description: requests[i].description,
      //         status: "PENDING",
      //         active: requests[i].active
      //     }

      //     if (requests[i].status == 'PENDING' || requests[i].status == 'APPROVED') {
      //         // send mail please specify reason of not creating training and mark it rejected
      //     }

      //     let create = await this.TrainingRequestRepository.create(data)

      //     // send Notification

      // }

      const requests: any = await this.TrainingRequestRepository.generateWeelyTraining();

    } catch (error) {
      throw new Error(error)
    }


  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markCompletedTrainings(): Promise<void> {
    const requests: any = await this.TrainingRequestRepository.getCompletedTrainingsOfPublishedStatus();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendReminderMail(): Promise<void> {
    console.log('CRON CALLED')
    let pipe = [
      {
        $addFields: {
          matchterm: {
            $dateDiff: {
              startDate: "$$NOW",
              endDate: "$date",
              unit: "day"
            }
          }
        }
      },
      {
        $match: {
          matchterm: 0
        }
      },
      {
        $facet: {
          typeA: [
            {
              $match: {
                type: "SURVEY"
              }
            },
            {
              $lookup: {
                from: "surveys",
                localField: "surveyId",
                foreignField: "_id",
                as: "data",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "attendees",
                      foreignField: "_id",
                      as: "attendees",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            name: 1,
                            email: 1
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ],
          typeB: [
            {
              $match: {
                type: "ASSESSMENT"
              }
            },
            {
              $lookup: {
                from: "assessments",
                localField: "assessmentId",
                foreignField: "_id",
                as: "data",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "attendees",
                      foreignField: "_id",
                      as: "attendees",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            name: 1,
                            email: 1
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ],
          typeC: [
            {
              $match: {
                type: "TRAINING"
              }
            },
            {
              $lookup: {
                from: "course",
                localField: "trainingId",
                foreignField: "_id",
                as: "data",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "attendees",
                      foreignField: "_id",
                      as: "attendees",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            name: 1,
                            email: 1
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
      },
      {
        $project: {
          data: {
            $concatArrays: [
              "$typeA",
              "$typeB",
              "$typeC"
            ]
          }
        }
      },
      {
        $unwind: {
          path: "$data"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$data"
        }
      },
      {
        $unwind: {
          path: "$data"
        }
      }
    ];

    let res = await this.reminderModel.aggregate(pipe);
    console.log('CRON PIPE RES', res);
    for (let data of res) {
      if (!!data.data.attendees && data.data.attendees.length > 0) {
        const notification: Notification = {
          receiver: data.data.attendees.map(e => e._id),
          seenBy: [],
          sender: data.type === "SURVEY" || data.type === "ASSESSMENT" ? data.data.createdBy : data.sender,
          type: data.type === "SURVEY" ? NotificationType.SURVEY : data.type === "ASSESSMENT" ? NotificationType.ASSESSMENT : NotificationType.TRAINER_ADDED,
          category: NotificationCategory.USER_EVENTS,
          data: { ...data.data }
        }
        console.log('CRON NOTIFICATION', notification);
        await this.notificaitonService.create(notification, false);

        if (data.type === "SURVEY") {
          let survey = data.data;
          for (let user of data.data.attendees) {
            if (survey.name) {
              this.mailService.sendQRMail(survey._id, user.email, false, false, survey.name);
            } else {
              this.mailService.sendQRMail(survey._id, user.email, false, false);
            }
          } 
          for (let email of survey.externals) {
            if (survey.name) {
              this.mailService.sendQRMail(survey._id, email, true, false, survey.name);
            } else {
              this.mailService.sendQRMail(survey._id, email, true, false);
            }
          }
        } else if (data.type === "ASSESSMENT") {
          for (let user of data.data.attendees) {
            this.mailService.sendAssessmentMail(data.data, user.email, false);
          }
          for (let email of data.data.externals) {
            this.mailService.sendAssessmentMail(data.data, email, true);
          }
        } else {
          this.mailService.sendCourseMail(data.data);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async makeSurveyActiveInactive(): Promise<void> {
    let pipe = [
      {
        '$match': {
          'startDate': {
            '$exists': true
          }
        }
      }, {
        '$addFields': {
          'startDateISO': {
            '$concat': [
              {
                '$substrCP': [
                  '$startDate', 6, 4
                ]
              }, '-', {
                '$substrCP': [
                  '$startDate', 3, 2
                ]
              }, '-', {
                '$substrCP': [
                  '$startDate', 0, 2
                ]
              }, 'T00:00:00Z'
            ]
          },
          'endDateISO': {
            '$concat': [
              {
                '$substrCP': [
                  '$endDate', 6, 4
                ]
              }, '-', {
                '$substrCP': [
                  '$endDate', 3, 2
                ]
              }, '-', {
                '$substrCP': [
                  '$endDate', 0, 2
                ]
              }, 'T00:00:00Z'
            ]
          }
        }
      }, {
        '$addFields': {
          'startDateISO': {
            '$dateFromString': {
              'dateString': '$startDateISO'
            }
          },
          'endDateISO': {
            '$dateFromString': {
              'dateString': '$endDateISO'
            }
          }
        }
      }, {
        '$addFields': {
          'currentDate': new Date()
        }
      }, {
        '$set': {
          'status': {
            '$cond': [
              {
                '$and': [
                  {
                    '$lte': [
                      '$startDateISO', '$currentDate'
                    ]
                  }, {
                    '$gte': [
                      '$endDateISO', '$currentDate'
                    ]
                  }
                ]
              }, 'Active', {
                '$cond': [
                  {
                    '$lt': [
                      '$endDateISO', '$currentDate'
                    ]
                  }, 'Closed', 'Pending'
                ]
              }
            ]
          }
        }
      }, {
        '$project': {
          'startDateISO': 0,
          'endDateISO': 0,
          'currentDate': 0
        }
      }, {
        '$out': 'surveys'
      }
    ];

  }
  @Cron(CronExpression.EVERY_HOUR)
  async regenerateContentUpdateReports() {
    console.log("Regenerate Content Update Reports Cron Started...");
    let reports = await this.contentUpdateReportsRepository.recreateReport();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async makeAssessmentActiveInactive(): Promise<void> {
    let pipe = [
      {
        '$addFields': {
          'startDateISO': {
            '$dateFromString': {
              'dateString': {
                '$concat': [
                  {
                    '$substrCP': [
                      '$startDate', 6, 4
                    ]
                  }, '-', {
                    '$substrCP': [
                      '$startDate', 3, 2
                    ]
                  }, '-', {
                    '$substrCP': [
                      '$startDate', 0, 2
                    ]
                  }, 'T00:00:00Z'
                ]
              }
            }
          },
          'endDateISO': {
            '$dateFromString': {
              'dateString': {
                '$concat': [
                  {
                    '$substrCP': [
                      '$endDate', 6, 4
                    ]
                  }, '-', {
                    '$substrCP': [
                      '$endDate', 3, 2
                    ]
                  }, '-', {
                    '$substrCP': [
                      '$endDate', 0, 2
                    ]
                  }, 'T00:00:00Z'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'currentDate': new Date()
        }
      }, {
        '$set': {
          'status': {
            '$cond': [
              {
                '$and': [
                  {
                    '$lte': [
                      '$startDateISO', '$currentDate'
                    ]
                  }, {
                    '$gte': [
                      '$endDateISO', '$currentDate'
                    ]
                  }
                ]
              }, 'Active', {
                '$cond': [
                  {
                    '$lt': [
                      '$endDateISO', '$currentDate'
                    ]
                  }, 'Closed', 'Pending'
                ]
              }
            ]
          }
        }
      }, {
        '$project': {
          'startDateISO': 0,
          'endDateISO': 0,
          'currentDate': 0
        }
      }, {
        '$out': 'assessments'
      }
    ];

    await this.assessmentModel.aggregate(pipe);
  }

}
