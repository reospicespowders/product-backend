import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { SurveyAttempt } from 'src/domain/survey/dto/survey-attempt.dto';
import { Survey, UpdateSurveyDto } from 'src/domain/survey/dto/survey.dto';
import { SurveyAttemptRepository } from 'src/domain/survey/interfaces/survey-attempt-repository.interface';
import { SurveyResultRepository } from 'src/domain/survey/interfaces/survey-result-repository.interface';
import { SurveyRepository } from 'src/domain/survey/interfaces/survey-repository.interface';
import { NotificationService } from '../notification/notification.service';
import { SurveyAttendanceService } from './survey-attendance.service';
import { Attendance } from 'src/domain/survey/dto/survey-attendance.dto';
import { UserAuthService } from '../user-auth/user-auth.service';
import { MailService } from '../mail/mail.service';
import { SurveyType } from 'src/domain/survey/dto/survey-type.dto';
import { SurveyTypeRepository } from 'src/domain/survey/interfaces/survey-type-repository.interface';
import * as fs from 'fs';
import * as path from 'path';

/**
 *Survey Service for logics related to survey
 *
 * @export
 * @class SurveyService
 */
@Injectable()
export class SurveyService {


    /**
     * Creates an instance of SurveyService.
     * @param {SurveyRepository} surveyRepository
     * @memberof SurveyService
     */
    constructor(@Inject('SurveyRepository') private surveyRepository: SurveyRepository,
        @Inject('SurveyAttemptRepository') private surveyAttemptRepository: SurveyAttemptRepository,
        @Inject('SurveyResultRepository') private surveyResultRepository: SurveyResultRepository,
        @Inject('SurveyTypeRepository') private surveyTypeRepository: SurveyTypeRepository,
        private notificaitonService: NotificationService,
        private surveyAttendanceService: SurveyAttendanceService,
        private userService: UserAuthService,
        private mailService: MailService
    ) { }


    async getAllTagsFiltered(tags: string[], trainingTypeId:string): Promise<GenericResponse<Survey[]>> {
        let res = await this.surveyRepository.getAllTagsFiltered(tags,trainingTypeId);
        return {
            success: true,
            message: "Survey fetched successfully",
            data: res
        }
    }

    /**
     *Create a new survey
     *
     * @param {Survey} survey
     * @return {*}  {Promise<GenericResponse<Survey>>}
     * @memberof SurveyService
     */
    public async create(survey: Survey,uid:string): Promise<GenericResponse<Survey>> {
        let res: any = await this.surveyRepository.create(survey,uid);

        if (res)
        {
            const dirPath = path.join(__dirname, '../../../../public/survey/'+  res._id +'.html')
            const content = `
            <html lang="en">
            <head>
            <!-- Primary Meta Tags -->
            <title> Knowledge Gate | `+ res.name +`</title>
            <meta name="title" content=" Knowledge Gate | `+ res.name +`">
            <meta name="description" content="`+ res.comments +`">

            <!-- Open Graph / Facebook -->
            <meta property="og:type" content="website">
            <meta property="og:url" content="https://kgate.bc.gov.sa/json/public/survey/`+ res._id +`.html">
            <meta property="og:title" content=" Knowledge Gate | `+ res.name +`">
            <meta property="og:description" content="`+ res.comments +`">
            <meta property="og:image" itemprop="image" content="https://kgate.bc.gov.sa/json`+ res.headerImage +`">
            <meta property="og:image:secure_url" itemprop="image" content="https://kgate.bc.gov.sa/json`+ res.headerImage +`">
            <meta property="og:image:alt" content="https://kgate.bc.gov.sa/json`+ res.headerImage +`">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta property="og:type" content="website" />

            <!-- Twitter -->
            <meta property="twitter:card" content="summary_large_image">
            <meta property="twitter:url" content="https://kgate.bc.gov.sa/json/public/survey/`+ res._id +`.html">
            <meta property="twitter:title" content=" Knowledge Gate | `+ res.name +`">
            <meta property="twitter:description" content="`+ res.comments +`">
            <meta property="twitter:image" content="https://kgate.bc.gov.sa/json`+ res.headerImage +`">
            </head>
            <body>

            <center>
            <h1>Knowledge Gate | `+ res.name +`</h1>
            <img src="https://kgate.bc.gov.sa/json`+ res.headerImage +`">
            </center>

            <p> </p>
            <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
            <script>
                // Simulate an HTTP redirect:
                window.location.replace("https://kgate.bc.gov.sa/sa/survey/attempt/`+ res._id +`");

            </script>
            </body>
            </html>
            ` ;

            fs.writeFile(dirPath, content, function(err) {
            if(err) {
                return // console.log(err);
            }
            // console.log("The file was saved!", "https://kgate.bc.gov.sa/json/public/survey/" + res._id +".html");
            });
        }


        let type = await this.surveyTypeRepository.getById(survey.type);
        if (type.requiredAttendance) {
            this.surveyAttendanceService.create({ surveyId: res._id, attendance: [] })
        }
        return {
            message: "Survey created successfully",
            success: true,
            data: res
        }
    }

    public async findById(id: string): Promise<GenericResponse<Survey>> {
        let res = await this.surveyRepository.findById(id);
        if (res) {
            return {
                message: "Survey fetched successfully",
                success: true,
                data: res
            }
        }
        return {
            message: "Failed to fetch survey",
            success: false,
            data: null
        }
    }


    /**
     *Update an existing survey
     *
     * @param {UpdateSurveyDto} survey
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof SurveyService
     */
    public async update(survey: UpdateSurveyDto, uid: string): Promise<GenericResponse<null>> {
        let previous = await this.surveyRepository.findById(survey._id);
        let type: SurveyType = await this.surveyTypeRepository.getById(survey.type);
        let previousUsers = previous?.attendees;
        let newUsers = survey?.attendees;
        let distinct = newUsers?.filter(newUser => !previousUsers.includes(newUser));


        if (survey.notify) {
            let _id = survey._id;
            if (distinct?.length > 0) {
                const notification: Notification = {
                    receiver: distinct,
                    seenBy: [],
                    sender: uid,
                    type: NotificationType.SURVEY,
                    category: NotificationCategory.USER_EVENTS,
                    data: { _id, ...survey }
                }
                await this.notificaitonService.create(notification);
            }
        }


        if (type?.requiredAttendance) {

            let previousEmails = previous?.externals;
            let newEmails;
            if (survey.externals) {
                newEmails = survey.externals.map((external: any) => {
                    if (external) {
                        external = external.toLocaleLowerCase();
                    }
                    return external;
                });
                survey.externals = newEmails;
            }
            
            newEmails = survey?.externals;
            
            let distinctEmails = newEmails?.filter(newEmail => !previousEmails.includes(newEmail));

            //Adding entries for attendance for externals
            if (distinctEmails?.length > 0) {
                let attendences = distinctEmails.map(email => {
                    if(survey.name) {
                        this.mailService.sendQRMail(survey._id, email, true, false, survey.name);
                    } else {
                        this.mailService.sendQRMail(survey._id, email, true, false);
                    }
                    
                    let attendance: Attendance = {
                        email: email,
                    }
                    return attendance;
                });
                this.surveyAttendanceService.createBlankEntries(attendences, survey._id);
            }

            //Adding entries for attendance for attendees
            let users = await this.userService.getByUserIds(distinct);
            let attendences = users.map(user => {
                if(survey.name) {
                    this.mailService.sendQRMail(survey._id, user.email, true, false, survey.name);
                } else {
                    this.mailService.sendQRMail(survey._id, user.email, true, false);
                }
                let attendance: Attendance = {
                    email: user.email,
                }
                return attendance;
            });
            await this.surveyAttendanceService.createBlankEntries(attendences, survey._id);
        }

        let res = await this.surveyRepository.update(survey);

        if (res.modifiedCount == 0) {
            return {
                message: "failed to update survey",
                success: false,
                data: null
            }
        }

        if (res)
            {
                let updatedSurvey:any = await this.surveyRepository.findById(survey._id);
                const dirPath = path.join(__dirname, '../../../../public/survey/'+  updatedSurvey._id +'.html')
                const content = `
                <html lang="en">
                <head>
                <!-- Primary Meta Tags -->
                <title> Knowledge Gate | `+ updatedSurvey.name +`</title>
                <meta name="title" content=" Knowledge Gate | `+ updatedSurvey.name +`">
                <meta name="description" content="`+ updatedSurvey.comments +`">
    
                <!-- Open Graph / Facebook -->
                <meta property="og:type" content="website">
                <meta property="og:url" content="https://kgate.bc.gov.sa/json/public/survey/`+ updatedSurvey._id +`.html">
                <meta property="og:title" content=" Knowledge Gate | `+ updatedSurvey.name +`">
                <meta property="og:description" content="`+ updatedSurvey.comments +`">
                <meta property="og:image" itemprop="image" content="https://kgate.bc.gov.sa/json`+ updatedSurvey.headerImage +`">
                <meta property="og:image:secure_url" itemprop="image" content="https://kgate.bc.gov.sa/json`+ updatedSurvey.headerImage +`">
                <meta property="og:image:alt" content="https://kgate.bc.gov.sa/json`+ updatedSurvey.headerImage +`">
                <meta property="og:image:width" content="1200">
                <meta property="og:image:height" content="630">
                <meta property="og:type" content="website" />
    
                <!-- Twitter -->
                <meta property="twitter:card" content="summary_large_image">
                <meta property="twitter:url" content="https://kgate.bc.gov.sa/json/public/survey/`+ updatedSurvey._id +`.html">
                <meta property="twitter:title" content=" Knowledge Gate | `+ updatedSurvey.name +`">
                <meta property="twitter:description" content="`+ updatedSurvey.comments +`">
                <meta property="twitter:image" content="https://kgate.bc.gov.sa/json`+ updatedSurvey.headerImage +`">
                </head>
                <body>
    
                <center>
                <h1>Knowledge Gate | `+ updatedSurvey.name +`</h1>
                <img src="https://kgate.bc.gov.sa/json`+ updatedSurvey.headerImage +`">
                </center>
    
                <p> </p>
                <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
                <script>
                    // Simulate an HTTP redirect:
                    window.location.replace("https://kgate.bc.gov.sa/sa/survey/attempt/`+ updatedSurvey._id +`");
    
                </script>
                </body>
                </html>
                ` ;
    
                fs.writeFile(dirPath, content, function(err) {
                if(err) {
                    return // console.log(err);
                }
                // console.log("The file was saved!", "https://kgate.bc.gov.sa/json/public/survey/" + updatedSurvey._id +".html");
                });
            }

        return {
            message: "Survey updated successfully",
            success: true,
            data: null
        }
    }

    /**
     *Delete an existing survey
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof SurveyService
     */
    public async delete(_id: string): Promise<GenericResponse<null>> {
        let res = await this.surveyRepository.delete(_id);
        if (res.deletedCount == 0) {
            return {
                message: "failed to delete survey",
                success: false,
                data: null
            }
        }
        return {
            message: "Survey deleted successfully",
            success: true,
            data: null
        }
    }

    public async bulkDelete(ids: string[]): Promise<GenericResponse<null>> {
        let res = await this.surveyRepository.bulkDelete(ids);
        if (res.deletedCount == 0) {
            return {
                message: "failed to delete survey",
                success: false,
                data: null
            }
        }
        return {
            message: "Surveys deleted successfully",
            success: true,
            data: null
        }
    }

    /**
     *Get all surveys
     *
     * @return {*}  {Promise<GenericResponse<Survey[]>>}
     * @memberof SurveyService
     */
    public async getAll(): Promise<GenericResponse<Survey[]>> {
        let res = await this.surveyRepository.getAll();
        return {
            message: "Surveys fetched successfully",
            success: true,
            data: res
        }
    }

    public async submitSurvey(survey: UpdateSurveyDto): Promise<GenericResponse<null>> {

        let surveyId = survey._id;
        survey.email = survey.email.toLocaleLowerCase()
        let res = await this.surveyRepository.incrementAttempt(surveyId);
        if (res.modifiedCount == 0) {
            return {
                message: "failed to submit survey",
                success: false,
                data: null
            }
        }

        const isRedo = await this.surveyAttemptRepository.checkIfAttempted(survey.email, surveyId, true);
        const hasAttempted = await this.surveyAttemptRepository.checkIfRated(survey.email,surveyId, survey.ratingForID);

        if (hasAttempted && !survey.attemptFor && isRedo == false) {
            await this.surveyAttemptRepository.deleteByEmail(surveyId, survey.email,survey.ratingForID);
            await this.surveyResultRepository.deleteByEmail(surveyId, survey.email,survey.ratingForID);
        }

        const attempts: any = await this.surveyAttemptRepository.getMultipleById(surveyId, survey.email);

        const currentDate = new Date();

        let surveyAttempt: SurveyAttempt = {
            surveyId: surveyId,
            questions: survey.questions,
            email: survey.email,
            courseId: survey.courseId,
            ratingFor: survey.ratingFor,
            externalName: survey.externalName,
            ratingForID: survey.ratingForID,
            externalFields: survey.externalFields || {},
            externalGender: survey.externalGender,
            externalQuestions: survey.externalQuestions,
            attemptStartDate: survey.attemptStartDate,
            attemptEndDate: currentDate.toISOString(),
            isRedoAllow: false,
            attempt: attempts.length + 1
        };

        if(survey.attemptFor) surveyAttempt.attemptFor = survey.attemptFor;

        let type: SurveyType = await this.surveyTypeRepository.getById(survey.type);
        if (survey.accessType == 'BY_URL' && type.requiredAttendance) {
            //Creating unmarked attendance
            let attendance: Attendance = {
                email: survey.email,
            }
            this.surveyAttendanceService.createBlankEntries([attendance], surveyId);

            //Sending email with qr code
            if(survey.name) {
                this.mailService.sendQRMail(surveyId, survey.email, true, false, survey.name);
            } else {
                this.mailService.sendQRMail(surveyId, survey.email, true, false);
            }
        }

        let saved = await this.surveyAttemptRepository.save(surveyAttempt);

        await this.surveyAttemptRepository.allowRedoByEmailAndAssessmentId(surveyId, survey.email, false);

        if (saved) {
            return {
                message: "Survey Submitted successfully",
                success: true,
                data: null
            }
        }

        return {
            message: "failed to submit survey",
            success: false,
            data: null
        }
    }

    async getAllUnattempted(uid: string, email: string): Promise<GenericResponse<Survey[]>> {
        let res = await this.surveyRepository.getUnAttempted(uid, email);
        return {
            message: "Surveys fetched successfully",
            success: true,
            data: res
        }
    }

    async getAllAttempted(uid: string, email: string): Promise<GenericResponse<Survey[]>> {
        let res = await this.surveyRepository.getAllAttempted(uid, email);
        return {
            message: "Surveys fetched successfully",
            success: true,
            data: res
        }
    }
}
