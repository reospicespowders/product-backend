
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssessmentGroup, UpdateAssessmentGroup } from 'src/domain/assessment/dto/assessment-group.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { AssessmentGroupService } from 'src/usecase/services/assessment/assessment-group.service';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Assessment Group Controllers
 *
 * @export
 * @class AssessmentGroupController
 */
@Controller('assessment-group')
@ApiTags('Assessment Group')
@ApiBearerAuth()
export class AssessmentGroupController {

    /**
     * Creates an instance of AssessmentGroupController.
     * @param {AssessmentGroupService} assessmentGroupService
     * @memberof AssessmentGroupController
     */
    constructor(private assessmentGroupService: AssessmentGroupService) { }

    /**
     *Create a new factor log
     *
     * @param {AssessmentGroup} assessmentGroupDto
     * @return {*}  {Promise<GenericResponse<AssessmentGroup>>}
     * @memberof AssessmentGroupController
     */
    @Post('/')
    @Secured()
    async create(@Body() assessmentGroupDto: AssessmentGroup): Promise<GenericResponse<AssessmentGroup>> {
        return this.assessmentGroupService.create(assessmentGroupDto);
    }

    /**
     *Get factor log by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof AssessmentGroupController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.assessmentGroupService.get(id);
    }

    /**
     *Get all factor logs paginated
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string[]} tags
     * @return {*} 
     * @memberof AssessmentGroupController
     */
    @Get('/getAll')
    @Secured()
    public async getAll() {
        return this.assessmentGroupService.getAll();
    }

    /**
     *Update an existing factor log
     *
     * @param {string} id
     * @param {UpdateAssessmentGroup} assessmentGroupDto
     * @return {*}  {Promise<GenericResponse<UpdateAssessmentGroup>>}
     * @memberof AssessmentGroupController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() assessmentGroupDto: UpdateAssessmentGroup): Promise<GenericResponse<UpdateAssessmentGroup>> {
        return this.assessmentGroupService.update(id, assessmentGroupDto);
    }

    /**
     *Delete an existing factor log
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<AssessmentGroup>>}
     * @memberof AssessmentGroupController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<AssessmentGroup>> {
        return this.assessmentGroupService.delete(id);
    }
}
