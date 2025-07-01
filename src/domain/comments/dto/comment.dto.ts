import { IntersectionType } from "@nestjs/swagger";
import { Data } from "src/domain/data/dto/data.dto"
import { OrganizationalUnit } from "src/domain/organizational-unit/dto/organizational-unit.dto";
import { User } from "src/domain/user-auth/dto/user-type..dto";



export class Comment {
    data_id: string;
    status: string;
    ou: string;
    text: string;
    like: boolean;
    by: string;
    approved_by: string;
    rejectReason: string;
}

export class UpdateCommentDto extends IntersectionType(Comment) {
    _id: string;
}

export class ChangeCommentStatusDto {
    _id:string;
    status:string;
    rejectReason?:string;
}