import { Inject, Injectable } from '@nestjs/common';
import { LoginAudit } from 'src/domain/login-audit/dto/login-audit.dto';
import { LoginAuditRepository } from 'src/domain/login-audit/interfaces/login-audit-repository.interface';

@Injectable()
export class LoginAuditService {

    constructor(
        @Inject("LoginAuditRepository") private readonly loginAuditRepository: LoginAuditRepository
    ) { }

    async createAudit(userId: string): Promise<void> {
        const audit: LoginAudit = new LoginAudit();
        audit.userId = userId;
        audit.createdTimestamp = new Date();
        await this.loginAuditRepository.createLoginAudit(audit);
    }
}
