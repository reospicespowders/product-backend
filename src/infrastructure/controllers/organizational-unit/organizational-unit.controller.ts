import { Controller, Get, Post, Put, Delete, Body, Param, Request, UsePipes, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/domain/dto/generic';
import { OrganizationalUnit, UpdateOUDto } from 'src/domain/organizational-unit/dto/organizational-unit.dto';
import { GetParent, SearchRequest } from 'src/domain/organizational-unit/dto/search.dto';
import { createOuValidation, updateOuValidation } from 'src/domain/organizational-unit/validation/ou-validation.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { JoiValidationPipe } from 'src/infrastructure/pipes/joi-validation.pipe';
import { OrganizationalUnitService } from 'src/usecase/services/organizational-unit/organizational-unit.service';
import { getValidator } from '../data/data.validations';

/**
 * @export
 * @class OrganizationalUnitController
 */
@Controller('ou')
@ApiTags('Organizational Unit')
@ApiBearerAuth()
export class OrganizationalUnitController {

    /**
     * Creates an instance of OrganizationalUnitController.
     * @param {OrganizationalUnitService} ouService
     * @memberof OrganizationalUnitController
     */
    constructor(private ouService: OrganizationalUnitService) { }


    @Post('search-category')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async searchCategory(@Body() searchRequest: SearchRequest, @Request() req: any, @Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<OrganizationalUnit[]>> {
        if (!searchRequest.id) {
            return this.ouService.searchCategory(searchRequest.keyword, req.user.uid, page, offset);
        }
        return this.ouService.searchCategory(searchRequest.keyword, req.user.uid, Number(searchRequest.id), page, offset);
    }


    @Get('search-history')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getSearchHistory(@Request() req: any, @Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<string[]>> {
        return this.ouService.getSearchHistory(req.user.uid, page, offset);
    }

    @Get('byId')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getById(@Query('id') id: number): Promise<GenericResponse<OrganizationalUnit[]>> {
        return this.ouService.getById(id);
    }

    @Get('parent')
    @UsePipes(new JoiValidationPipe(getValidator))
    @OpenRoute()
    public async getParent(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<OrganizationalUnit[]>> {
        return this.ouService.getWithoutParent(page, offset);
    }


    /**
     * Get all organizational units
     * @return {*}  {Promise<OrganizationalUnit[]>}
     * @memberof OrganizationalUnitController
     */
    @Get('')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getAll(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<OrganizationalUnit[]>> {
        return this.ouService.getAll(page, offset);
    }

    /**
     *
     *
     * @return {*} 
     * @memberof OrganizationalUnitController
     */
    @Get('ouChilds')
    @UsePipes(new JoiValidationPipe(getValidator))
    @OpenRoute()
    public async getWithChildren(@Query('offset') offset: number, @Query('page') page: number, @Query('removeInactive') removeInactive: boolean) {

        if (removeInactive) {
            return this.ouService.getWithChildren(page, offset, removeInactive);
        }
        return this.ouService.getWithChildren(page, offset);
    }

    /**
     *
     *
     * @param {*} query
     * @return {*} 
     * @memberof OrganizationalUnitController
     */
    @Post('getwithgraph')
    @UsePipes(new JoiValidationPipe(getValidator))
    @OpenRoute()
    public async getwithgraph(@Body() query: any, @Query('offset') offset: number, @Query('page') page: number) {
        return this.ouService.getWithGraph(query, page, offset);
    }

    /**
     *
     *
     * @param {GetParent} query
     * @return {*} 
     * @memberof OrganizationalUnitController
     */
    @Post('getParentID')
    @UsePipes(new JoiValidationPipe(getValidator))
    @OpenRoute()
    public async getParentID(@Body() query: GetParent) {
        return this.ouService.getParentID(query);
    }
    /**
     *
     * Create Organizational Unit
     * @param {OrganizationalUnit} ou
     * @return {Promise<GenericResponse<OrganizationalUnit>>}
     * @memberof OrganizationalUnitController
     */
    @Post('')
    @Secured('OU', 'c')
    @UsePipes(new JoiValidationPipe(createOuValidation))
    public async createOU(@Body() ou: OrganizationalUnit): Promise<GenericResponse<OrganizationalUnit>> {
        return this.ouService.create(ou);
    }

    /**
     *
     *
     * @param {Array<OrganizationalUnit>} data
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof OrganizationalUnitController
     */
    @Post('/bulk')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured('OU', 'c')
    public async bulk(@Body() data: Array<OrganizationalUnit>): Promise<GenericResponse<any>> {
        return this.ouService.insertMany(data);
    }

    @Get('/category/filter/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getByCategoryId(@Param('id') id: number): Promise<GenericResponse<any>> {
        return this.ouService.getByCategoryId(id);
    }


    @Post('/with/parent/child')
    @UsePipes(new JoiValidationPipe(getValidator))
    @OpenRoute()
    public async getParentAndChildOuIds(@Body() data: { ous: string[] }): Promise<GenericResponse<any>> {
        return this.ouService.getParentAndChildOuIds(data.ous);
    }

    /**
     *
     * Delete Organizational Units
     * @param {string} _id
     * @return {*}  {Promise<OrganizationalUnit>}
     * @memberof OrganizationalUnitController
     */
    @Delete('/:id')
    @Secured('OU', 'd')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async deleteOU(@Param('id') _id: string): Promise<GenericResponse<OrganizationalUnit>> {
        // Handle the case where _id is null or undefined
        if (!_id) {
            throw new Error("Id not defined");
        }
        return this.ouService.delete(_id);
    }


    /**
     *
     * Update Organizational Unit
     * @param {UpdateOUDto} updateOUDto
     * @return {*}  {Promise<OrganizationalUnit>}
     * @memberof OrganizationalUnitController
     */
    @Put('')
    @Secured('OU', 'u')
    @UsePipes(new JoiValidationPipe(updateOuValidation))
    public async updateOU(@Body() updateOUDto: UpdateOUDto): Promise<GenericResponse<any>> {
        return this.ouService.update(updateOUDto);
    }


    /**
     *Clean and structure organizational unit data
     *
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof OrganizationalUnitController
     */
    @Get('/clean')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async clean(): Promise<GenericResponse<any>> {
        return this.ouService.clean();
    }

    /**
     * Get Data From OUID
     *
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof OrganizationalUnitController
     */
    @Get('/getDataFromOuId')
    @Secured()
    public async getDataFromOuId(@Query('id') id: number): Promise<GenericResponse<any>> {

        // console.log("FROM FUNCTION")
        return this.ouService.getDataFromOuId(id);
    }


    @Post('/getDataFromOuId')
    @Secured()
    public async getDataFromOuIdSignFilterred(@Query('id') id: number, @Body() data: { signedArray?: string[], unsignedArray?: string[] }): Promise<GenericResponse<any>> {

        // console.log("FROM FUNCTION")
        return this.ouService.getDataFromOuId(id, data.signedArray, data.unsignedArray);
    }



    /**
     * Get Data From OUID
     *
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof OrganizationalUnitController
     */
    @Get('/getByOuId')
    @Secured()
    public async getByOuId(@Query('id') id: string): Promise<GenericResponse<any>> {

        // console.log("FROM FUNCTION")
        return this.ouService.getByOuId(id);
    }

    @Get('/city')
    @Secured()
    public async getBranchCity(@Query('ids') ids: string[]): Promise<GenericResponse<any>> {
        return this.ouService.getBranchCity(ids);
    }

    /**
     * Get OU Manager
     * 
     * @param {string} id - The OU ID
     * @return {Promise<GenericResponse<any>>} The OU manager details
     * @memberof OrganizationalUnitController
     */
    @Get('/manager')
    @Secured()
    public async getOuManager(@Query('id') id: string): Promise<GenericResponse<any>> {
        return this.ouService.getOuManager(id);
    }

    @Get('/theme')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async getThemeById(@Query('id') id: string): Promise<GenericResponse<OrganizationalUnit[]>> {
        return this.ouService.getThemeById(id);
    }

    @Post('/save-default-theme')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async saveDefaultTheme(@Body() data: string, @Request() req: any): Promise<GenericResponse<OrganizationalUnit[]>> {
        return this.ouService.saveDefaultTheme(data, req);
    }

    @Get('/get-default-theme')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async defaultTheme(@Query('id') id: string): Promise<GenericResponse<any>> {
        return this.ouService.geteDefaultTheme();
    }

}
