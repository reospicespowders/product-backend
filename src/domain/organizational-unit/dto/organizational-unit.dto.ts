import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";
import { User } from "src/domain/user-auth/dto/user-type..dto";

/**
 *
 * class for Organizational Units
 * @export
 * @class OrganizationalUnit
 */
export class OrganizationalUnit {
    name: string
    parent: Types.ObjectId;
    category: Types.ObjectId;
    allowSingleUser: boolean
    type: Types.ObjectId;
    location: Types.ObjectId;
    image?: string;
    image_sq?: string;
    isManager: boolean;
    active: boolean;
    theme: any
    managers?: User[]
    description?:string
    id?: number;
};


/**
 *
 *
 * @export
 * @class UpdateOUDto
 * @extends {IntersectionType(OrganizationalUnit, OUWithID)}
 */
export class UpdateOUDto extends IntersectionType(OrganizationalUnit) {
    _id: string
}