import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { Location, UpdateLocationDTO } from 'src/domain/location/dto/location.dto';
import { LocationRepository } from 'src/domain/location/interfaces/location-repository.interface';


/**
 *
 *
 * @export
 * @class LocationService
 */
@Injectable()
export class LocationService {

    constructor(@Inject('LocationRepository') private locationRepository: LocationRepository) { }


    /**
     *
     *
     * @return {*}  {Promise<GenericResponse<Location[]>>}
     * @memberof LocationService
     */
    public async getAll(page,offset): Promise<GenericResponse<Location[]>> {
        const res = await this.locationRepository.getAll();

        const response: GenericResponse<Location[]> = {
            success: true,
            message: 'Location fetched Successfully',
            data: res,
        };
        return response;
    }


    /**
     *
     *
     * @param {Location} location
     * @return {*}  {Promise<GenericResponse<Location>>}
     * @memberof LocationService
     */
    public async create(location: Location): Promise<GenericResponse<Location>> {
        const res = await this.locationRepository.create(location)

        const response: GenericResponse<Location> = {
            success: true,
            message: 'Location added Successfully',
            data: res,
        };
        return response;
    }


    /**
     *
     *
     * @param {UpdateLocationDTO} updateLocationDto
     * @return {*}  {Promise<GenericResponse<Location>>}
     * @memberof LocationService
     */
    public async update(updateLocationDto: UpdateLocationDTO): Promise<GenericResponse<Location>> {
        const res = await this.locationRepository.update(updateLocationDto);

        const response: GenericResponse<Location> = {
            success: true,
            message: 'Location updated Successfully',
            data: res,
        };
        return response;
    }


    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof LocationService
     */
    public async delete(_id: string): Promise<GenericResponse<any>> {
        const res = await this.locationRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: 'Location deleted Successfully',
            data: res,
        };
        return response;
    }
}
