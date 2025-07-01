import { Controller, Get, Put, Post, Delete, Query, Body, UsePipes, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';

import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { SettingsService } from 'src/usecase/services/data/settings.service';
import { Settings, UpdateSettings } from 'src/domain/data/dto/settings.dto';



/**
 *Data Settings Controllers
 *
 * @export
 * @class SettingsController
 */
@Controller('settings')
@ApiTags('Settings')
@ApiBearerAuth()
export class SettingsController {


    /**
     * Creates an instance of SettingsController.
     * @param {SettingsService} SettingsService
     * @memberof SettingsController
     */
    constructor(private SettingsService: SettingsService) { }


    /**
     *Create new data Settings
     *
     * @param {Settings} data
     * @return {*}  {Promise<GenericResponse<Settings>>}
     * @memberof SettingsController
     */
    @Post('')
    @Secured()
    public async create(@Body() data: Settings): Promise<GenericResponse<Settings>> {
        return this.SettingsService.create(data);
    }


    /**
     *get all Settingss
     *
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<Settings[]>>}
     * @memberof SettingsController
     */
    @Post('/get')
    @Secured()
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<Settings[]>> {
        return this.SettingsService.getAll(page, offset);
    }



    /**
     *Update an existing data Settings
     *
     * @param {UpdateSettings} updateSettings
     * @return {*}  {Promise<GenericResponse<Settings>>}
     * @memberof SettingsController
     */
    @Put('')
    @Secured()
    public async update(@Body() updateSettings: UpdateSettings): Promise<GenericResponse<Settings>> {
        return this.SettingsService.update(updateSettings);
    }


    /**
     *Delete an existing data Settings
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof SettingsController
     */
    @Delete('/:id')
    @Secured()
    public async delete(@Param('id') id: string): Promise<GenericResponse<any>> {
        return this.SettingsService.delete(id);
    }

}
