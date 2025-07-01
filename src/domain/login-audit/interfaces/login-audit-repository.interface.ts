import { LoginAudit } from "../dto/login-audit.dto";


export interface LoginAuditRepository {
    createLoginAudit(audit: LoginAudit): Promise<void>;
}