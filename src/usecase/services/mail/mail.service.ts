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
import { Resend } from 'resend';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';


/**
 * @export
 * @class MailService
 */
@Injectable()
export class MailService {
    private resend: Resend;
    private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor(
        @Inject('MailLogRepository') private mailLogRepository: MailLogRepository,
        private qrCodeService: QrCodeService,
        @Inject('AuthRepository') private userRepository: AuthRepository,
    ) { 
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }


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
    // sendMail({ email, context, subject, template }: any): void {
    //     try {
    //         let body = {
    //             email,
    //             context,
    //             subject,
    //             template
    //         };

    //         axios.post(process.env.MAIL_SERVER_URL, body, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             }
    //         })
    //             .then(response => {
    //                 // console.log("Mail sent to " + email);
    //                 let mailLog: MailLog = {
    //                     status: 'SUCCESS',
    //                     meta: { context, details: response.data }
    //                 };
    //                 this.mailLogRepository.create(mailLog);
    //             })
    //             .catch(error => {
    //                 // console.log(error);
    //                 let mailLog: MailLog = {
    //                     status: 'ERROR',
    //                     meta: { context, details: error }
    //                 };
    //                 this.mailLogRepository.create(mailLog);
    //             });

    //     } catch (e) {
    //         let mailLog: MailLog = {
    //             status: 'ERROR',
    //             error: e,
    //             meta: {
    //                 email, context, subject, template
    //             }
    //         }
    //         // console.log(e);
    //         this.mailLogRepository.create(mailLog);
    //     }
    // }

    /**
     * Send email using Resend.com with Handlebars templates
     * 
     * @param {string} email - Recipient email address
     * @param {any} context - Email template context data
     * @param {string} subject - Email subject
     * @param {string} template - Template name (will load from templets folder)
     * @return {Promise<void>}
     * @memberof MailService
     */
    async sendMail({ email, context, subject, template }: any): Promise<void> {
        try {
            // Generate HTML from Handlebars template
            const htmlContent = await this.generateEmailHTML(template, context);
            
            // Get from email with fallback
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
            
            // Send email using Resend
            const { data, error } = await this.resend.emails.send({
                from: fromEmail,
                to: [email],
                subject: subject,
                html: htmlContent,
            });

            if (error) {
                console.error('Resend error:', error);
                
                // Handle specific domain verification error
                if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403 && error.message && error.message.includes('domain is not verified')) {
                    console.error('Domain verification error. Please verify your domain in Resend dashboard or use onboarding@resend.dev for testing.');
                }
                
                let mailLog: MailLog = {
                    status: 'ERROR',
                    meta: { context, details: error }
                };
                this.mailLogRepository.create(mailLog);
            } else {
                console.log('Email sent successfully to:', email);
                let mailLog: MailLog = {
                    status: 'SUCCESS',
                    meta: { context, details: data }
                };
                this.mailLogRepository.create(mailLog);
            }

        } catch (e) {
            console.error('Mail service error:', e);
            let mailLog: MailLog = {
                status: 'ERROR',
                error: e,
                meta: {
                    email, context, subject, template
                }
            }
            this.mailLogRepository.create(mailLog);
        }
    }

    /**
     * Generate HTML content from Handlebars template
     * 
     * @param {string} templateName - Template name (without .hbs extension)
     * @param {any} context - Template context data
     * @return {Promise<string>} HTML content
     * @private
     * @memberof MailService
     */
    private async generateEmailHTML(templateName: string, context: any): Promise<string> {
        try {
            // Check if template is cached
            if (!this.templateCache.has(templateName)) {
                // Load template from file
                const templatePath = path.join(process.cwd(), 'templets', `${templateName}.hbs`);
                
                if (!fs.existsSync(templatePath)) {
                    throw new Error(`Template not found: ${templateName}.hbs`);
                }
                
                const templateContent = fs.readFileSync(templatePath, 'utf8');
                const compiledTemplate = Handlebars.compile(templateContent);
                
                // Cache the compiled template
                this.templateCache.set(templateName, compiledTemplate);
            }
            
            // Get cached template and render with context
            const template = this.templateCache.get(templateName);
            if (!template) {
                throw new Error(`Template not found in cache: ${templateName}`);
            }
            
            return template(context);
            
        } catch (error) {
            console.error(`Error generating email HTML for template ${templateName}:`, error);
            
            // Fallback to a simple HTML template if template loading fails
            return `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .header { text-align: center; margin-bottom: 30px; }
                        .content { margin-bottom: 30px; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Email Template Error</h1>
                        </div>
                        <div class="content">
                            <p>Template "${templateName}" could not be loaded.</p>
                            <p>Context: ${JSON.stringify(context)}</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        }
    }
}