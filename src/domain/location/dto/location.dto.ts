import { IntersectionType } from "@nestjs/swagger";

/**
 *
 *
 * @export
 * @class Location
 */
export class Location {
    name: string;
    active: boolean
}

/**
 *
 *
 * @export
 * @class UpdateLocationDTO
 * @extends {IntersectionType(Location,LocationWithID)}
 */
export class UpdateLocationDTO extends IntersectionType(Location) {
    _id: string
}