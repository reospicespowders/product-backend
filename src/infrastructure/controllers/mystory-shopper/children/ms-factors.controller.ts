
import { Body, Controller, Delete, Get, Param, Post, Put, ParseArrayPipe, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSFactor, UpdateMSFactor } from 'src/domain/mystory-shopper/dto/children/ms-factors.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MSFactorService } from 'src/usecase/services/mystory-shopper/children/ms-factors.service';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { MSFactorResponsible } from 'src/domain/mystory-shopper/dto/children/ms-factor-responsible.dto';
import { MSFactorStatusUpdateDto } from 'src/domain/mystory-shopper/dto/children/ms-factor-status-update.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';


/**
 *Mystery Shopper Factor Controllers
 *
 * @export
 * @class MSFactorController
 */
@Controller('ms-factors')
@ApiTags('Mystory Shopper Factor')
@ApiBearerAuth()
export class MSFactorController {

    /**
     * Creates an instance of MSFactorController.
     * @param {MSFactorService} msFactortService
     * @memberof MSFactorController
     */
    constructor(private msFactortService: MSFactorService) { }

    /**
     *Create a new factor
     *
     * @param {MSFactor} msFactortDto
     * @return {*}  {Promise<GenericResponse<MSFactor>>}
     * @memberof MSFactorController
     */
    @Post('/')
    @Secured()
    async create(@Body() msFactortDto: MSFactor): Promise<GenericResponse<MSFactor>> {
        return this.msFactortService.create(msFactortDto);
    }

    /**
     *Get an existing factor by id
     *
     * @param {string} id
     * @return {*}  {Promise<any>}
     * @memberof MSFactorController
     */
    @Get(':id')
    @Secured()
    async get(@Param('id') id: string): Promise<any> {
        return this.msFactortService.get(id);
    }

    /**
     *Get all factors by project id
     *
     * @param {number} [page=1]
     * @param {number} [size=10]
     * @param {string} projectId
     * @return {*} 
     * @memberof MSFactorController
     */
    @Get(':page/:size/:projectId')
    @Secured()
    public async getAll(@Param('page') page: number = 1, @Param('size') size: number = 10, @Param('projectId') projectId: string) {
        return this.msFactortService.getAll(page, size, projectId);
    }

    /**
     *Update an existing factor
     *
     * @param {string} id
     * @param {UpdateMSFactor} msFactortDto
     * @return {*}  {Promise<GenericResponse<UpdateMSFactor>>}
     * @memberof MSFactorController
     */
    @Put(':id')
    @Secured()
    async update(@Param('id') id: string, @Body() msFactortDto: UpdateMSFactor): Promise<GenericResponse<UpdateMSFactor>> {
        return this.msFactortService.update(id, msFactortDto);
    }

    /**
     *Delete an existing factor
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSFactor>>}
     * @memberof MSFactorController
     */
    @Delete(':id')
    @Secured()
    async delete(@Param('id') id: string): Promise<GenericResponse<MSFactor>> {
        return this.msFactortService.delete(id);
    }

    @Get('dashboard/:projectId')
    @Secured()
    async getDashboard(@Param('projectId') projectId: string): Promise<GenericResponse<any>> {
        return this.msFactortService.getForDashboard(projectId);
    }

    @Post('/responsible/assign')
    @Secured()
    public async assignResponsible(@Body() dtos: MSFactorResponsible[]): Promise<GenericResponse<null>> {
        return this.msFactortService.assignResponsible(dtos);
    }

    @Put('/responsible/update')
    @Secured()
    public async updateResponsible(@Body() dto: MSFactorResponsible): Promise<GenericResponse<null>> {
        return this.msFactortService.updateResponsible(dto);
    }

    @Put('/status/update')
    @Secured()
    public async updateFactorStatus(@Body() factorStatusData: MSFactorStatusUpdateDto[], @Req() req: any): Promise<GenericResponse<null>> {
        return this.msFactortService.updateFactorStatus(factorStatusData, req.user.uid);
    }

    @Put('/status/approval')
    @Secured()
    public async updateFactorStatusApproval(@Body() factorStatusData: MSFactorStatusUpdateDto, @Req() req: any): Promise<GenericResponse<null>> {
        return this.msFactortService.updateFactorStatusApproval(factorStatusData, req.user.uid);
    }
}
