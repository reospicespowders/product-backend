import { Controller, Get, Put, Post, Delete, Query, Body, Param, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { Location, UpdateLocationDTO } from 'src/domain/location/dto/location.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { LocationService } from 'src/usecase/services/location/location.service';
import { getValidator } from '../data/data.validations';


/**
 *Location Controllers
 *
 * @export
 * @class LocationController
 */
@Controller('location')
@ApiTags('Location')
@ApiBearerAuth()
export class LocationController {


    /**
     * Creates an instance of LocationController.
     * @param {LocationService} locationService
     * @memberof LocationController
     */
    constructor(private locationService: LocationService) { }


    /**
     *Create new location
     *
     * @param {Location} location
     * @return {*}  {Promise<GenericResponse<Location>>}
     * @memberof LocationController
     */
    @Post('')
    @Secured('OU_LOCATION', 'c')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async create(@Body() location: Location): Promise<GenericResponse<Location>> {
        return this.locationService.create(location);
    }


    /**
     *Get all locations
     *
     * @return {*}  {Promise<GenericResponse<Location[]>>}
     * @memberof LocationController
     */
    @Get('')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<Location[]>> {
        return this.locationService.getAll(page,offset);
    }


    /**
     *Update an existing location
     *
     * @param {UpdateLocationDTO} updateLocationDto
     * @return {*}  {Promise<GenericResponse<Location>>}
     * @memberof LocationController
     */
    @Put('')
    @Secured('OU_LOCATION', 'u')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async update(@Body() updateLocationDto: UpdateLocationDTO): Promise<GenericResponse<Location>> {
        return this.locationService.update(updateLocationDto);
    }


    /**
     *Delete an existing location
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof LocationController
     */
    @Delete('/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured('OU_LOCATION', 'd')
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.locationService.delete(id);
    }

}
