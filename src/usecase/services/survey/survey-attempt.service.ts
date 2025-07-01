import { Injectable, Inject } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { SurveyAttempt, UpdateSurveyAttempt } from 'src/domain/survey/dto/survey-attempt.dto';
import { SurveyAttemptRepository } from 'src/domain/survey/interfaces/survey-attempt-repository.interface';

@Injectable()
export class SurveyAttemptService {

    constructor(@Inject('SurveyAttemptRepository') private surveyAttemptRepository: SurveyAttemptRepository) { }

    async updateAttempt(data: any): Promise<GenericResponse<UpdateSurveyAttempt>> {
        let res = await this.surveyAttemptRepository.updateAttempt(data);
        return {
            message: 'Survey Attempt Updated Successfully',
            success: true,
            data: res
        }
    }

    async getAvgRating(data: any): Promise<GenericResponse<any>> {
        let res = await this.surveyAttemptRepository.getAvgRating(data);
        return {
            message: 'Avg Rating Fetched Successfully',
            success: true,
            data: res
        }
    }
    
    async getByEmailAndId(id: string, email: string): Promise<GenericResponse<SurveyAttempt>> {
        let res = await this.surveyAttemptRepository.getById(id, email);
        return {
            message: 'Survey Result fetched successfully',
            success: true,
            data: res
        }
    }

    async generateNewAttempt(id: string): Promise<GenericResponse<any[]>> {
        let res = await this.surveyAttemptRepository.generateNewAttempt(id);
        return {
            message: 'Survey Attempt fetched successfully',
            success: true,
            data: res
        }
    }

    async checkIfAttemptedForSession(email: string, ids: string[]): Promise<GenericResponse<any>> {
        const promises = ids.map(async id => {
            const attempted = await this.surveyAttemptRepository.checkIfAttempted(email, id, false);
            return { _id: id, attempted };
        });

        return {
            message: 'Status checked successfully',
            success: true,
            data: await Promise.all(promises)
        }

    }

    async checkIfAttempted(email: string, surveyId: string): Promise<GenericResponse<boolean>> {
        let res = await this.surveyAttemptRepository.checkIfAttempted(email, surveyId, false);
        return {
            message: 'Status checked successfully',
            success: true,
            data: res
        }
    }

    public async allowRedoByEmailAndAssessmentId(surveyId: string,email: string): Promise<GenericResponse<null>> {
        let res = await this.surveyAttemptRepository.allowRedoByEmailAndAssessmentId(surveyId, email, true);
        if (res.modifiedCount > 0) {
            return {
                message: "survey Attempt redo successfully",
                success: true,
                data: null,
            }
        }
        return {
            message: "Failed to survey Attempt redo",
            success: true,
            data: null,
        }
    }
}
