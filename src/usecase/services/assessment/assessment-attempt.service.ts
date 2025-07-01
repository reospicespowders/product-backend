import { Injectable, Inject } from '@nestjs/common';
import { AssessmentAttempt } from 'src/domain/assessment/dto/assessment-attempt.dto';
import { AssessmentAttemptRepository } from 'src/domain/assessment/interfaces/assessment-attempt-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class AssessmentAttemptService {
    constructor(@Inject('AssessmentAttemptRepository') private assessmentAttemptRepository: AssessmentAttemptRepository) { }

    async getByEmailAndId(id: string, email: string): Promise<GenericResponse<AssessmentAttempt>> {
        let res = await this.assessmentAttemptRepository.getById(id, email);
        return {
            message: 'Assessment Result fetched successfully',
            success: true,
            data: res
        }
    }

    async generateNewAttempt(id: string): Promise<GenericResponse<any[]>> {
        let res = await this.assessmentAttemptRepository.generateNewAttempt(id);
        return {
            message: 'Assessment Attempt fetched successfully',
            success: true,
            data: res
        }
    }

    async checkIfAttempted(email: string, assessmentId: string): Promise<GenericResponse<boolean>> {
        let res = await this.assessmentAttemptRepository.checkIfAttempted(email, assessmentId, false);
        return {
            message: 'Status checked successfully',
            success: true,
            data: res
        }
    }

    public async allowRedoByEmailAndAssessmentId(assessmentId: string,email: string): Promise<GenericResponse<null>> {
        let res = await this.assessmentAttemptRepository.allowRedoByEmailAndAssessmentId(assessmentId, email, true);
        if (res.modifiedCount > 0) {
            return {
                message: "Assessment Attempt redo successfully",
                success: true,
                data: null,
            }
        }
        return {
            message: "Failed to Assessment Attempt redo",
            success: true,
            data: null,
        }
    }
}
