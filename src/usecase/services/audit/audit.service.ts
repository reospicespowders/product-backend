import { Injectable,Inject } from '@nestjs/common';
import { Audit } from 'src/domain/audit/entities/audit.enitity';
import { AuditRepository } from 'src/domain/audit/interfaces/audit-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';

/**
 * @export
 * @class AuditService
 */
@Injectable()
export class AuditService {

    /**
     * Creates an instance of AuditService.
     * @param {AuditRepository} auditRepository
     * @memberof AuditService
     */
    constructor(@Inject('AuditRepository') private auditRepository:AuditRepository){}


    /**
     *
     *  Get all Audit Records
     * @return {*}  {Promise<Audit[]>}
     * @memberof AuditService
     */
    public async getAll(page: number, offset: number):Promise<any> {
      
        let data : Audit[] = await this.auditRepository.getAll(page, offset);
      
        // Generic Response
        const response: GenericResponse<Audit[]> = {
            success: true,
            message: 'Audit Fetched Successfully',
            data: data,
        };
       
        return response
    }
}
