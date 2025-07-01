
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSVendorCompanyDto, UpdateMSVendorCompanyDto } from 'src/domain/mystory-shopper/dto/ms-vendor-company.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSVendorCompanyService } from 'src/usecase/services/mystory-shopper/ms-vendor-company.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


@Controller('ms-vendor-company')
@ApiTags('MS Vendor Company')
@ApiBearerAuth()
export class MSVendorCompanyController {

    constructor(private msVendorCompanyService: MSVendorCompanyService) { }

    @Post()
    @Secured()
    async create(@Body() MSVendorCompanyDto: MSVendorCompanyDto): Promise<GenericResponse<MSVendorCompanyDto>> {
        return this.msVendorCompanyService.create(MSVendorCompanyDto);
    }

    @Post('checkVendor')
    @Secured()
    async checkVendor(@Body() data:any): Promise<GenericResponse<any>> {
        return this.msVendorCompanyService.checkVendor(data);
    }

    @Get('id/:id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msVendorCompanyService.get(id);
    }

    @Get('')
    @Secured()
    public async getAll(): Promise<GenericResponse<MSVendorCompanyDto[]>> {
        return this.msVendorCompanyService.getAll();
    }

    @Put()
    @Secured()
    async update(@Body() MSVendorCompanyDto: UpdateMSVendorCompanyDto): Promise<GenericResponse<UpdateMSVendorCompanyDto>> {
        return this.msVendorCompanyService.update(MSVendorCompanyDto);
    }

    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSVendorCompanyDto>> {
        return this.msVendorCompanyService.delete(id);
    }
}
