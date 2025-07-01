import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSFactorLogs, UpdateMSFactorLogs } from 'src/domain/mystory-shopper/dto/ms-factor-logs.dto';
import { MSFactorLogsRepository } from 'src/domain/mystory-shopper/interfaces/ms-factor-logs-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';


/**
 *MSFactorLogs Service
 *
 * @export
 * @class MSFactorLogsService
 */
@Injectable()
export class MSFactorLogsService {

    /**
     * Creates an instance of MSFactorLogsService.
     * @param {MSFactorLogsRepository} MSFactorLogsRepository
     * @memberof MSFactorLogsService
     */
    constructor(
        @Inject('MSFactorLogsRepository') private msFactorLogsRepository: MSFactorLogsRepository,
    ) { }
    
    
    /**
     *Create a new factor log
     *
     * @param {MSFactorLogs} msFactorLogsDto
     * @return {*}  {Promise<GenericResponse<MSFactorLogs>>}
     * @memberof MSFactorLogsService
     */
    async create(msFactorLogsDto: MSFactorLogs): Promise<GenericResponse<MSFactorLogs>> {
        const createdMSFactorLogs = await this.msFactorLogsRepository.create(msFactorLogsDto);
        return {
            success: true,
            message: 'MSFactorLogs created successfully.', 
            data: createdMSFactorLogs 
        };
    }

    /**
     *Get factor log by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSFactorLogs>>}
     * @memberof MSFactorLogsService
     */
    async get(id: string): Promise<GenericResponse<MSFactorLogs>> {
        const msFactorLogs = await this.msFactorLogsRepository.findById(id);
        if (!msFactorLogs) {
            throw new NotFoundException('MSFactorLogs not found');
        }
        return {
            success: true,
            message: 'MSFactorLogs retrieved successfully.', 
            data: msFactorLogs 
        };
    }

    /**
     *Get factor log by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSFactorLogs>>}
     * @memberof MSFactorLogsService
     */
     async getByFactor(id: string): Promise<GenericResponse<MSFactorLogs[]>> {
        const msFactorLogs = await this.msFactorLogsRepository.getByFactor(id);
        if (!msFactorLogs) {
            throw new NotFoundException('MSFactorLogs not found');
        }
        return {
            success: true,
            message: 'MSFactorLogs retrieved successfully.', 
            data: msFactorLogs 
        };
    }

    /**
     *Get all factor logs paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSFactorLogsService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msFactorLogss = await this.msFactorLogsRepository.findAll(page, size, tags);
        return { 
            success: true,
            message: 'MSFactorLogss retrieved successfully.', 
            data: msFactorLogss 
        };
    }

    /**
     *Update an existing factor log
     *
     * @param {string} id
     * @param {UpdateMSFactorLogs} msFactorLogsDto
     * @return {*}  {Promise<GenericResponse<UpdateMSFactorLogs>>}
     * @memberof MSFactorLogsService
     */
    async update(id: string, msFactorLogsDto: UpdateMSFactorLogs): Promise<GenericResponse<UpdateMSFactorLogs>> {
        const msFactorLogs = await this.msFactorLogsRepository.findById(id);
        if (!msFactorLogs) {
            throw new NotFoundException('MSFactorLogs not found');
        }
        const updatedMSFactorLogs = await this.msFactorLogsRepository.update(id, msFactorLogsDto);
        return { 
            success: true,
            message: 'MSFactorLogs updated successfully.', 
            data: null 
        };
    }

    /**
     *Delete an existing factor log by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSFactorLogsService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msFactorLogs = await this.msFactorLogsRepository.findById(id);
        if (!msFactorLogs) {
            throw new NotFoundException('MSFactorLogs not found');
        }
        const deletedMSFactorLogs = await this.msFactorLogsRepository.delete(id);
        if (!deletedMSFactorLogs) {
            throw new NotFoundException('MSFactorLogs not found');
        }

        return { 
            success: true,
            message: 'MSFactorLogs deleted successfully.',
            data: ''
         };
    }
}
