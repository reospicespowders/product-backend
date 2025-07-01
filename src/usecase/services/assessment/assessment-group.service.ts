import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AssessmentGroup, UpdateAssessmentGroup } from 'src/domain/assessment/dto/assessment-group.dto';
import { AssessmentGroupRepository } from 'src/domain/assessment/interfaces/assessment-group-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *AssessmentGroup Service
 *
 * @export
 * @class AssessmentGroupService
 */
@Injectable()
export class AssessmentGroupService {

    /**
     * Creates an instance of AssessmentGroupService.
     * @param {AssessmentGroupRepository} AssessmentGroupRepository
     * @memberof AssessmentGroupService
     */
    constructor(
        @Inject('AssessmentGroupRepository') private assessmentGroupRepository: AssessmentGroupRepository,
    ) { }
    
    
    /**
     *Create a new factor log
     *
     * @param {AssessmentGroup} assessmentGroupDto
     * @return {*}  {Promise<GenericResponse<AssessmentGroup>>}
     * @memberof AssessmentGroupService
     */
    async create(assessmentGroupDto: AssessmentGroup): Promise<GenericResponse<AssessmentGroup>> {
        const createdAssessmentGroup = await this.assessmentGroupRepository.create(assessmentGroupDto);
        return {
            success: true,
            message: 'AssessmentGroup created successfully.', 
            data: createdAssessmentGroup 
        };
    }

    /**
     *Get factor log by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<AssessmentGroup>>}
     * @memberof AssessmentGroupService
     */
    async get(id: string): Promise<GenericResponse<AssessmentGroup>> {
        const assessmentGroup = await this.assessmentGroupRepository.findById(id);
        if (!assessmentGroup) {
            throw new NotFoundException('AssessmentGroup not found');
        }
        return {
            success: true,
            message: 'AssessmentGroup retrieved successfully.', 
            data: assessmentGroup 
        };
    }

    /**
     *Get all factor logs paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof AssessmentGroupService
     */
    async getAll(): Promise<GenericResponse<any>> {
        const assessmentGroups = await this.assessmentGroupRepository.findAll();
        return { 
            success: true,
            message: 'AssessmentGroups retrieved successfully.', 
            data: assessmentGroups 
        };
    }

    /**
     *Update an existing factor log
     *
     * @param {string} id
     * @param {UpdateAssessmentGroup} assessmentGroupDto
     * @return {*}  {Promise<GenericResponse<UpdateAssessmentGroup>>}
     * @memberof AssessmentGroupService
     */
    async update(id: string, assessmentGroupDto: UpdateAssessmentGroup): Promise<GenericResponse<UpdateAssessmentGroup>> {
        const assessmentGroup = await this.assessmentGroupRepository.findById(id);
        if (!assessmentGroup) {
            throw new NotFoundException('AssessmentGroup not found');
        }
        const updatedAssessmentGroup = await this.assessmentGroupRepository.update(id, assessmentGroupDto);
        return { 
            success: true,
            message: 'AssessmentGroup updated successfully.', 
            data: null 
        };
    }

    /**
     *Delete an existing factor log by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof AssessmentGroupService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const assessmentGroup = await this.assessmentGroupRepository.findById(id);
        if (!assessmentGroup) {
            throw new NotFoundException('AssessmentGroup not found');
        }
        const deletedAssessmentGroup = await this.assessmentGroupRepository.delete(id);
        if (!deletedAssessmentGroup) {
            throw new NotFoundException('AssessmentGroup not found');
        }

        return { 
            success: true,
            message: 'AssessmentGroup deleted successfully.',
            data: ''
         };
    }
}
