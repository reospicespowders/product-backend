import { UpdateWriteOpResult } from "mongoose";
import { MSFactor, UpdateMSFactor } from "../../dto/children/ms-factors.dto";
import { MSFactorResponsible } from "../../dto/children/ms-factor-responsible.dto";
import { MSFactorStatusUpdateDto } from "../../dto/children/ms-factor-status-update.dto";



export interface MSFactorRepository {
    create(questionBankDto: MSFactor): Promise<MSFactor>;

    findById(id: string): Promise<MSFactor | null>;

    findAll(page: number, size: number, projectId: string): Promise<MSFactor[]>;

    update(id: string, questionBankDto: UpdateMSFactor): Promise<UpdateWriteOpResult>;

    delete(id: string): Promise<UpdateWriteOpResult | null>;

    getForDashboard(projectId: string): Promise<any>

    assignResponsible(dtos: MSFactorResponsible[]): Promise<void>;

    updateResponsible(dtos: MSFactorResponsible): Promise<void>;

    updateFactorStatus(factorStatusData: MSFactorStatusUpdateDto[], userId: string): Promise<void>
    
    updateFactorStatusApproval(factorStatusData: MSFactorStatusUpdateDto, userId: string): Promise<void>
}