import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AssessmentSurveyCache } from 'src/domain/assessment-survey-cache/entities/assessment-survey-cache.entity';
import { CacheRepository } from 'src/domain/assessment-survey-cache/interfaces/cache-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { CacheService } from 'src/usecase/services/cache-service/cache-service.service';

@Controller('cache-controller')
@ApiTags('Cache')
export class CacheController {

    constructor(private cacheService: CacheService) { }

    @Post()
    @OpenRoute()
    save(@Body() data: AssessmentSurveyCache): Promise<GenericResponse<AssessmentSurveyCache>> {
        return this.cacheService.save(data);
    }

    @Post('/get')
    @OpenRoute()
    getCache(@Body() data: { surveyId: string, email: string }): Promise<GenericResponse<AssessmentSurveyCache>> {
        return this.cacheService.getCache(data.surveyId, data.email);
    }

    @Post('/getCount')
    @OpenRoute()
    getCacheCount(@Body()  data: {_id: string} ): Promise<GenericResponse<any>> {
        return this.cacheService.getCacheCount(data._id);
    }

    @Post('/getExcelData')
    @OpenRoute()
    getExcelData(@Body()  data: {_id: string} ): Promise<GenericResponse<any>> {
        return this.cacheService.getExcelData(data._id);
    }

    @Post('/delete')
    @OpenRoute()
    async delete(@Body() data: { surveyId: string, email: string }): Promise<GenericResponse<AssessmentSurveyCache>> {
        return this.cacheService.delete(data.surveyId, data.email);
    }

}
