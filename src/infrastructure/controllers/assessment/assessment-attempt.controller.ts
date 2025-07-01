import { Controller, Post, Get, Param, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssessmentAttempt } from 'src/domain/assessment/dto/assessment-attempt.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { AssessmentAttemptService } from 'src/usecase/services/assessment/assessment-attempt.service';
import { getValidator } from '../data/data.validations';

@Controller('assessment-attempt')
@ApiBearerAuth()
@ApiTags('Assessment Attempt')
export class AssessmentAttemptController {

    constructor(private assessmentAttemptService: AssessmentAttemptService) { }

    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    @Get('/:id/:email')
    public async getByEmailAndId(@Param('id') id: string, @Param('email') email: string): Promise<GenericResponse<AssessmentAttempt>> {
        return this.assessmentAttemptService.getByEmailAndId(id, email);
    }

    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    @Post('/:id')
    public async generateNewAttempt(@Param('id') id: string): Promise<GenericResponse<any[]>> {
        return this.assessmentAttemptService.generateNewAttempt(id);
    }

    @Get('/check/:email/:assessmentId')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    checkIfAttempted(@Param('email') email: string, @Param('assessmentId') assessmentId: string): Promise<GenericResponse<boolean>> {
        return this.assessmentAttemptService.checkIfAttempted(email, assessmentId);
    }

    @Secured()
    @Post('/:assessmentId/:email')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async allowRedoByEmailAndAssessmentId(@Param('assessmentId') assessmentId: string,@Param('email') email: string) {
        return this.assessmentAttemptService.allowRedoByEmailAndAssessmentId(assessmentId, email);
    }
}
