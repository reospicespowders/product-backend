import { IntersectionType } from "@nestjs/swagger";



/**
 * @export
 * @class OUCategory
 */
export class OUCategory {
    name: string;
    icon: string;
    active: boolean;
}

export class UpdateOUCategory extends IntersectionType(OUCategory) {
    _id:string;
}