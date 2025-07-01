import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { PermissionRequest, UpdatePermissionRequestDto, CreatePermissionRequestDto } from 'src/domain/user-auth/dto/permission-request.dto';
import { PermissionRequestRepository } from 'src/domain/user-auth/interfaces/permission-request-repository.interface';
import { NotificationService } from '../notification/notification.service';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';
import * as moment from 'moment';
import 'moment-timezone';
import { SurveyRepository } from 'src/domain/survey/interfaces/survey-repository.interface';
import { AssessmentRepository } from 'src/domain/assessment/interfaces/assessment-repository.interface';
import { Survey } from 'src/domain/survey/dto/survey.dto';
import { Assessment } from 'src/domain/assessment/dto/assessment.dto';
import { PermissionRepository } from 'src/domain/permission/interfaces/permission.repository.interface';

/**
 * @export
 * @class PermissionRequestService
 */
@Injectable()
export class PermissionRequestService {
    constructor(
        @Inject('PermissionRequestRepository') private permissionRequestRepository: PermissionRequestRepository,
        @Inject('SurveyRepository') private surveyRepository: SurveyRepository,
        @Inject('AssessmentRepository') private assessmentRepository: AssessmentRepository,
        @Inject('PermissionRepository') private permissionRepository: PermissionRepository,
        private notificationService: NotificationService
    ) {}

    /**
     * Create a new permission request
     * @param {CreatePermissionRequestDto} data
     * @return {*}  {Promise<GenericResponse<PermissionRequest>>}
     * @memberof PermissionRequestService
     */
    async create(data: CreatePermissionRequestDto): Promise<GenericResponse<PermissionRequest>> {
        try {

             console.log("String(data.created_by) ===> ")
            const created = await this.permissionRequestRepository.create(data);

            console.log("String(data.created_by) ===> ")
            //get approvers
            let approvers =  await this.permissionRepository.getPermissionUser('PERMISSION_REQUESTS_APPROVE','allow')
            
            // Extract _id values from approvers array and convert to strings
            const receiverIds = approvers.map(approver => String(approver._id));

            // Create notification for the request
            const notification: Notification = {
                type: NotificationType.PERMISSION_REQUEST_CREATED,
                receiver: receiverIds, // Use approver IDs as receivers
                sender: String(data.created_by),
                seenBy: [],
                category: NotificationCategory.PERMISSION_REQUESTS,
                data: {
                    requestId: data.created_by,
                    requestType: data.generalData.requestFor.value
                }
            };
            
            await this.notificationService.create(notification);





            
            return {
                success: true,
                message: "Permission request created successfully",
                data: created
            };
        } catch (error) {
            throw new HttpException(
                error.message || "Failed to create permission request",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get all permission requests with pagination
     * @param {any} query
     * @param {number} page
     * @param {number} offset
     * @return {*}  {Promise<GenericResponse<PermissionRequest[]>>}
     * @memberof PermissionRequestService
     */
    async getAll(query: any): Promise<GenericResponse<PermissionRequest[] >> {
        try {
            
            const [data, total] = await Promise.all([
                this.permissionRequestRepository.findAll(query),
                this.permissionRequestRepository.count(query)
            ]);

            return {
                success: true,
                message: "Permission requests fetched successfully",
                data,
                
            };
        } catch (error) {
            throw new HttpException(
                error.message || "Failed to fetch permission requests",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get permission request by ID
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<PermissionRequest>>}
     * @memberof PermissionRequestService
     */
    async getOne(id: string): Promise<GenericResponse<PermissionRequest>> {
        try {
            const data = await this.permissionRequestRepository.findById(id);
            if (!data) {
                throw new NotFoundException('Permission request not found');
            }

            return {
                success: true,
                message: "Permission request fetched successfully",
                data
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException(
                error.message || "Failed to fetch permission request",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update permission request
     * @param {UpdatePermissionRequestDto} data
     * @return {*}  {Promise<GenericResponse<PermissionRequest>>}
     * @memberof PermissionRequestService
     */
    async update(data: UpdatePermissionRequestDto): Promise<GenericResponse<PermissionRequest | any>> {
        try {
            const existing = await this.permissionRequestRepository.findById(data._id);
            if (!existing) {
                throw new NotFoundException('Permission request not found');
            }

            const updated = await this.permissionRequestRepository.update(data);

            // Create notification based on status change
            // if (data.status && data.status !== existing.status) {
            //     const notification: Notification = {
            //         type: data.status === 'APPROVED' ? 
            //             NotificationType.PERMISSION_REQUEST_APPROVED : 
            //             NotificationType.PERMISSION_REQUEST_REJECTED,
            //         receiver: [existing.created_by],
            //         sender: data.updated_by,
            //         seenBy: [],
            //         category: NotificationCategory.PERMISSION_EVENTS,
            //         meta: {
            //             requestId: data._id,
            //             requestType: existing.generalData.requestFor.value,
            //             status: data.status,
            //             reason: data.reason
            //         }
            //     };
                // await this.notificationService.create(notification);
            // }

            return {
                success: true,
                message: "Permission request updated successfully",
                data: updated
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException(
                error.message || "Failed to update permission request",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Delete permission request
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof PermissionRequestService
     */
    async delete(id: string): Promise<GenericResponse<null>> {
        try {
            const existing = await this.permissionRequestRepository.findById(id);
            if (!existing) {
                throw new NotFoundException('Permission request not found');
            }

            await this.permissionRequestRepository.delete(id);

            // // Create notification for deletion
            // const notification: Notification = {
            //     type: NotificationType.PERMISSION_REQUEST_DELETED,
            //     receiver: [existing.created_by],
            //     sender: existing.updated_by,
            //     seenBy: [],
            //     category: NotificationCategory.PERMISSION_EVENTS,
            //     meta: {
            //         requestId: id,
            //         requestType: existing.generalData.requestFor.value
            //     }
            // };
            // await this.notificationService.create(notification);

            return {
                success: true,
                message: "Permission request deleted successfully",
                data: null
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException(
                error.message || "Failed to delete permission request",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get permission requests by user ID
     * @param {string} userId
     * @return {*}  {Promise<GenericResponse<PermissionRequest[]>>}
     * @memberof PermissionRequestService
     */
    async getByUserId(userId: string): Promise<GenericResponse<PermissionRequest[]>> {
        try {
            const data = await this.permissionRequestRepository.findByUserId(userId);
            return {
                success: true,
                message: "User permission requests fetched successfully",
                data
            };
        } catch (error) {
            throw new HttpException(
                error.message || "Failed to fetch user permission requests",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get permission requests by organizational unit
     * @param {string} ouId
     * @return {*}  {Promise<GenericResponse<PermissionRequest[]>>}
     * @memberof PermissionRequestService
     */
    async getByOU(ouId: string): Promise<GenericResponse<PermissionRequest[]>> {
        try {
            const data = await this.permissionRequestRepository.findByOU(ouId);
            return {
                success: true,
                message: "OU permission requests fetched successfully",
                data
            };
        } catch (error) {
            throw new HttpException(
                error.message || "Failed to fetch OU permission requests",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Approve permission request
     * @param {string} id Permission request ID
     * @param {any} req Request object containing user info
     * @return {*}  {Promise<GenericResponse<PermissionRequest>>}
     * @memberof PermissionRequestService
     */
    async approve(data: any, req: any): Promise<GenericResponse<PermissionRequest>> {
        try {
            // First get the existing permission request
            let existing :any = await this.permissionRequestRepository.findById(data._id);
            if (!existing) {
                throw new NotFoundException('Permission request does not exist');
            }

            // Process based on request type
            if (existing.generalData.requestFor.value === 'SURVEY') {
                // Create surveys for each test entry
                for (const entry of existing.testEntries) {
                  
                    const startDateTime = moment(`${entry.testDate} ${entry.startTime}`).format('DD-MM-YYYY HH:mm:ss');
                    const endDateTime = moment(`${entry.testDate} ${entry.endTime}`).format('DD-MM-YYYY HH:mm:ss');

                    const surveyData : Survey | any = {
                        name: entry.testName,
                        active: true,
                        startDate: startDateTime,
                        endDate: endDateTime,
                        comments: "<p>Permission Request Survey</p>",
                        type: "6838bd5093197086870562ae", // Survey type ID
                        accessType: "BY_ACCOUNT",
                        copyType: "ONLY_QUESTIONS",
                        testType: "SURVEY"
                    };

                    console.log("Survey Data =>", surveyData);
                    const createdSurvey : any = await this.surveyRepository.create(surveyData, req.user.uid);

                    console.log("created Survey :", createdSurvey)
                    if (createdSurvey && createdSurvey._id) {
                        entry.surveyId = createdSurvey._id;
                    }
                }
            }
            
            else if (existing.generalData.requestFor.value === 'ASSESSMENT') {
                // Create assessments for each test entry
                for (const entry of existing.testEntries) {
                   
                    const startDateTime = moment(`${entry.testDate} ${entry.startTime}`).format('DD-MM-YYYY HH:mm');
                    const endDateTime = moment(`${entry.testDate} ${entry.endTime}`).format('DD-MM-YYYY HH:mm');

                    const assessmentData: Assessment | any = {
                        name: entry.testName,
                        active: true,
                        startDate: startDateTime,
                        endDate: endDateTime,
                        comments: "<p>Permission Request Assessment</p>",
                        cloneQuestionBankId: "",
                        accessType: "BY_ACCOUNT",
                        copyType: "ONLY_QUESTIONS",
                        allowedAttempts: "",
                        testType: "ASSESSMENT",
                        attemptTime : String(entry?.attemptTime),
                        questionBankId: "683c3e6ea785b2b30b07071c",
                        status: "ACTIVE",
                        questionBank: [] // Empty array for now
                    };

                    console.log("Assessment Data =>", assessmentData);
                    const createdAssessment: any = await this.assessmentRepository.create(assessmentData, req.user.uid);
                    if (createdAssessment && createdAssessment._id) {
                        entry.assessmentId = createdAssessment._id;
                    }
                }
            }

            console.log("test Data ==> 1" );

            // Update the permission request with new status and updated test entries
            existing.status = 'APPROVED';
            existing.updated_by = req.user.uid;
            existing.agreement = data.agreement;
            existing.comments = data.comments;
            // const updateData: UpdatePermissionRequestDto = {
            //     ...existing,
            //     _id: id,
            //     status: 'APPROVED',
            //     updated_by: req.user.uid,
            //     testEntries: existing.testEntries
            // };

            
            // Update the permission request
            await this.permissionRequestRepository.update(existing);

            // // Get the updated request
            // const updated = await this.permissionRequestRepository.findById(id);



            // Create notification for approval
            const notification: Notification = {
                type: NotificationType.PERMISSION_REQUEST_APPROVED,
                receiver: [String(existing.created_by)],
                sender: String(req.user.uid),
                seenBy: [],
                category: NotificationCategory.PERMISSION_REQUESTS,
                data: {
                    requestId: existing.created_by,
                    requestType: existing.generalData.requestFor.value
                }
            };


            await this.notificationService.create(notification);


            return {
                success: true,
                message: "Permission request approved successfully",
                data: existing
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException(
                error.message || "Failed to approve permission request",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

   async checkIsTester(email:string):Promise<Boolean>{
        try {
            return this.permissionRequestRepository.checkIsTester(email);
        } catch (error) {
            console.log(error)
        }
    }
}
