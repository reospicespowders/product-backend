import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, UpdateWriteOpResult } from 'mongoose';
import { PermissionRequest, UpdatePermissionRequestDto, CreatePermissionRequestDto } from '../dto/permission-request.dto';
import { PermissionRequestRepository } from '../interfaces/permission-request-repository.interface';
import * as moment from 'moment';
import 'moment-timezone';

/**
 * @export
 * @class PermissionRequestRepositoryImpl
 * @implements {PermissionRequestRepository}
 */
@Injectable()
export class PermissionRequestRepositoryImpl implements PermissionRequestRepository {
    constructor(
        @InjectModel('permission-requests') private permissionRequestModel: Model<PermissionRequest>
    ) {}

    /**
     * Create a new permission request
     * @param {CreatePermissionRequestDto} permissionRequest
     * @return {*}  {Promise<PermissionRequest>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async create(permissionRequest: CreatePermissionRequestDto): Promise<PermissionRequest> {
        const created = new this.permissionRequestModel({
            ...permissionRequest,
            createdAt: moment().tz("Asia/Riyadh").format(),
            updatedAt: moment().tz("Asia/Riyadh").format(),
            status: 'PENDING'
        });
        return created.save();
    }

    /**
     * Find all permission requests with pagination
     * @param {any} query
     * @param {number} skip
     * @param {number} limit
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async findAll(query: any): Promise<any> {
        let page = query.page;
        let offset = query.offset
        let skip = 0;

        if(query.ou){
            query['generalData.ou'] = { $in: query.ou.map(i=> new mongoose.Types.ObjectId(i)) };
            delete query.ou;
        }

        // Handle email query with OR logic for contactOfficer.email and questionMaker.email
        if(query.email) {
            const emailValue = query.email;
            delete query.email;
            query.$or = [
                { 'contactOfficer.email': emailValue },
                { 'questionMaker.email': emailValue }
            ];
        }
        
        if (page && offset) {
            skip = (page - 1) * offset;
        }

        delete query.page;
        delete query.offset;

        return this.permissionRequestModel.aggregate(
        [
            {
              $match: query
            },
            {
              $lookup: {
                from: 'organization-units',
                localField: 'generalData.ou',
                foreignField: '_id',
                as: 'generalData.ou'
              }
            },
            {
              $addFields: {
                surveys: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$status', 'APPROVED'] },
                        { $eq: ['$generalData.requestFor.value', 'SURVEY'] }
                      ]
                    },
                    { $ifNull: ['$testEntries.surveyId', []] },
                    []
                  ]
                },
                assessments: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$status', 'APPROVED'] },
                        { $eq: ['$generalData.requestFor.value', 'ASSESSMENT'] }
                      ]
                    },
                    { $ifNull: ['$testEntries.assessmentId', []] },
                    []
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'assessments',
                localField: 'assessments',
                foreignField: '_id',
                as: 'assessments'
              }
            },
            {
              $lookup: {
                from: 'surveys',
                localField: 'surveys',
                foreignField: '_id',
                as: 'surveys'
              }
            },
            {
                $sort: {
                  createdAt: -1  // Sort by creation date in descending order
                }
              },
            {
              $facet: {
                metadata: [
                  { $count: 'totalCount' }
                ],
                data: [
                  { $skip: skip },   
                  { $limit: offset } 
                ]
              }
            }
          


          ])
    }

    /**
     * Count total permission requests matching query
     * @param {any} query
     * @return {*}  {Promise<number>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async count(query: any): Promise<number> {
        return this.permissionRequestModel.countDocuments(query).exec();
    }

    /**
     * Find permission request by ID
     * @param {string} id
     * @return {*}  {Promise<PermissionRequest>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async findById(id: string): Promise<PermissionRequest> {
        return this.permissionRequestModel.findById(id).exec();
    }

    /**
     * Update permission request
     * @param {UpdatePermissionRequestDto} permissionRequest
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async update(permissionRequest: UpdatePermissionRequestDto): Promise<UpdateWriteOpResult> {
        const { _id, ...updateData } = permissionRequest;
        const objectId = new mongoose.Types.ObjectId(_id);
        return this.permissionRequestModel.updateOne(
            { _id: objectId },
            {
                $set: {
                    ...updateData,
                    updatedAt: moment().tz("Asia/Riyadh").format()
                }
            }
        ).exec();
    }

    /**
     * Delete permission request
     * @param {string} id
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async delete(id: string): Promise<any> {
        return this.permissionRequestModel.deleteOne({_id: id});
    }

    /**
     * Find permission requests by user ID
     * @param {string} userId
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async findByUserId(userId: string): Promise<PermissionRequest[]> {
        return this.permissionRequestModel
            .find({ created_by: userId, deletedAt: null })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find permission requests by organizational unit
     * @param {string} ouId
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async findByOU(ouId: string): Promise<PermissionRequest[]> {
        return this.permissionRequestModel
            .find({ 'generalData.ou': ouId, deletedAt: null })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find permission requests by status
     * @param {string} status
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async findByStatus(status: string): Promise<PermissionRequest[]> {
        return this.permissionRequestModel
            .find({ status, deletedAt: null })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find permission requests by date range
     * @param {Date} startDate
     * @param {Date} endDate
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async findByDateRange(startDate: Date, endDate: Date): Promise<PermissionRequest[]> {
        return this.permissionRequestModel
            .find({
                createdAt: {
                    $gte: moment(startDate).tz("Asia/Riyadh").startOf('day').format(),
                    $lte: moment(endDate).tz("Asia/Riyadh").endOf('day').format()
                },
                deletedAt: null
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find permission requests by multiple OUs
     * @param {mongoose.Types.ObjectId[]} ouIds
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async findByMultipleOUs(ouIds: mongoose.Types.ObjectId[]): Promise<PermissionRequest[]> {
        return this.permissionRequestModel
            .find({
                'generalData.ou': { $in: ouIds },
                deletedAt: null
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Update multiple permission requests
     * @param {string[]} ids
     * @param {any} data
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async updateMany(ids: string[], data: any): Promise<UpdateWriteOpResult> {
        return this.permissionRequestModel.updateMany(
            { _id: { $in: ids } },
            {
                ...data,
                updatedAt: moment().tz("Asia/Riyadh").format()
            }
        ).exec();
    }

    /**
     * Find permission requests by request type
     * @param {string} requestType
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async findByRequestType(requestType: string): Promise<PermissionRequest[]> {
        return this.permissionRequestModel
            .find({
                'generalData.requestFor.value': requestType,
                deletedAt: null
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find permission requests by agency/management
     * @param {string} agencyOrManagement
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepositoryImpl
     */
    async findByAgencyOrManagement(agencyOrManagement: string): Promise<PermissionRequest[]> {
        return this.permissionRequestModel
            .find({
                'generalData.agencyOrManagement': agencyOrManagement,
                deletedAt: null
            })
            .sort({ createdAt: -1 })
            .exec();
    }


     /**
     * Find permission requests by agency/management
     * @param {string} agencyOrManagement
     * @return {*}  {Promise<PermissionRequest[]>}
     * @memberof PermissionRequestRepositoryImpl
     */
     async checkIsTester(email: string): Promise<Boolean>{
        try {
            const count = await this.permissionRequestModel.countDocuments({ 'questionMaker.email': email }).exec();
            return count > 0;
          } catch (error) {
            throw new Error(`Failed to check email existence: ${error.message}`);
          }
    }


}
