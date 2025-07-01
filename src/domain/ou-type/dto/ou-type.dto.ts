import { IntersectionType } from "@nestjs/swagger";

/**
 * @export
 * @class OUType
 */
export class OUType {
    name: string;
    icon: string;
    tag:string;
    active: boolean;
}

export class UpdateOUType extends IntersectionType(OUType) {
    _id: string
}