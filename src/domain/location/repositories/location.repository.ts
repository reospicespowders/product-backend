import { InjectModel } from "@nestjs/mongoose";
import { Location, UpdateLocationDTO } from "../dto/location.dto";
import { LocationRepository } from "../interfaces/location-repository.interface";
import { Injectable } from '@nestjs/common';
import { Model } from "mongoose";

/**
 *
 *
 * @export
 * @class LocationRepositoryImpl
 * @implements {LocationRepository}
 */
@Injectable()
export class LocationRepositoryImpl implements LocationRepository {


    /**
     * Creates an instance of LocationRepositoryImpl.
     * @param {Model<Location>} locationModel
     * @memberof LocationRepositoryImpl
     */
    constructor(@InjectModel('OU-Location') private readonly locationModel: Model<Location>) { }



    /**
     *
     *
     * @param {Location} location
     * @return {*}  {Promise<Location>}
     * @memberof LocationRepositoryImpl
     */
    create(location: Location): Promise<Location> {
        return this.locationModel.create(location);
    }



    /**
     *
     *
     * @return {*}  {Promise<Location[]>}
     * @memberof LocationRepositoryImpl
     */
    getAll(): Promise<Location[]> {
        return this.locationModel.find();
    }


    /**
     *
     *
     * @param {UpdateLocationDTO} location
     * @return {*}  {Promise<Location>}
     * @memberof LocationRepositoryImpl
     */
    update(location: UpdateLocationDTO): Promise<Location> {
        return this.locationModel.findByIdAndUpdate(location._id, location)
    }


    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof LocationRepositoryImpl
     */
    delete(_id: string): Promise<any> {
        return this.locationModel.deleteOne({ _id });
    }

}