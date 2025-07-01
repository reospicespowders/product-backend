import { Audit } from "../entities/audit.enitity";

export interface AuditRepository {
    /**
     *
     *  create audit
     * @param {Audit} ou
     * @return {*}  {Promise<Audit>}
     * @memberof AuditRepository
     */
    create(ou:Audit):Promise<Audit>;
    /**
     *
     * Get all audits
     * @param {number} page
     * @param {number} offset
     * @return {*}  {Promise<Audit[]>}
     * @memberof AuditRepository
     */
    getAll(page:number,offset:number):Promise<Audit[]>;
}