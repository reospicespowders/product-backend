import { Body, Controller, Get, Param, Post, Delete, UsePipes, Req, Query, Request, Put, HttpException, HttpStatus } from '@nestjs/common';
import { Login, UpdateUserDto, User } from 'src/domain/user-auth/dto/user-type..dto';
import { JoiValidationPipe } from '../../pipes/joi-validation.pipe';
import { registerUser, userSignup, validateLoginSchema } from './user-validations';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAuthService } from 'src/usecase/services/user-auth/user-auth.service';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { GenericResponse } from 'src/domain/dto/generic';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';
import { getValidator } from '../data/data.validations';

/**
 * @export
 * @class UserAuthController
 */
@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
export class UserAuthController {

    /**
     * Creates an instance of UserAuthController.
     * @param {UserAuthService} userService
     * @memberof UserAuthController
     */
    constructor(private userService: UserAuthService) { }


    /**
     *
     * Signup User
     * @param {User} user
     * @return {*}  {Promise<any>}
     * @memberof UserAuthController
     */
    @Post('/register')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(userSignup)) //validating the object
    SigunUp(@Body() user: User): Promise<GenericResponse<any>> {
        return this.userService.signUp(user)
    }

    @Put('/update-password')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async updatePassword(@Body() body: { oldPassword: string, password: string }, @Request() req: any) {
        return this.userService.updatePassword(body.oldPassword, body.password, req.user.uid);
    }


    @Put('/make-manager')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    public async addOuInManager(@Body() body: any) {
        return this.userService.addOuInManager(body.ouId, body.userIds);
    }


    /**
     *
     * create User From inside the portal
     * @param {User} user
     * @return {*}  {Promise<any>}
     * @memberof UserAuthController
     */
    @Post('/create')
    @Secured()
    @UsePipes(new JoiValidationPipe(registerUser)) //validating the object
    register(@Body() user: User): Promise<GenericResponse<any>> {
        return this.userService.create(user)
    }


    /**
     *
     * Login to the system
     * @param {Login} login
     * @param {Request} request
     * @return {*} 
     * @memberof UserAuthController
     */
    @Post('/login')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(validateLoginSchema)) //validating the object
    login(@Body() login: Login, @Req() request: Request): Promise<GenericResponse<any>> {
        return this.userService.login(login, request.headers['user-agent'])
    }

    /**
     *
     * Login to the system
     * @param {Any} getDefaultUser
     * @return {*} 
     * @memberof UserAuthController
     */
    @Get('/get-default-user')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(validateLoginSchema)) //validating the object
    getDefaultUser(): Promise<GenericResponse<any>> {
        return this.userService.getDefaultUser()
    }

    @Post('/ous')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    getByOus(@Body() ous: { data: string[] }): Promise<GenericResponse<User[]>> {
        return this.userService.getByOus(ous.data);
    }

    @Post('forgot-password')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async forgotPassword(@Body('email') email: string): Promise<GenericResponse<null>> {
        return this.userService.forgotPassword(email);
    }

    @Put('')
    @Secured()
    public async update(@Body() user: UpdateUserDto): Promise<GenericResponse<null>> {
        return this.userService.update(user);
    }

    @Put('/missing')
    @Secured()
    public async updateMissing(@Body() user: UpdateUserDto, @Req() req: any): Promise<GenericResponse<null>> {
        if (req.user.uid == user._id) {
            user.externalUser['imported'] = false
            return this.userService.update(user);
        } else {
            throw new HttpException('Forbidden: User not the same', HttpStatus.FORBIDDEN);
        }

    }


    /**
     *
     * Get All users
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<User[]>>}
     * @memberof UserAuthController
     */
    @Get('/')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured()
    getActiveUsers(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<User[]>> {
        return this.userService.getActiveUsers(page, offset);
    }

    /**
     *
     * Get All users
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<User[]>>}
     * @memberof UserAuthController
     */
    @Get('/all')
    @UsePipes(new JoiValidationPipe(getValidator))
    @Secured('USER_MANAGEMENT', 'r')
    getUsers(@Query('offset') offset: number, @Query('page') page: number): Promise<GenericResponse<User[]>> {
        return this.userService.getUsers(page, offset);
    }

    @Get('/vendors')
    @Secured()
    getAllVendors() {
        return this.userService.getAllVendors();
    }

    /**
     *
     * Get All users
     * @param {number} offset
     * @param {number} page
     * @return {*}  {Promise<GenericResponse<User[]>>}
     * @memberof UserAuthController
     */
    @Post('/get')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    getUsersFiltered(@Body() query: any): Promise<GenericResponse<User[]>> {
        return this.userService.getUsersFiltered(query);
    }


    /**
     *Get all managers by users
     *
     * @param {{ userIds: string[] }} data
     * @return {*}  {Promise<GenericResponse<any[]>>}
     * @memberof UserAuthController
     */
    @Post('/user-managers')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getManagersByUsers(@Body() data: { userIds: string[] }): Promise<GenericResponse<any[]>> {
        return this.userService.getManagersByUsers(data.userIds);
    }

    /**
     *
     * Get User by ID
     * @param {string} id
     * @return {*}  {Promise<User>}
     * @memberof UserAuthController
     */
    @Get('/:id')
    @UsePipes(new JoiValidationPipe(getValidator))
    getUserById(@Param('id') id: string): Promise<GenericResponse<User>> {
        return this.userService.getUserById(id);
    }

    @Put('/activate/:id')
    @Secured('USER_MANAGEMENT', 'u')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async activateUser(@Param('id') id: string): Promise<GenericResponse<null>> {
        return this.userService.activateUser(id);
    }

    @Put('/activate-account-mail/:email')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async activateBlockAccount(@Param('email') email: string): Promise<GenericResponse<null>> {
        return this.userService.activateBlockAccount(email);
    }

    @Put('/activate-account-link')
    @OpenRoute()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async AcctivateUsingLink(@Body() data: string): Promise<GenericResponse<null>> {
        return this.userService.activateThroughLink(data);
    }


    @Put('/deactivate')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async deactivateUser(@Body() { _id, reason }): Promise<GenericResponse<null>> {
        return this.userService.deactivateUser(_id, reason);
    }



    @Put('/undo/deactivate/:id')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async undoDeactivate(@Param('id') id: string): Promise<GenericResponse<null>> {
        return this.userService.undoDeactivate(id);
    }

    @Put('/master_trainer')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async masterTrainer(@Body() { _id, flag }): Promise<GenericResponse<null>> {
        return this.userService.masterTrainer(_id, flag);
    }

    @Put('/add-trainer')
    @Secured('TRAINER', 'c')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async addTrainer(@Body() trainers: Array<string>): Promise<GenericResponse<null>> {
        return this.userService.addTrainer(trainers);
    }

    @Post('/skill-trainings/')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getSkillTrainingsOfUser(@Body() data: any): Promise<GenericResponse<any>> {
        return this.userService.getSkillTrainingsOfUser(data);
    }

    @Post('/training-users/')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async getTrainingUser(@Body() data: any): Promise<GenericResponse<any>> {
        return this.userService.getTrainingUser(data);
    }

    @Post('/send-session-mail-to-trainer')
    @Secured()
    @UsePipes(new JoiValidationPipe(getValidator))
    public async sendEmailToTrainer(@Body() data: any): Promise<GenericResponse<any>> {
        return this.userService.sendEmailToTrainer(data);
    }

    @OpenRoute()
    @Post('/findManager')
    @UsePipes(new JoiValidationPipe(getValidator))
    public async findManager(@Body() data: any): Promise<GenericResponse<any>> {
        return this.userService.findManager(data);
    }

    @Delete('/delete/:id')
    @Secured('USER_MANAGEMENT', 'd')
    async delete(@Param('id') id: string): Promise<GenericResponse<null>> {
        return this.userService.delete(id);
    }

}

