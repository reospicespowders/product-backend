import { Injectable, NestMiddleware, Inject } from "@nestjs/common";
import { Audit } from "src/domain/audit/entities/audit.enitity";
import { NextFunction, Request, Response } from 'express'
import { AuditRepository } from "src/domain/audit/interfaces/audit-repository.interface";

/**
 * @export
 * @class AuditMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(
    @Inject('AuditRepository')
    private auditRepository: AuditRepository
  ) { }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof AuditMiddleware
   */
  async use(req: Request, res: Response, next: NextFunction) {
    // Perform your authentication/authorization logic here
    // ...
    // Create and save the audit trail
    if (!req.headers.authorization) {
      const audit = new Audit();
      audit.action = req.method;
      audit.entity = req.originalUrl;
      this.auditRepository.create(audit);
    } else {
      const audit = new Audit();
      if (req['user']) {
        audit.userId = req['user'].uid;
      }
      audit.action = req.method;
      audit.entity = req.originalUrl;
      this.auditRepository.create(audit);
    }

    next();
  }
}
