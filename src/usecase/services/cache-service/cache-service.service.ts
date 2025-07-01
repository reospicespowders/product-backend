import { Inject, Injectable } from '@nestjs/common';
import { AssessmentSurveyCache } from 'src/domain/assessment-survey-cache/entities/assessment-survey-cache.entity';
import { CacheRepository } from 'src/domain/assessment-survey-cache/interfaces/cache-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class CacheService {

    constructor(@Inject("CacheRepository") private readonly cacheRepository: CacheRepository) { }


    async save(data: AssessmentSurveyCache): Promise<GenericResponse<AssessmentSurveyCache>> {
        let res = await this.cacheRepository.save(data);
        return {
            success: true,
            message: "Cache saved successfully",
            data: res
        }
    }
    async getCache(surveyId: string, email: string): Promise<GenericResponse<AssessmentSurveyCache>> {
        let res = await this.cacheRepository.getCache(surveyId, email);
        return {
            success: true,
            message: "Cache fetched successfully",
            data: res
        }
    }

    async getCacheCount(_id: string): Promise<GenericResponse<any>> {
        let res = await this.cacheRepository.getCacheCount(_id);
        return {
            success: true,
            message: "Cache Count fetched successfully",
            data: res
        }
    }

    async getExcelData(_id: string): Promise<GenericResponse<any>> {
        let res = await this.cacheRepository.getExcelData(_id);
        return {
            success: true,
            message: "Excel Data fetched successfully",
            data: res
        }
    }

    async delete(surveyId: string, email: string): Promise<GenericResponse<AssessmentSurveyCache>> {
        let res = await this.cacheRepository.delete(surveyId, email);
        return {
            success: true,
            message: "Cache deleted successfully",
            data: null
        }
    }

}
