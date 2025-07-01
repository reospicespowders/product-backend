import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { AuditRepository } from "../interfaces/audit-repository.interface";
import { Audit } from "../entities/audit.enitity";

/**
 * @export
 * @class AuditRepositoryImpl
 * @implements {AuditRepository}
 */
@Injectable()
export class AuditRepositoryImpl implements AuditRepository {
    constructor(@InjectModel("Audit") private readonly auditModel: Model<Audit>) { }

    public async create(audit: Audit): Promise<Audit> {
        return await this.auditModel.create(audit);
    }

    public async getAll(page,offset): Promise<Audit[]> {
        //pagination
        const skip = page * offset - offset;
        return await this.auditModel.find().skip(skip)
        .limit(offset)
        .exec();
    }
}