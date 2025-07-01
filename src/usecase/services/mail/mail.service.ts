import { Inject, Injectable } from "@nestjs/common";
import { MailLog } from "src/domain/mail-logs/dto/mail-log.dto";
import { MailLogRepository } from "src/domain/mail-logs/interfaces/mail-log-repository.interface";
import { QrCodeService } from "src/usecase/helpers/qr-code-helper";
import axios from "axios"; // Use axios
import { Notification } from "src/domain/notification/dto/notification.dto";
import { UserAuthService } from "../user-auth/user-auth.service";
import { User } from "src/domain/user-auth/dto/user-type..dto";
import { NotificationType } from "src/domain/notification/enums/notification-type.enum";
import { Assessment } from "src/domain/assessment/dto/assessment.dto";
import { UpdateTrainingProgram } from "src/domain/training/dto/training.dto";
import { InjectModel } from "@nestjs/mongoose";
import e from "express";
import { Model } from "mongoose";
import { AuthRepository } from "src/domain/user-auth/interfaces/auth-repository.interface";
import { Course } from "src/domain/course/dto/course.dto";


/**
 * @export
 * @class MailService
 */
@Injectable()
export class MailService {
    constructor(
        @Inject('MailLogRepository') private mailLogRepository: MailLogRepository,
        private qrCodeService: QrCodeService,
        @Inject('AuthRepository') private userRepository: AuthRepository,
    ) { }


    sendQRMail(surveyId: string, email: string, isExternal: boolean, byUrl: boolean, subject?: string) {
        //let data = process.env.CURRENT_DOMAIN + "/user-survey-result/" + surveyId + "/" + email;
        let data = process.env.CURRENT_DOMAIN + '/sa/survey/attempt/' + surveyId;

        let surveyUrl = process.env.CURRENT_DOMAIN + '/sa/survey/attempt/' + surveyId;
        let m_subject: string = subject ? subject : "رمز الاستجابة السريعة";

        if (isExternal) {
            surveyUrl += "?external=1&email=" + email;
            data += "?external=1&email=" + email;
        }
        let url = this.qrCodeService.generateAndSaveQRCode(data);

        this.sendMail({
            email: email,
            subject: m_subject,
            template: 'qrcode',
            context: {
                email: email,
                text: url,
                heading: "!شكراً لك",
                surveyUrl: byUrl ? '' : surveyUrl
            }
        })
    }

    sendUserAssessmentCertificateMail(email: string, assessmentId: string) {
        let link = process.env.CURRENT_DOMAIN + '/sa/assessment/certificate/' + assessmentId + '/' + email;
        this.sendMail({
            subject: "شهادة إتمام",
            template: 'certificate',
            context: {
                text: "لقد استلمت شهادة الإتمام، يمكنك الآن الضغط على زر \"عرض الشهادة\" لعرض الشهادة :",
                heading: "!تهانينا",
                url: link
            },
            email: email
        });
    }

    sendUserAssessmentMail(link: string, email: string, text: boolean) {
        let data = link;
        let url = this.qrCodeService.generateAndSaveQRCode(data);
        this.sendMail({
            email: email,
            subject: "لقد استلمت اختباراً - بوابة المعرفة",
            template: 'adduserassessment',
            context: {
                email: email,
                text: url,
                heading: text,
                surveyUrl: link
            }
        })
    }

    sendAssessmentMail(assessment: any, email: string, isExternal: boolean) {
        let assessmentUrl = process.env.CURRENT_DOMAIN + '/sa/assessment/attempt/' + assessment._id;
        if (isExternal) {
            assessmentUrl += "?external=1&email=" + email;
        }
        this.sendMail({
            email: email,
            subject: "لقد استلمت اختباراً - بوابة المعرفة",
            template: 'assessment',
            context: {
                email: email,
                heading: assessment.name,
                url: assessmentUrl,
                startDate: assessment.startDate,
                endDate: assessment.endDate
            }
        })
    }

    async sendNotificationMail(notification: any) {

        if (!!notification.receiver && notification.receiver.length > 0) {

            let context: any = { subject: notification.title, title: notification.title, message: notification.type }
            let template = 'main-mail';
            if (notification.type == NotificationType.MASTER_TRAINER_ADDED || notification.type == NotificationType.TRAINER_ADDED || notification.type == NotificationType.BRANCH_TRAINING_PUBLISH || notification.type == NotificationType.CONTINUOUS_TRAINING_PUBLISH) {
                context = { ...context, trainingDate: notification.trainingDate }
                template = 'master-trainer';
            }

            notification.receiver.forEach((e: any) => {
                this.sendMail({
                    email: e.email,
                    subject: context.subject,
                    template: template,
                    context: context
                })
            })
        }


    }

    async sendProgramMail(data: UpdateTrainingProgram) {
        if (!!data.courses && data.courses.length > 0) {
            let context: any = { courses: data.courses.map(e => e.trainingId), subject: 'تفاصيل البرامج التدريبية', programTitle: data.title, programDescription: data.description }

            let attendees = data.courses.map(e => e.trainingId.attendees).flat(Infinity)
            let emails = await this.userRepository.getEmailByIds(attendees);

            emails.forEach(e => {
                this.sendMail({
                    email: e.email,
                    subject: context.subject,
                    template: 'program-create',
                    context: context
                })
            })

        }
    }

    async sendCourseMail(data: Course) {
        let context: any = { courses: [data], subject: 'تفاصيل الدورات التدريبية', programTitle: data.title, programDescription: data.description }

        let attendees = data.attendees.map(e => e.toString());
        let emails = await this.userRepository.getEmailByIds(attendees);

        emails.forEach(e => {
            this.sendMail({
                email: e.email,
                subject: context.subject,
                template: 'program-create',
                context: context
            })
        })
    }



    /**
     *
     *
     * @param {string} email
     * @param {ISendMailOptions['context']} context
     * @param {string} subject
     * @param {string} template
     * @return {*}  {Promise<SentMessageInfo>}
     * @memberof MailService
     */
    sendMail({ email, context, subject, template }: any): void {
        try {
            // let body = {
            //     email,
            //     context,
            //     subject,
            //     template
            // };

            // axios.post(process.env.MAIL_SERVER_URL, body, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //     }
            // })
            //     .then(response => {
            //         // console.log("Mail sent to " + email);
            //         let mailLog: MailLog = {
            //             status: 'SUCCESS',
            //             meta: { context, details: response.data }
            //         };
            //         this.mailLogRepository.create(mailLog);
            //     })
            //     .catch(error => {
            //         // console.log(error);
            //         let mailLog: MailLog = {
            //             status: 'ERROR',
            //             meta: { context, details: error }
            //         };
            //         this.mailLogRepository.create(mailLog);
            //     });

        } catch (e) {
            let mailLog: MailLog = {
                status: 'ERROR',
                error: e,
                meta: {
                    email, context, subject, template
                }
            }
            // console.log(e);
            this.mailLogRepository.create(mailLog);
        }
    }
}