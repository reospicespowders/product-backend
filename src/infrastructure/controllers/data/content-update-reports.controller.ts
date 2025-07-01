import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UsePipes } from '@nestjs/common';

import { ContentUpdateReports, UpdateContentUpdateReports } from 'src/domain/data/dto/content-update-reports.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { ContentUpdateReportsService } from 'src/usecase/services/data/content-update-report.service';
import { getValidator } from './data.validations';


@Controller('content-update-reports')
export class ContentUpdateReportsController {
    constructor(
        @Inject(ContentUpdateReportsService)
        private readonly contentUpdateReportsService: ContentUpdateReportsService
    ) {}

    
    @Post('/')
    async create(@Body() report: ContentUpdateReports): Promise<GenericResponse<ContentUpdateReports>> {
        const result = await this.contentUpdateReportsService.create(report);
        return {
            success: true,
            message: 'Content update report created successfully',
            data: result
        };
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() report: UpdateContentUpdateReports
    ): Promise<GenericResponse<ContentUpdateReports>> {
        report._id = id;
        const result = await this.contentUpdateReportsService.update(report);
        return {
            success: true,
            message: 'Content update report updated successfully',
            data: result
        };
    }

    @Post('search')
    async getAll(
        @Query('page') page: number = 1 ,
        @Query('offset') offset: number = 10,
        @Body() filters?: Object
    ): Promise<GenericResponse<ContentUpdateReports[]>> {
        const result = await this.contentUpdateReportsService.getAll(page, offset, filters);
        return {
            success: true,
            message: 'Content update reports fetched successfully',
            data: result
        };
    }

    @Post('search-without-pagination')
    async getAllWithoutPagination(@Body() filters?: Object): Promise<GenericResponse<ContentUpdateReports[]>> {
        const result = await this.contentUpdateReportsService.getAllWithoutPagination(filters);
        return {
            success: true,
            message: 'Content update reports fetched successfully',
            data: result
        };
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        const result = await this.contentUpdateReportsService.delete(id);
        return {
            success: true,
            message: 'Content update report deleted successfully',
            data: result
        };
    }

    @Get(':id')
    async getOne(@Param('id') id: string): Promise<GenericResponse<ContentUpdateReports>> {
        const result = await this.contentUpdateReportsService.getOne(id);
        return {
            success: true,
            message: 'Content update report fetched successfully',
            data: result
        };
    }

    @Post('/ou-content-update-report')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator)) // Add appropriate validation if needed
    public async getOuContentUpdateReport(@Body() ous: Array<string>): Promise<GenericResponse<any>> {
        const report = await this.contentUpdateReportsService.getOuContentUpdateReport(ous);
        return report;
    }

    @Post('/get-content-experts')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator)) // Add appropriate validation if needed
    public async getContentExperts(@Body() ou: string): Promise<GenericResponse<any>> {
        const report = await this.contentUpdateReportsService.getContentExperts(ou);
        return report;
    }
}
