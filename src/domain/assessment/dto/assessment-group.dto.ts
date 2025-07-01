import { IntersectionType } from "@nestjs/swagger";


export class AssessmentGroup {
    assessmentIds: string[];
}

export class UpdateAssessmentGroup extends IntersectionType(AssessmentGroup) {
    _id: string;
}