import { IntersectionType } from "@nestjs/swagger";
import { Permission } from "src/domain/permission/dto/permission.dto";


export class Role {
    name: string;
    description: string;
    permissions: Array<Permission | string>;
    active: boolean;
}

export class UpdateRoleDto extends IntersectionType(Role) {
    _id: string;
}