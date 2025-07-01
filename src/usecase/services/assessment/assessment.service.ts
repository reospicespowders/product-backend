import { Inject, Injectable } from '@nestjs/common';
import { Assessment, UpdateAssessmentDto } from 'src/domain/assessment/dto/assessment.dto';
import { AssessmentRepository } from 'src/domain/assessment/interfaces/assessment-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationService } from '../notification/notification.service';
import { AssessmentAttempt } from 'src/domain/assessment/dto/assessment-attempt.dto';
import { AssessmentAttemptRepository } from 'src/domain/assessment/interfaces/assessment-attempt-repository.interface';
import { AssessmentResultRepository } from 'src/domain/assessment/interfaces/assessment-result-repository.interface';
import { UpdateAssessmentResultDto } from 'src/domain/assessment/dto/assessment-result.dto';
import { UserAuthService } from '../user-auth/user-auth.service';
import { MailService } from '../mail/mail.service';
import { SessionRepository } from 'src/domain/course/interfaces/session-repository.interface';
import { ASSESSMENT_DEFAULT_GRADING, ASSESSMENT_DEFAULT_MINISTRY_CERT_TEXT } from 'src/data/resources';
import { ImageService } from 'src/usecase/services/sharp-image/sharp-image-service';
import * as fs from 'fs';
import * as path from 'path';

/**
 *Assessment Service
 *
 * @export
 * @class AssessmentService
 */
@Injectable()
export class AssessmentService {

    /**
     * Creates an instance of AssessmentService.
     * @param {AssessmentRepository} assessmentRepository
     * @memberof AssessmentService
     */
    constructor(
        @Inject('AssessmentRepository') private assessmentRepository: AssessmentRepository,
        @Inject('AssessmentAttemptRepository') private assessmentAttemptRepository: AssessmentAttemptRepository,
        @Inject('AssessmentResultRepository') private assessmentResultRepository: AssessmentResultRepository,
        @Inject('SessionRepository') private SessionRepository: SessionRepository,
        private notificationService: NotificationService,
        private userService: UserAuthService,
        private mailService: MailService,
        private readonly imageService: ImageService

    ) { }


    /**
     *Get an assessment by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<Assessment>>}
     * @memberof AssessmentService
     */
    async findById(id: string): Promise<GenericResponse<Assessment>> {
        let res = await this.assessmentRepository.findById(id);
        if (res) {
            return {
                message: "Assessment fetched successfully",
                success: true,
                data: res
            }
        }
        return {
            message: "Failed to fetch assessment",
            success: false,
            data: null
        }
    }

    async submitAssessment(updateSurveyDto: UpdateAssessmentDto): Promise<GenericResponse<null>> {
        let surveyId = updateSurveyDto._id;
        let courseId = updateSurveyDto.courseId;
        updateSurveyDto.email = updateSurveyDto.email.toLocaleLowerCase()
        let email = updateSurveyDto.email;
        let res = await this.assessmentRepository.incrementAttempt(surveyId);
        if (res.modifiedCount == 0) {
            return {
                message: "failed to submit assessment",
                success: false,
                data: null
            }
        }
        const attempts: any = await this.assessmentAttemptRepository.getMultipleById(surveyId, email);

        const currentDate = new Date();

        let surveyAttempt: AssessmentAttempt = {
            assessmentId: surveyId,
            questions: updateSurveyDto.questions,
            email: updateSurveyDto.email,
            externalName: updateSurveyDto.externalName,
            isRedoAllow: false,
            attempt: attempts.length + 1,
            externalFields: updateSurveyDto.externalFields || {},
            timeTaken: updateSurveyDto.timeTaken || 0,
            externalGender:updateSurveyDto.externalGender,
            externalQuestions: updateSurveyDto.externalQuestions,
            attemptStartDate: updateSurveyDto.attemptStartDate,
            attemptEndDate: currentDate.toISOString(),
        };

        let saved = await this.assessmentAttemptRepository.save(surveyAttempt);
        await this.assessmentAttemptRepository.allowRedoByEmailAndAssessmentId(surveyId, email, false);
        if (saved) {

            return {
                message: "Assessment Submitted successfully",
                success: true,
                data: null
            }
        }

        return {
            message: "failed to submit assessment",
            success: false,
            data: null
        }
    }

    async getAllUnattempted(uid: any, email: string): Promise<GenericResponse<Assessment[]>> {
        let res = await this.assessmentRepository.getUnAttempted(uid, email)
        return {
            message: "Assessments fetched successfully",
            success: true,
            data: res
        }
    }

    async getAllAttempted(uid: any, email: string): Promise<GenericResponse<Assessment[]>> {
        let res = await this.assessmentRepository.getAllAttempted(uid, email)
        return {
            message: "Assessments fetched successfully",
            success: true,
            data: res
        }
    }

    async getCertificateData(postData:any): Promise<GenericResponse<Assessment[]>> {
        let res = await this.assessmentRepository.getCertificateData(postData)

        let correctMinistry;
        let inCorrectMinistry;

        if (res) {
            const updatedRes = await Promise.all(
              res.map(async (item: any) => {
                if (item.set) {
                  const updatedItems = await this.imageService.convertSvgToPngAndReplaceIcons(item.set);
                  item.set = item.set.map((originalItem: any) => {
                    const updatedItem = updatedItems.find((updatedItem: any) => updatedItem._id === originalItem._id);
                    return updatedItem ? updatedItem : originalItem;
                  });
                }
                return item;
              })
            );
        }

        return {
            message: "Assessments Certificate Details fetched successfully",
            success: true,
            data: res
        }
    }

    /**
     *Bulk Delete assessments
     *
     * @param {string[]} ids
     * @return {*}  {Promise<any>}
     * @memberof AssessmentService
     */
    async bulkDelete(ids: string[]): Promise<any> {
        let res = await this.assessmentRepository.bulkDelete(ids);
        if (res.deletedCount == 0) {
            return {
                message: "failed to delete assessments",
                success: false,
                data: null
            }
        }
        return {
            message: "Assessments deleted successfully",
            success: true,
            data: null
        }
    }


    /**
     *Get all unattempted assessments
     *
     * @param {string} uid
     * @return {*}  {Promise<GenericResponse<Assessment[]>>}
     * @memberof AssessmentService
     */
    async getUnAttempted(uid: string, email: string): Promise<GenericResponse<Assessment[]>> {
        let res = await this.assessmentRepository.getUnAttempted(uid, email);
        return {
            message: "Assessments fetched successfully",
            success: true,
            data: res
        }
    }

    /**
     *Create a new assessment
     *
     * @param {Assessment} assessment
     * @return {*}  {Promise<GenericResponse<Assessment>>}
     * @memberof AssessmentService
     */
    public async create(assessment: Assessment,uid:string): Promise<GenericResponse<Assessment>> {
        assessment.percentageCriteria = [...ASSESSMENT_DEFAULT_GRADING]
        assessment.certificateMinistry = ASSESSMENT_DEFAULT_MINISTRY_CERT_TEXT;
        let res:any = await this.assessmentRepository.create(assessment,uid);

        if (res)
            {
                const dirPath = path.join(__dirname, '../../../../public/assessment/'+  res._id +'.html')
                const content = `
                <html lang="en">
                <head>
                <!-- Primary Meta Tags -->
                <title> Knowledge Gate | `+ res.name +`</title>
                <meta name="title" content=" Knowledge Gate | `+ res.name +`">
                <meta name="description" content="`+ res.comments +`">
    
                <!-- Open Graph / Facebook -->
                <meta property="og:type" content="website">
                <meta property="og:url" content="https://kgate.bc.gov.sa/json/public/assessment/`+ res._id +`.html">
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
                <meta property="twitter:url" content="https://kgate.bc.gov.sa/json/public/assessment/`+ res._id +`.html">
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
                    window.location.replace("https://kgate.bc.gov.sa/sa/assessment/attempt/`+ res._id +`");
    
                </script>
                </body>
                </html>
                ` ; 
    
                fs.writeFile(dirPath, content, function(err) {
                if(err) {
                    return // console.log(err);
                }
                // console.log("The file was saved!", "https://kgate.bc.gov.sa/json/public/assessment/" + res._id +".html");
                });
            }

        return {
            message: "Assessment Created successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get all assessments paginated
     *
     * @param {number} page
     * @param {number} size
     * @return {*}  {Promise<GenericResponse<Assessment[]>>}
     * @memberof AssessmentService
     */
    public async getAll(page: number, size: number, tags: string[], trainingTypeId: string): Promise<GenericResponse<any>> {
        let res = await this.assessmentRepository.getAll(page, size, tags, trainingTypeId);
        return {
            message: "Assessments fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Update an existing assessment
     *
     * @param {UpdateAssessmentDto} assessment
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof AssessmentService
     */
    public async update(assessment: UpdateAssessmentDto, uid: string): Promise<GenericResponse<null>> {

        let previous = await this.assessmentRepository.findById(assessment._id);
        let previousUsers = previous?.attendees;
        let newUsers = assessment?.attendees;
        let distinct = newUsers?.filter(newUser => !previousUsers.includes(newUser));


        if (assessment.notify) {
            let _id = assessment._id;
            if (distinct?.length > 0) {
                const notification: Notification = {
                    receiver: distinct,
                    seenBy: [],
                    sender: uid,
                    type: NotificationType.ASSESSMENT,
                    category: NotificationCategory.ASSESSMENT,
                    data: { _id, ...assessment }
                }
                await this.notificationService.create(notification);
            }
        }


        let previousEmails = previous?.externals;
        let newEmails;
        if (assessment.externals) {
            newEmails = assessment.externals.map((external: any) => {
                if (external) {
                    external = external.toLocaleLowerCase();
                }
                return external;
            });
            assessment.externals = newEmails;
        }
        // console.log("NewEmails:", newEmails); // Check if newEmails is properly set
        let distinctEmails = newEmails?.filter(newEmail => !previousEmails.includes(newEmail));
        //Adding entries for attendance for externals
        if (distinctEmails?.length > 0) {
            distinctEmails.forEach(email => {
                this.mailService.sendAssessmentMail(assessment, email, true);
            });
        }

        //Adding entries for attendance for attendees
        let users = await this.userService.getByUserIds(distinct);
        users.forEach(user => {
           this.mailService.sendAssessmentMail(assessment, user.email, false);
        });

        let res = await this.assessmentRepository.update(assessment);
        if (res.modifiedCount > 0) {
            return {
                message: "Assessment updated successfully",
                success: true,
                data: null,
            }
        }
        if (res)
            {
                let updatedAssessment:any = await this.assessmentRepository.findById(assessment._id);
                const dirPath = path.join(__dirname, '../../../../public/assessment/'+  updatedAssessment._id +'.html')
                const content = `
                <html lang="en">
                <head>
                <!-- Primary Meta Tags -->
                <title> Knowledge Gate | `+ updatedAssessment.name +`</title>
                <meta name="title" content=" Knowledge Gate | `+ updatedAssessment.name +`">
                <meta name="description" content="`+ updatedAssessment.comments +`">
    
                <!-- Open Graph / Facebook -->
                <meta property="og:type" content="website">
                <meta property="og:url" content="https://kgate.bc.gov.sa/json/public/assessment/`+ updatedAssessment._id +`.html">
                <meta property="og:title" content=" Knowledge Gate | `+ updatedAssessment.name +`">
                <meta property="og:description" content="`+ updatedAssessment.comments +`">
                <meta property="og:image" itemprop="image" content="https://kgate.bc.gov.sa/json`+ updatedAssessment.headerImage +`">
                <meta property="og:image:secure_url" itemprop="image" content="https://kgate.bc.gov.sa/json`+ updatedAssessment.headerImage +`">
                <meta property="og:image:alt" content="https://kgate.bc.gov.sa/json`+ updatedAssessment.headerImage +`">
                <meta property="og:image:width" content="1200">
                <meta property="og:image:height" content="630">
                <meta property="og:type" content="website" />
    
                <!-- Twitter -->
                <meta property="twitter:card" content="summary_large_image">
                <meta property="twitter:url" content="https://kgate.bc.gov.sa/json/public/assessment/`+ updatedAssessment._id +`.html">
                <meta property="twitter:title" content=" Knowledge Gate | `+ updatedAssessment.name +`">
                <meta property="twitter:description" content="`+ updatedAssessment.comments +`">
                <meta property="twitter:image" content="https://kgate.bc.gov.sa/json`+ updatedAssessment.headerImage +`">
                </head>
                <body>
    
                <center>
                <h1>Knowledge Gate | `+ updatedAssessment.name +`</h1>
                <img src="https://kgate.bc.gov.sa/json`+ updatedAssessment.headerImage +`">
                </center>
    
                <p> </p>
                <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
                <script>
                    // Simulate an HTTP redirect:
                    window.location.replace("https://kgate.bc.gov.sa/sa/assessment/attempt/`+ updatedAssessment._id +`");
    
                </script>
                </body>
                </html>
                ` ;
    
                fs.writeFile(dirPath, content, function(err) {
                if(err) {
                    return // console.log(err);
                }
                // console.log("The file was saved!", "https://kgate.bc.gov.sa/json/public/assessment/" + updatedAssessment._id +".html");
                });
            }
        return {
            message: "Failed to updated assessment",
            success: true,
            data: null,
        }
    }

    /**
     *Delete an existing assessment
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof AssessmentService
     */
    public async delete(_id: string): Promise<GenericResponse<null>> {
        let res = await this.assessmentRepository.delete(_id);
        if (res.deletedCount > 0) {
            return {
                message: "Assessment deleted successfully",
                success: true,
                data: null,
            }
        }
        return {
            message: "Failed to delete assessment",
            success: true,
            data: null,
        }
    }

    /**
     *Get assessments results paginated
     *
     * @param {number} page
     * @param {number} size
     * @return {*}  {Promise<GenericResponse<Assessment[]>>}
     * @memberof AssessmentService
     */
    public async getAssessmentResults(id: string, page: number, size: number): Promise<GenericResponse<any>> {
        let res = await this.assessmentRepository.getAssessmentResults(id, page, size);
        return {
            message: "Assessments fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     * 
     * @param {string} ids 
     * @param {string} email 
     * @return {*} {Promise<GenericResponse<any>>}
     * @memberof AssessmentService
     */
    async CheckUserResult(ids: string[], email: string): Promise<GenericResponse<any>> {
        const finalRes = await Promise.all(ids.map(async assessmentId => {
            let status = "Pass";
            let attempts = true;
            let totalAttempts = 0;

            // Fetch assessment result and assessment concurrently
            const [result, assessment] = await Promise.all([
                this.assessmentResultRepository.findIdByEmail(assessmentId, email),
                this.assessmentRepository.findById(assessmentId)
            ]);
            if (!!result && !!assessment) {
                const sortedPercentageCriteria = assessment?.percentageCriteria?.sort((a, b) => a.to - b.to);
                const FailPercentage = sortedPercentageCriteria[0]?.to;
                const UserPercentage = (result?.score / result?.totalmarks) * 100;

                if (UserPercentage <= FailPercentage) {
                    status = "Fail";
                }

                if (assessment.allowedAttempts <= result.attempt) {
                    attempts = false;
                }

                if (!!result) {
                    totalAttempts = result.attempt
                }

                return { assessmentId, status, attempts, totalAttempts };
            } else {
                return { assessmentId, totalAttempts: 0, attempts, status:"Not Attempted Yet" }
            }
        }));

        return {
            message: "Assessments results fetched successfully",
            success: true,
            data: finalRes
        }
    }
}
