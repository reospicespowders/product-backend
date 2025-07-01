import { IntersectionType } from "@nestjs/swagger";
import { User } from "src/domain/user-auth/dto/user-type..dto";


export class SurveyType {
    name: string;
    requiredAttendance: boolean;
    tag: SurveyTag;
    active?: boolean;
    createdBy: User | string
}

export class SurveyTag {
    tag: string;
    arabic: string;
    type:string
}

export class UpdateSurveyTagDto {
    _id: string
    arabic: string
}

export class UpdateSurveyTypeDto extends IntersectionType(SurveyType) {
    _id: string;
}