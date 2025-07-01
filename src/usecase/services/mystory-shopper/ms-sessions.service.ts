import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSSession, MSSessionVisitDate, UpdateMSSession } from 'src/domain/mystory-shopper/dto/ms-sessions.dto';
import { MSSessionRepository } from 'src/domain/mystory-shopper/interfaces/ms-sessions-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *MSSession Service
 *
 * @export
 * @class MSSessionService
 */
@Injectable()
export class MSSessionService {

    /**
     * Creates an instance of MSSessionService.
     * @param {MSSessionRepository} MSSessionRepository
     * @memberof MSSessionService
     */
    constructor(
        @Inject('MSSessionRepository') private msSessionRepository: MSSessionRepository,
    ) { }

    /**
     *Create a new session
     *
     * @param {MSSession} msSessionDto
     * @return {*}  {Promise<GenericResponse<MSSession>>}
     * @memberof MSSessionService
     */
    async create(msSessionDto: MSSession): Promise<GenericResponse<MSSession>> {
        const createdMSSession = await this.msSessionRepository.create(msSessionDto);
        return {
            success: true,
            message: 'MSSession created successfully.',
            data: createdMSSession
        };
    }

    /**
     *Get an existing session by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSSession>>}
     * @memberof MSSessionService
     */
    async get(id: string): Promise<GenericResponse<MSSession>> {
        const msSession = await this.msSessionRepository.findById(id);
        if (!msSession) {
            throw new NotFoundException('MSSession not found');
        }
        return {
            success: true,
            message: 'MSSession retrieved successfully.',
            data: msSession
        };
    }

    /**
     *Get an existing session by project
     *
     * @param {number} page
     * @param {number} size
     * @param {string} projectId
     * @return {*} 
     * @memberof MSSessionService
     */
    async getByProject(page: number, size: number, projectId: string) {
        const msSession = await this.msSessionRepository.getByProject(page, size, projectId);
        return {
            success: true,
            message: 'MSSession retrieved successfully.',
            data: msSession
        };
    }

    /**
     *Get all sessions paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSSessionService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msSessions = await this.msSessionRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'MSSessions retrieved successfully.',
            data: msSessions
        };
    }


    /**
     *Get shapped data for calendar view
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSSessionService
     */
    async getCalender(id: string): Promise<GenericResponse<any>> {
        const msSessions = await this.msSessionRepository.getCalender(id);
        return {
            success: true,
            message: 'MSSessions retrieved successfully.',
            data: msSessions
        };
    }


    /**
     *Get all visit dates by project
     *
     * @param {string} projectId
     * @return {*} 
     * @memberof MSSessionService
     */
    async getVisitDates(projectId: string) {
        const visitDates = await this.msSessionRepository.getVisitDates(projectId);
        return {
            success: true,
            message: 'Visit Dates retrieved successfully.',
            data: visitDates
        };
    }


    /**
     *Insert a new visit date into an existing session
     *
     * @param {string} id
     * @param {MSSessionVisitDate} msSessionDto
     * @return {*}  {Promise<GenericResponse<MSSessionVisitDate>>}
     * @memberof MSSessionService
     */
    async insertSession(id: string, msSessionDto: MSSessionVisitDate): Promise<GenericResponse<MSSessionVisitDate>> {
        const msSession = await this.msSessionRepository.findById(id);
        if (!msSession) {
            throw new NotFoundException('MSSession not found');
        }
        const updatedMSSession = await this.msSessionRepository.insertSession(id, msSessionDto);
        return {
            success: true,
            message: 'MSSession updated successfully.',
            data: null
        };
    }

    /**
     *Update an existing session
     *
     * @param {string} id
     * @param {UpdateMSSession} msSessionDto
     * @return {*}  {Promise<GenericResponse<UpdateMSSession>>}
     * @memberof MSSessionService
     */
    async update(id: string, msSessionDto: UpdateMSSession): Promise<GenericResponse<UpdateMSSession>> {
        const msSession = await this.msSessionRepository.findById(id);
        if (!msSession) {
            throw new NotFoundException('MSSession not found');
        }
        const updatedMSSession = await this.msSessionRepository.update(id, msSessionDto);
        return {
            success: true,
            message: 'MSSession updated successfully.',
            data: null
        };
    }

    /**
     *Delete an existing session
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSSessionService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msSession = await this.msSessionRepository.findById(id);
        if (!msSession) {
            throw new NotFoundException('MSSession not found');
        }
        const deletedMSSession = await this.msSessionRepository.delete(id);
        if (!deletedMSSession) {
            throw new NotFoundException('MSSession not found');
        }

        return {
            success: true,
            message: 'MSSession deleted successfully.',
            data: ''
        };
    }


    async deleteVisit(sessionId: string,visitId: string,): Promise<GenericResponse<any>> {
        const msSession = await this.msSessionRepository.findById(sessionId);
        if (!msSession) {
            throw new NotFoundException('MSSession not found');
        }
        const deletedMSSession = await this.msSessionRepository.deleteVisit(sessionId,visitId);
        if (!deletedMSSession) {
            throw new NotFoundException('MSSession not found');
        }

        return {
            success: true,
            message: 'MSSession Visit deleted successfully.',
            data: ''
        };
    }
}
