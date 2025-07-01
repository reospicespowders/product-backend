// src/infrastructure/controllers/company/company.controller.ts

import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Company, UpdateCompany } from 'src/domain/company/dto/company.dto';
import { createCompanyValidation, updateCompanyValidation } from 'src/domain/company/validation/company.validation';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { CompanyService } from 'src/usecase/services/company/company.service';
import { getValidator } from '../data/data.validations';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';

@Controller('company')
@ApiTags('Company')
@ApiBearerAuth()
export class CompanyController {

    constructor(private CompanyService: CompanyService) { }

    /**
     *
     *
     * @return {*} 
     * @memberof CompanyController
     */
    @Get('')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10) {
        return this.CompanyService.getAll(page,size);
    }


    @Get('coordinator/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getUserCompanys(@Param('id') id: string) {
        return this.CompanyService.getUserCompanys(id);
    }


    /**
     *
     *
     * @param {Company} Company
     * @return {*} 
     * @memberof CompanyController
     */
    @Post('')
    @Secured()
    @UsePipes(new JoiValidationPipe(createCompanyValidation))
    public async create(@Body() Company: Company) {
        return this.CompanyService.create(Company);
    }

    /**
     *
     *
     * @param {UpdateCompany} Company
     * @return {*} 
     * @memberof CompanyController
     */
    @Put('')
    @Secured()
    @UsePipes(new JoiValidationPipe(updateCompanyValidation))
    public async update(@Body() Company: UpdateCompany) {
        return this.CompanyService.update(Company);
    }

    /**
     *
     *
     * @param {string} _id
     * @return {*} 
     * @memberof CompanyController
     */
    @Delete('/:id')
    @Secured()
    public async delete(@Param('id') _id: string) {
        return this.CompanyService.delete(_id);
    }
}
