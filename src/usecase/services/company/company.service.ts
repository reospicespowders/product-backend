import { Inject, Injectable } from '@nestjs/common';
import { Company, UpdateCompany } from 'src/domain/company/dto/company.dto';
import { CompanyRepository } from 'src/domain/company/interfaces/company-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { AuthRepository } from 'src/domain/user-auth/interfaces/auth-repository.interface';

@Injectable()
export class CompanyService {
    constructor(
        @Inject('CompanyRepository') private CompanyRepository: CompanyRepository,
        @Inject('AuthRepository') private userRepository: AuthRepository,

        ) { }

    /**
     *
     *
     * @param {Company} Company
     * @return {*}  {Promise<GenericResponse<Company>>}
     * @memberof CompanyService
     */
    public async create(Company: Company): Promise<GenericResponse<Company>> {
        let res : any = await this.CompanyRepository.create(Company);
       
       
        let userData = {
            _id : Company.coordinator,
            "externalUser.company" : res._id
        }

        let userUpdate =  await this.userRepository.update(userData);

        return {
            message: "Company Created successfully",
            success: true,
            data: res,
        }
    }
    /**
     *
     *
     * @return {*}  {Promise<GenericResponse<Company[]>>}
     * @memberof CompanyService
     */
    public async getAll(page:number , size : number): Promise<GenericResponse<Company[]>> {
        let res = await this.CompanyRepository.getAll(page,size);
        return {
            message: "Companies fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     *
     *
     * @param {*} id
     * @return {*}  {Promise<GenericResponse<Company[]>>}
     * @memberof CompanyService
     */
    public async getUserCompanys(id): Promise<GenericResponse<Company[]>> {
        let res = await this.CompanyRepository.getUserCompany(id);
        return {
            message: "Companys fetched successfully",
            success: true,
            data: res,
        }
    }


    /**
     *
     *
     * @param {UpdateCompany} Company
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof CompanyService
     */
    public async update(Company: UpdateCompany): Promise<GenericResponse<null>> {


        let companyData = await this.getUserCompanys(Company._id)
        if(companyData.data[0].coordinator != Company.coordinator){
            await this.userRepository.update({_id : companyData.data[0].coordinator ,"externalUser.company" : '6637b2662ba03d1ffddfd2b6'})
        }

        let res = await this.CompanyRepository.update(Company);
        if (res.modifiedCount > 0) {
            return {
                message: "Company updated successfully",
                success: true,
                data: null,
            }
        }
        return {
            message: "Failed to updated Company",
            success: true,
            data: null,
        }
    }
    
    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof CompanyService
     */
    public async delete(_id: string): Promise<GenericResponse<null>> {
        let res = await this.CompanyRepository.delete(_id);
        if (res.deletedCount > 0) {
            return {
                message: "Company deleted successfully",
                success: true,
                data: null,
            }
        }
        return {
            message: "Failed to delete Company",
            success: true,
            data: null,
        }
    }
}
