import mongoose, { ObjectId, UpdateWriteOpResult } from "mongoose";
import { PermissionRequest, UpdatePermissionRequestDto, CreatePermissionRequestDto } from "../dto/permission-request.dto";

/**
 * @export
 * @interface PermissionRequestRepository
 */
export interface PermissionRequestRepository {
    /**
     * Create a new permission request
     * @param {CreatePermissionRequestDto} permissionRequest
     * @return {*}  {Promise<PermissionRequest>}
     * @memberof PermissionRequestRepository
     */
    create(permissionRequest: CreatePermissionRequestDto): Promise<PermissionRequest>;

    /**
     * Find all permission requests with pagination
     * @param {any} query
     * @param {number} skip
     * @param {number} limit
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepository
     */
    findAll(query: any): Promise<any>;

    /**
     * Count total permission requests matching query
     * @param {any} query
     * @return {*}  {Promise<number>}
     * @memberof PermissionRequestRepository
     */
    count(query: any): Promise<number>;

    /**
     * Find permission request by ID
     * @param {string} id
     * @return {*}  {Promise<PermissionRequest>}
     * @memberof PermissionRequestRepository
     */
    findById(id: string): Promise<PermissionRequest>;

    /**
     * Update permission request
     * @param {UpdatePermissionRequestDto} permissionRequest
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof PermissionRequestRepository
     */
    update(permissionRequest: UpdatePermissionRequestDto): Promise<UpdateWriteOpResult>;

    /**
     * Delete permission request
     * @param {string} id
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof PermissionRequestRepository
     */
    delete(id: string): Promise<UpdateWriteOpResult>;

    /**
     * Find permission requests by user ID
     * @param {string} userId
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepository
     */
    findByUserId(userId: string): Promise<PermissionRequest[]>;

    /**
     * Find permission requests by organizational unit
     * @param {string} ouId
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepository
     */
    findByOU(ouId: string): Promise<PermissionRequest[]>;

    /**
     * Find permission requests by status
     * @param {string} status
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepository
     */
    findByStatus(status: string): Promise<PermissionRequest[]>;

    /**
     * Find permission requests by date range
     * @param {Date} startDate
     * @param {Date} endDate
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepository
     */
    findByDateRange(startDate: Date, endDate: Date): Promise<PermissionRequest[]>;

    /**
     * Find permission requests by multiple OUs
     * @param {mongoose.Types.ObjectId[]} ouIds
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepository
     */
    findByMultipleOUs(ouIds: mongoose.Types.ObjectId[]): Promise<PermissionRequest[]>;

    /**
     * Update multiple permission requests
     * @param {string[]} ids
     * @param {any} data
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof PermissionRequestRepository
     */
    updateMany(ids: string[], data: any): Promise<UpdateWriteOpResult>;

    /**
     * Find permission requests by request type
     * @param {string} requestType
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepository
     */
    findByRequestType(requestType: string): Promise<PermissionRequest[]>;

    /**
     * Find permission requests by agency/management
     * @param {string} agencyOrManagement
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepository
     */
    findByAgencyOrManagement(agencyOrManagement: string): Promise<PermissionRequest[]>;

    checkIsTester(email: string): Promise<Boolean>
} 