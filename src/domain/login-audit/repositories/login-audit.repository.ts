import { Injectable } from "@nestjs/common";
import { LoginAuditRepository } from "../interfaces/login-audit-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LoginAudit } from "../dto/login-audit.dto";

@Injectable()
export class LoginAuditRepositoryImpl implements LoginAuditRepository {

    constructor(
        @InjectModel('login-audit') private readonly loginAuditModel: Model<LoginAudit>,
    ) { }

    async createLoginAudit(audit: any): Promise<void> {
        this.loginAuditModel.create(audit);
    }
}