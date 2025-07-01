import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSVendorCompanyDto, UpdateMSVendorCompanyDto } from 'src/domain/mystory-shopper/dto/ms-vendor-company.dto';
import { MSVendorCompanyRepository } from 'src/domain/mystory-shopper/interfaces/ms-vendor-company-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { UpdateWriteOpResult } from 'mongoose';
import { AuthRepository } from 'src/domain/user-auth/interfaces/auth-repository.interface';



/**
 *MSVendorCompany Service
 *
 * @export
 * @class MSVendorCompanyTopicService
 */
@Injectable()
export class MSVendorCompanyService {

    /**
     * Creates an instance of MSVendorCompanyService.
     * @param {MSVendorCompanyRepository} MSVendorCompanyRepository
     * @memberof MSVendorCompanyService
     */
    constructor(
        @Inject('MSVendorCompanyRepository') private msVendorCompanyRepository: MSVendorCompanyRepository,
        @Inject('AuthRepository') private userRepository: AuthRepository,
    ) { }
    
    async create(msVendorCompanyTopicDto: MSVendorCompanyDto): Promise<GenericResponse<MSVendorCompanyDto>> {
        // Create the new company if no duplicate exists
        const createdMSVendorCompany = await this.msVendorCompanyRepository.create(msVendorCompanyTopicDto);
        return {
            success: true,
            message: 'MSVendorCompany created successfully.',
            data: createdMSVendorCompany,
        };
    }

    async checkVendor(data: any): Promise<GenericResponse<any>> {
        const companyExists = await this.msVendorCompanyRepository.findByName(data.companyName);
        if (companyExists) {
            return {
                success: false,
                message: 'Company with the same name already exists',
                data: null,
            };
        }

        const userExists1 = await this.userRepository.findOne({ email: data.email1 }, ['email', '_id', 'vendorCompanyId']);
        if (userExists1 && userExists1.vendorCompanyId) {
            return {
                success: false,
                message: 'PmEmail already exists with a vendor',
                data: null,
            };
        }

        const userExists2 = await this.userRepository.findOne({ email: data.email2 }, ['email', '_id', 'vendorCompanyId']);
        if (userExists2 && userExists2.vendorCompanyId) {
            return {
                success: false,
                message: 'AltPmEmail already exists with a vendor',
                data: null,
            };
        }

        return {
            success: true,
            message: 'MSVendorCompany created successfully.',
            data: null,
        };
    }
    

    async get(id: string): Promise<GenericResponse<MSVendorCompanyDto>> {
        const msVendorCompanyTopic = await this.msVendorCompanyRepository.findById(id);
        if (!msVendorCompanyTopic) {
            throw new NotFoundException('Ms Vendor Company not found');
        }
        return {
            success: true,
            message: 'Ms Vendor Company retrieved successfully.', 
            data: msVendorCompanyTopic 
        };
    }

    async getAll(): Promise<GenericResponse<MSVendorCompanyDto[]>> {
        const msVendorCompanyTopics = await this.msVendorCompanyRepository.findAll();
        return { 
            success: true,
            message: 'Ms Vendor Company retrieved successfully.', 
            data: msVendorCompanyTopics 
        };
    }

    async update(msVendorCompanyTopicDto: UpdateMSVendorCompanyDto): Promise<GenericResponse<UpdateMSVendorCompanyDto>> {
        let id = msVendorCompanyTopicDto._id;
        const updatedQuestionBank:UpdateWriteOpResult = await this.msVendorCompanyRepository.update(id, msVendorCompanyTopicDto);
        if (updatedQuestionBank.modifiedCount != 1) {
            return { 
                success: true,
                message: 'Failed to update question bank', 
                data: null 
            };
        }
        return { 
            success: true,
            message: 'Ms Vendor Company updated successfully.', 
            data: null 
        };;
    }

    async delete(id: string): Promise<GenericResponse<any>> {
        const msVendorCompanyTopic = await this.msVendorCompanyRepository.findById(id);
        if (!msVendorCompanyTopic) {
            throw new NotFoundException('MSVendorCompany not found');
        }

        await Promise.all(msVendorCompanyTopic.vendors.map(async (user: any) => {

            const userData = await this.userRepository.findOne({ _id: user }, ['isInternalVendor', '_id'])
            let data: any = {};
            if (userData.isInternalVendor)
            {
                data = {
                    _id: user,
                    isVendor: false,
                    vendorCompanyId: null,
                    isInternalVendor: false
                };
            }
            else{
                data = {
                    _id: user,
                    isVendor: true,
                    vendorCompanyId: null,
                    deletedAt: new Date(),
                    isInternalVendor: false,
                    active: {
                        status: false,
                        reason: 'NEW ACCOUNT',
                        activationDate: null,
                    },
                };
            }
            await this.userRepository.update(data);
        }));
        const deletedMSVendorCompany = await this.msVendorCompanyRepository.delete(id);
        if (!deletedMSVendorCompany) {
            throw new NotFoundException('MSVendorCompany not found');
        }

        return { 
            success: true,
            message: 'MSVendorCompany deleted successfully.',
            data: ''
         };
    }
}
