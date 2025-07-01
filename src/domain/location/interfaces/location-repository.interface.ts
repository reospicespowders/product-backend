import { Location, UpdateLocationDTO } from "../dto/location.dto";


/**
 *
 *
 * @export
 * @interface LocationRepository
 */
export interface LocationRepository {
    /**
     *
     *
     * @param {Location} location
     * @return {*}  {Promise<Location>}
     * @memberof LocationRepository
     */
    create(location: Location): Promise<Location>;
    /**
     *
     *
     * @return {*}  {Promise<Location[]>}
     * @memberof LocationRepository
     */

    getAll(): Promise<Location[]>;
    /**
     *
     *
     * @param {UpdateLocationDTO} location
     * @return {*}  {Promise<Location>}
     * @memberof LocationRepository
     */
    update(location: UpdateLocationDTO): Promise<Location>;
    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof LocationRepository
     */
    delete(_id: string): Promise<any>;
}