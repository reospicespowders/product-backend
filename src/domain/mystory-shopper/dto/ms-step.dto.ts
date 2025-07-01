import { IntersectionType } from "@nestjs/swagger";

export class MSStep {
    projectId: string
    sessionId: string
    approvalStatus: string
    comments: string
    step: string
    isViewedInternal: boolean
    isViewedExternal: boolean
}

export class UpdateMSStep extends IntersectionType(MSStep) {
    _id: string;
}