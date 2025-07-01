import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as moment from 'moment';
import 'moment-timezone';
import { GenericResponse } from 'src/domain/dto/generic';
import { Login, UpdateUserDto, User } from 'src/domain/user-auth/dto/user-type..dto';
import { AuthRepository } from 'src/domain/user-auth/interfaces/auth-repository.interface';
import { MailService } from '../mail/mail.service';
import { JsonService } from '../json/json.service';
import { NotificationService } from '../notification/notification.service';
import { Notification } from 'src/domain/notification/dto/notification.dto';
import { NotificationType } from 'src/domain/notification/enums/notification-type.enum';
import { NotificationCategory } from 'src/domain/notification/enums/notification-category.enum';
import { CompanyRepository } from 'src/domain/company/interfaces/company-repository.interface';
import mongoose, { ObjectId } from 'mongoose';
import { TrainingRequestRepository } from 'src/domain/training/interfaces/training-request-repository.interface';
import { CourseRepository } from 'src/domain/course/interfaces/course-repository.interface';
import { MSVendorCompanyRepository } from 'src/domain/mystory-shopper/interfaces/ms-vendor-company-repository.interface';
import * as path from 'path';
import { MailLog } from 'src/domain/mail-logs/dto/mail-log.dto';
import { MailLogRepository } from 'src/domain/mail-logs/interfaces/mail-log-repository.interface';
import { LoginAuditService } from '../login-audit/login-audit.service';
import { OURepository } from 'src/domain/organizational-unit/interfaces/ou-repository.interface';
import { PermissionRequestRepository } from 'src/domain/user-auth/interfaces/permission-request-repository.interface';

//const basePath = process.env.NODE_ENV === 'production'
//    ? path.join('C:/kgate/kgateBeta/dist')
//    : path.join(__dirname);

const basePath = path.join('C:/kgate/kgateBeta/dist');

/**
 * @export
 * @class UserAuthService
 */
@Injectable()
export class UserAuthService {


    /**
     * Creates an instance of UserAuthService.
     * @param {AuthRepository} userRepository
     * @memberof UserAuthService
    */
    constructor(
        @Inject('AuthRepository') private userRepository: AuthRepository,
        @Inject('TrainingRequestRepository') private TrainingRequestRepository: TrainingRequestRepository,
        @Inject('CourseRepository') private CourseRepository: CourseRepository,
        @Inject('CompanyRepository') private CompanyRepository: CompanyRepository,
        @Inject('MSVendorCompanyRepository') private msVendorCompanyRepository: MSVendorCompanyRepository,
        @Inject('MailLogRepository') private mailLogRepository: MailLogRepository,
        @Inject('OURepository') private ouRepository: OURepository,
        @Inject('PermissionRequestRepository') private permissionRequestRepository: PermissionRequestRepository,
        private mailService: MailService,
        private jsonService: JsonService,
        private notificationService: NotificationService,
        private loginAuditService: LoginAuditService
    ) { }

    public async addOuInManager(ouId: string, userIds: string[]) {
        this.userRepository.addOuInManager(ouId, userIds);
    }

    public async getAllVendors() {
        let data: User[] = await this.userRepository.getAllVendors();

        // Generic Response
        const response: GenericResponse<User[]> = {
            success: true,
            message: "Vendors fetched Successfully",
            data: data,
        };

        return response
    }

    public async getByOus(ous: string[]) {
        let ou = ous.map(e => {
            return new mongoose.Types.ObjectId(e);
        })
        let data: User[] = await this.userRepository.getByOus(ou);

        // Generic Response
        const response: GenericResponse<User[]> = {
            success: true,
            message: "Users fetched successfully",
            data: data,
        };

        return response
    }



    public async getUsersFiltered(query: any): Promise<GenericResponse<User[]>> {
        let data: User[] = await this.userRepository.findAllFiltered(query);

        // Generic Response
        const response: GenericResponse<User[]> = {
            success: true,
            message: "Users fetched Successfully",
            data: data,
        };

        return response
    }

    public async getManagersByUsers(userIds: string[]): Promise<GenericResponse<any[]>> {
        let data: any[] = await this.userRepository.getManagersByUsers(userIds);

        // Generic Response
        const response: GenericResponse<User[]> = {
            success: true,
            message: "Managers fetched Successfully",
            data: data,
        };

        return response
    }

    public async update(user: UpdateUserDto): Promise<GenericResponse<null>> {
        let userData: any = await this.userRepository.findById(user._id)
        //remove access token of user
        if (user?.role && user?.role[0] != userData.role._id) {
            user.accessToken = ''
        }
        let res = await this.userRepository.update(user);

        let response: GenericResponse<null> = {
            message: "User not updated",
            success: false,
            data: null,
        }

        if (res.modifiedCount == 1) {
            response = {
                message: "User updated successfully",
                success: true,
                data: null,
            };
        }

        return response;
    }


    public async activateUser(uid: string): Promise<GenericResponse<null>> {

        let userData: User = await this.userRepository.findById(uid);

        if (!userData) {
            return {
                message: "User not found",
                data: null,
                success: false
            }
        }

        const date = moment().tz("Asia/Riyadh").format();

        let newPassword = await this.userRepository.generatePassword();
        let hashPassword = await this.userRepository.hashPassword(newPassword);

        const data = {
            _id: uid,
            approvedAt: moment().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss"),
            active: {
                status: true,
                reason: "NEW ACCOUNT",
                activationDate: date
            },
            password: hashPassword,
            "resetPassword.loginAttempts": 0,
            "resetPassword.status": true,
        };
        let res = await this.userRepository.update(data);

        try {
            let messages = await this.jsonService.parseJson(path.join(basePath, 'domain/json/email-messages/email-messages.json'));
            this.mailService.sendMail({
                subject: messages.activateUser.subject,
                template: 'email',
                context: {
                    email: userData.email,
                    password: newPassword,
                    text: messages.activateUser.text,
                    heading: messages.activateUser.heading,
                }, email: userData.email
            })
        } catch (e) {
            // console.log('EMAIL ERROR', e);
        }

        let response: GenericResponse<null> = {
            message: "User not activated",
            success: false,
            data: null,
        }

        if (res.modifiedCount == 1) {
            response = {
                message: "User activated successfully",
                success: true,
                data: null,
            };
        }
        return response;
    }

    public async activateBlockAccount(email: string): Promise<GenericResponse<null>> {

        const password = await this.userRepository.generateOTP()

        const userData = await this.userRepository.findOne({ email: email }, ['email', '_id'])


        if (!userData) throw new HttpException("User not found", HttpStatus.NOT_FOUND);



        let data = {
            "active.activationCode": password,
            "active.reason": "Due to multiple invalid Password reasons",
            'active.status': false,
            'resetPassword.status': true
        }
        const user = await this.userRepository.updateUser({ email: email }, data);
        if (user.modifiedCount === 0) {
            throw new HttpException("User data not updated", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            email
            this.mailService.sendMail({
                subject: "تم إيقاف حسابك في بوابة المعرفة",
                template: 'accountdeactive',
                context: {
                    email: email,
                    key: password,
                    text: `تم إيقاف حسابك مؤقتًا بسبب المحاولات الخاطئة المتكرّرة لتسجيل الدخول، لتفعيل حسابك اضغط على الرابط أدناه`,
                    heading: "!مرحباً",
                    link: `${process.env.CURRENT_DOMAIN}/account/activate?id=${userData._id}&key=${password}`
                },
                email: email
            })
        } catch (e) {
            // console.log('EMIAL ERROR', e);
        }

        const response: GenericResponse<any> = {
            success: true,
            message: "Activation Mail sent Successfully !",
            data: null,
        };

        return response

    }


    public async activateThroughLink(uid: any): Promise<GenericResponse<null>> {

        const userData = await this.userRepository.findOne({ _id: uid.id }, ['email', '_id', 'active'])


        if (userData.active.activationCode != uid.key) throw new HttpException("Invalid Key", HttpStatus.FORBIDDEN);

        const date = moment().tz("Asia/Riyadh").format();
        const data: any = {
            active: { status: true, activationDate: date, activationCode: null, reason: '' },
            'resetPassword.loginAttempts': 0
        }


        let res = await this.userRepository.update({ _id: uid.id, ...data });

        let response: GenericResponse<null> = {
            message: "User not activated",
            success: false,
            data: null,
        }

        if (res.modifiedCount == 1) {
            response = {
                message: "User activated successfully",
                success: true,
                data: null,
            };
        }
        return response;
    }


    public async getByUserIds(ids: string[]): Promise<User[]> {
        return this.userRepository.getByUserIds(ids);
    }

    public async getByUserEmails(emails: string[]): Promise<User[]> {
        return this.userRepository.getByUserEmails(emails);
    }

    public async deactivateUser(uid: string, reason: string): Promise<GenericResponse<null>> {
        const data: any = {

            status: false,
            reason: reason
        }

        let res = await this.userRepository.update({ _id: uid, active: data });
        let response: GenericResponse<null> = {
            message: "User not deactivated",
            success: false,
            data: null,
        }

        if (res.modifiedCount == 1) {
            response = {
                message: "User deactivated successfully",
                success: true,
                data: null,
            };
        }
        return response;
    }


    public async masterTrainer(uid: string, flag: boolean): Promise<GenericResponse<null>> {


        let res = await this.userRepository.update({ _id: uid, master_trainer: flag });
        let response: GenericResponse<null> = {
            message: "User mater trainer status not changed",
            success: false,
            data: null,
        }

        if (res.modifiedCount == 1) {
            response = {
                message: "User mater trainer status changed successfully",
                success: true,
                data: null,
            };
        }
        return response;
    }


    public async undoDeactivate(uid: string): Promise<GenericResponse<null>> {
        const date = moment().tz("Asia/Riyadh").format();
        const data: any = {
            status: true,
            activationDate: date,
            'resetPassword.loginAttempts': 0
        }

        let res = await this.userRepository.update({ _id: uid, active: data });
        let response: GenericResponse<null> = {
            message: "User not activated",
            success: false,
            data: null,
        }

        if (res.modifiedCount == 1) {
            response = {
                message: "User activated successfully",
                success: true,
                data: null,
            };
        }
        return response;
    }



    /**
     *
     * Signup user
     * @param {User} user
     * @return {*}  {Promise<any>}
     * @memberof UserAuthService
     */
    async create(user: User): Promise<any> {
        //Destructuring email form user Object
        user.email = user.email.toLocaleLowerCase()
        const { email } = user;

        const isVendor = !!user.isVendor;
        const vendorCompanyId = user?.vendorCompanyId?.toString();
        // check user exist

        const userExist = await this.userRepository.isUserExist(email);


        if (userExist && !!user.vendorCompanyId) {
            delete user.active
            delete user.name
            user.isInternalVendor = true;
            if (user.deletedAt != null) {
                user.deletedAt = null;
                let newPassword = await this.userRepository.generatePassword();
                let hashPassword = await this.userRepository.hashPassword(newPassword);
                user.password = hashPassword;

                try {
                    let messages = await this.jsonService.parseJson(path.join(basePath, 'domain/json/email-messages/email-messages.json'));
                    this.mailService.sendMail({
                        subject: messages.newvendor.subject,
                        template: 'email',
                        context: {
                            email: email,
                            password: newPassword,
                            text: messages.newvendor.text,
                            heading: messages.newvendor.heading
                        },
                        email: email
                    })
                } catch (e) {
                    // console.log('EMAIL ERROR', e);
                }
            }
            else {
                try {
                    let messages = await this.jsonService.parseJson(path.join(basePath, 'domain/json/email-messages/email-messages.json'));
                    this.mailService.sendMail({
                        subject: messages.vendor.subject,
                        template: 'vendor',
                        context: {
                            text: messages.vendor.text,
                            heading: messages.vendor.heading
                        },
                        email: email
                    })
                } catch (e) {
                    // console.log('EMAIL ERROR', e);
                }
            }
            await this.userRepository.updateUser({ _id: userExist._id }, user)
            if (isVendor && vendorCompanyId) {
                const vendorCompany = await this.msVendorCompanyRepository.findById(vendorCompanyId);
                // console.log("vendorCompany",vendorCompany);
                if (vendorCompany) {
                    const updatedVendors = [...(vendorCompany.vendors || []), userExist._id];
                    await this.msVendorCompanyRepository.update(vendorCompanyId, {
                        _id: vendorCompanyId.toString(),
                        name: vendorCompany.name,
                        classification: vendorCompany.classification,
                        vendors: updatedVendors,
                    });
                }
            }

            return {
                success: true,
                message: "User Registered Successfully kindly Check Your Mail to get your credentials",
                data: null,
            };
        }

        if (userExist && !(!!user.vendorCompanyId)) {
            throw new BadRequestException("User Already Exists");
        }


        let newPassword = await this.userRepository.generatePassword();
        let hashPassword = await this.userRepository.hashPassword(newPassword);

        //Saving Object as Data
        const data: User = user;

        data.password = hashPassword;

        // Setting initials for reset Password
        data.resetPassword = {
            status: true,
            loginAttempts: 0,
            lastPasswordReset: null
        }

        // Setting initials for browser
        data.browsers = {
            code: null,
            list: []
        }

        //adding same approvedAt da
        data.approvedAt = moment().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss");


        data.active = {
            status: true,
            reason: "NEW ACCOUNT",
            activationDate: new Date().toLocaleString(),
            activationCode: ''
        }

        //creating user record
        let createdUser = await this.createUser(data);
        if (isVendor && vendorCompanyId) {
            const vendorCompany = await this.msVendorCompanyRepository.findById(vendorCompanyId);
            // console.log("vendorCompany",vendorCompany);
            if (vendorCompany) {
                const updatedVendors = [...(vendorCompany.vendors || []), createdUser.data._id];
                await this.msVendorCompanyRepository.update(vendorCompanyId, {
                    _id: vendorCompanyId.toString(),
                    name: vendorCompany.name,
                    classification: vendorCompany.classification,
                    vendors: updatedVendors,
                });
            }
        }

        //assigning new branch courses if any
        this.assigNewBranchCourses(createdUser.data._id, email)


        //handling external trainers
        if (createdUser.data.externalUser.status == true && createdUser.data.externalUser.company
            && createdUser.data.externalUser.role == 'trainer') {
            let pushUser = await this.CompanyRepository
                .insertTrainer(createdUser.data.externalUser.company, createdUser.data._id);
        }

        try {
            let messages = await this.jsonService.parseJson(path.join(basePath, 'domain/json/email-messages/email-messages.json'));
            // email handler 
            this.mailService.sendMail({
                subject: (isVendor) ? messages.newvendor.subject : messages.signup.subject,
                template: 'email',
                context: {
                    email: email,
                    password: newPassword,
                    text: (isVendor) ? messages.newvendor.text : messages.signup.text,
                    heading: (isVendor) ? messages.newvendor.heading : messages.signup.heading
                },
                email: email
            })
        } catch (e) {
            // console.log('EMAIL ERROR', e);
        }

        // Generic Response
        const response: GenericResponse<null> = {
            success: true,
            message: "User Registered Successfully kindly Check Your Mail to get your credentials",
            data: null,
        };

        return response
    }

    async updatePassword(oldPassword: string, newPassword: string, uid: any) {
        let pass = await this.userRepository.hashPassword(newPassword);
        let user: User = await this.userRepository.findById(uid);
        if (user.resetPassword.status == false) {
            let validated = await this.userRepository.validatePassword(user.email, oldPassword);
            if (!validated) {
                return {
                    message: "Old password not correct",
                    success: false,
                    data: null
                }
            }
        }
        user.resetPassword.status = false;
        user.resetPassword.lastPasswordReset = new Date().toDateString();
        user.resetPassword.loginAttempts = user.resetPassword.loginAttempts + 1;
        user.password = pass;
        let data = await this.userRepository.updateUser({ _id: uid }, user)
        let res: GenericResponse<null> = {
            message: "Password not updated",
            success: false,
            data: null
        }
        if (data.modifiedCount > 0) {
            res = {
                message: "User Registered Successfully kindly Check Your Mail to get your credentials",
                success: true,
                data: null
            };
        }
        return res;
    }




    public async assigNewBranchCourses(id: ObjectId, email: string) {
        let courses = await this.TrainingRequestRepository.getNewBranchTrainings({ unregisteredUsers: { $in: [email] } }, { trainingId: 1, _id: 0 })
        if (courses.length <= 0) return
        courses.map(async (item: any) => {
            await this.CourseRepository.addNewBranchUser({ _id: item.trainingId, newAttendee: id })
        })
    }

    public async signUp(user: User): Promise<GenericResponse<User>> {
        //Destructuring email form user Object
        user.email = user.email.toLocaleLowerCase()

        const { email } = user;
        // check user exist
        const userExist = await this.userRepository.isUserExist(email);
        if (userExist) {
            throw new BadRequestException('User Already Exist');
        }

        //Saving Object as Data
        const data: User = user;

        //Saving reset Password Initials
        data.resetPassword = {
            status: true,
            loginAttempts: 0,
            lastPasswordReset: null
        }

        data.active = {
            status: false,
            reason: "NEW ACCOUNT",
            activationDate: new Date().toLocaleString(),
            activationCode: ''
        }

        //Saving Browser Initials
        data.browsers = {
            code: null,
            list: []
        }
        //creating user record
        let userData = await this.createUser(data)


        this.assigNewBranchCourses(userData.data._id, email)


        try {
            let messages = await this.jsonService.parseJson(path.join(basePath, 'domain/json/email-messages/email-messages.json'));
            email
            this.mailService.sendMail({
                subject: messages.createUser.subject,
                template: "welcome",
                context: {
                    email: email,
                    // password: password,
                    text: messages.createUser.text,
                    heading: messages.createUser.heading,
                },
                email: email
            });
        } catch (e) {
            // console.log('ERROR', e);
        }

        const notification: Notification = {
            type: NotificationType.USER_REGISTER,
            receiver: [],
            sender: userData.data._id,
            seenBy: [],
            category: NotificationCategory.USER_EVENTS,

        }
        this.notificationService.create(notification);

        // Generic Response
        const response: GenericResponse<User> = {
            success: true,
            message: "User Registered Successfully we will send you a mail after the approval",
            data: data,
        };

        return response
    }

    // /**
    //  *
    //  * Register User
    //  * @param {User} user
    //  * @return {*}  {Promise<any>}
    //  * @memberof UserAuthService
    //  */
    // async register(user: User): Promise<any> {

    //     //Destructuring email form user Object
    //     const { email } = user;

    //     // check user exist
    //     const userExist = await this.userRepository.isUserExist(email);
    //     if (userExist) {
    //         throw new BadRequestException('User Already Exist');
    //     }

    //     //Saving Object as Data
    //     const data: User = user;

    //     //generating random password
    //     const password = await this.userRepository.generatePassword()


    //     //hash password
    //     const hashPassword = await this.userRepository.hashPassword(password)
    //     if (!hashPassword) {
    //         throw new Error("Password not hashed");
    //     }

    //     // Saving Hash Passwords 
    //     data.password = hashPassword

    //     //Saving reset Password Initials
    //     data.resetPassword = {
    //         status: true,
    //         loginAttempts: 0,
    //         lastPasswordReset: null
    //     }

    //     //Saving Browser Initials
    //     data.browsers = {
    //         code: null,
    //         list: []
    //     }
    //     //creating user record
    //     this.createUser(data)

    //     //email
    //     const messages = await this.jsonService.parseJson('email-messages/email-messages.json')
    //     this.mailService.sendMail({
    //         subject: messages.createUser.subject,
    //         template: "welcome",
    //         context: {
    //             email: email,
    //             // password: password,
    //             text: messages.createUser.text,
    //             heading: messages.createUser.heading,
    //         },
    //         email: email
    //     })

    //     // Generic Response
    //     const response: GenericResponse<User> = {
    //         success: true,
    //         message: "User Registered Successfully kindly Check Your Mail to get your credentials",
    //         data: data,
    //     };

    //     return response

    // }


    /**
     *
     *  Login User
     * @param {Login} login
     * @param {*} userAgent
     * @return {*}  {Promise<any>}
     * @memberof UserAuthService
     */
    async login(login: Login, userAgent: any): Promise<any> {



        login.email = login.email.toLocaleLowerCase()

        const { email, password, otp } = login;

        // check user exist
        const userExist = await this.userRepository.isUserExist(email);
        if (!userExist) {
            throw new BadRequestException("User Doesn't Exist");
        }

        //validating the password
        const isPasswordValid = await this.userRepository.validatePassword(email, password);

        //Fetching the user Data
        let fields = ["_id", "role", "name", "active", "resetPassword", "ministries", "browsers", "email", "phone", "gender", "national_id", "image", "managerOus", "externalUser", "isVendor", "vendorExtraDetails", "ou", "master_trainer","permissionRequests", "createdAt"]

        console.warn("1st step")

        const uid: any = await this.userRepository.findOne({ email: email }, fields);
        if (!uid) {
            throw new Error("User Data Not Received");
        }


        if (!uid.active.status && uid.active.reason == 'Due to multiple invalid Password reasons') {
            throw new UnauthorizedException("Due to multiple invalid Password reasons account blocked");
        }

        if (!uid.active.status) {
            throw new UnauthorizedException("User not activated, please contact administrator");
        }

        // Ensure `resetPassword` exists and is an object
        if (!uid.resetPassword || typeof uid.resetPassword !== 'object') {
            uid.resetPassword = { loginAttempts: 0, status: false }; // Default structure
        }

        console.warn("THIS HAS STARted", uid)

        //Handling Invalid Password 
        if (!isPasswordValid) {

            //If login Attempts are equal to 10

            if (uid.resetPassword.loginAttempts > 8) {

                const password = await this.userRepository.generateOTP()

                let data = {
                    "active.activationCode": password,
                    "active.reason": "Due to multiple invalid Password reasons",
                    'active.status': false,
                    'resetPassword.status': true
                }
                const user = await this.userRepository.updateUser({ email: email }, data);
                if (user.modifiedCount === 0) {
                    throw new HttpException("User data not updated", HttpStatus.INTERNAL_SERVER_ERROR);
                }

                try {
                    //email
                    this.mailService.sendMail({
                        subject: "تم إيقاف حسابك في بوابة المعرفة",
                        template: 'accountdeactive',
                        context: {
                            email: email,
                            key: password,
                            text: `تم إيقاف حسابك مؤقتًا بسبب المحاولات الخاطئة المتكرّرة لتسجيل الدخول، لتفعيل حسابك اضغط على الرابط أدناه`,
                            heading: "!مرحباً",
                            link: `${process.env.CURRENT_DOMAIN}/account/activate?id=${uid._id}&key=${password}`
                        },
                        email: email
                    })
                } catch (e) {
                    // console.log('EMIAL ERROR', e);
                }
            }
            else {
                //If not validate password update password Count
                const updateCount = await this.userRepository.incrementLoginAttempts(email);
                if (!updateCount) {
                    throw new Error("User data not updated")
                }
            }

            throw new UnauthorizedException("البريد الإلكتروني أو كلمة السر خاطئة", "INVALID_CREDENTIALS");
        }

        //creating JWT Token
        const tokens = await this.userRepository.createJwtTokens(email, uid._id);
        const data: any = {
            accessToken: tokens.accessToken,
            "resetPassword.loginAttempts": 0,
            lastLogin: new Date(),
        };

        if (!uid.browsers.list.includes(userAgent)) {
            //If OTP
            if (otp) {
                uid.browsers.list.push(userAgent)
                if (uid.browsers.code == otp) {
                    data.browsers = {
                        code: null,
                        list: uid.browsers.list
                    }
                } else throw new BadRequestException("Invalid OTP");
            }
            else if (!otp || otp == null) {
                //generating new OTP
                const OTP = await this.userRepository.generateOTP()
                //creating browser object to update the record
                data.browsers = {
                    code: OTP,
                    list: uid.browsers.list
                }

                try {
                    // email
                    this.mailService.sendMail({
                        subject: "استخدم كلمة المرور الصالحة لمرة واحدة (OTP) لتسجيل الدخول",
                        template: 'browserotp',
                        context: {
                            email: email,
                            key: OTP,
                            text: 'لقد قمت بتسجيل الدخول من متصفح جديد، يرجى استخدام كلمة المرور الصالحة لمرة واحدة (OTP) لتسجيل الدخول',
                            heading: "!مرحباً",
                        },
                        email: email
                    })
                } catch (e) {
                    // console.log('EMAIL ERROR', e);
                }

                delete data.accessToken
                delete data.loginAttempts
                //updating user data
                const isUpdated = await this.userRepository.updateUser({ email: email }, data);
                if (isUpdated.modifiedCount === 0) {
                    throw new HttpException("User not updated", HttpStatus.INTERNAL_SERVER_ERROR);
                }
                throw new NotAcceptableException("New Browser Detected");
            }
        }

        //update access token
        const isUpdated = await this.userRepository.updateUser({ email: email }, data);
        if (isUpdated.modifiedCount === 0) {
            throw new HttpException("Failed to update user", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await this.loginAuditService.createAudit(uid._id);

        //Getting Theme
        let ous = uid.ou.map(ou => ou._id);

        let theme = await this.ouRepository.getUserTheme(ous);
        let themeDefault = await this.ouRepository.getDefaultTheme()
         
        if(!theme || theme?.length <= 0 ) {
            theme = themeDefault.theme
        } else {
            theme = theme[0].theme.values
        }


        //check is it a test creator
        let isTester= await this.permissionRequestRepository.checkIsTester(email);
       
        //constructing login response
        const response: GenericResponse<any> = {
            success: true,
            message: "Login Successfully",
            data: {
                ...tokens,
                success: true,
                message: "Login Successfully",
                role: uid.role,
                username: uid.name,
                resetPassword: uid.resetPassword,
                id: uid._id,
                ministries: uid.ministries,
                image: uid.image,
                email: uid.email,
                phone: uid.phone,
                gender: uid.gender,
                national_id: uid.national_id,
                managerOus: uid.managerOus,
                externalUser: uid.externalUser,
                isVendor: uid.isVendor,
                vendorExtraDetails: uid.vendorExtraDetails,
                ou: uid.ou,
                master_trainer: uid.master_trainer,
                createdAt: uid.createdAt,
                approvedAt: uid.approvedAt,
                favoriteData: uid.favoriteData,
                theme:theme,
                permissionRequests:uid.permissionRequests,
                isTester : isTester,
                themeDefault : themeDefault.theme
            },
        };

        return response;

    }


    async getDefaultUser(): Promise<any> {
        try {


            //Fetching the user Data
            let fields = ["_id", "role", "name", "email", "image", "ou", "createdAt"]
            const uid = await this.userRepository.findOne({ email: 'default@gmail.com' }, fields);
            if (!uid) {
                throw new Error("User Data Not Received");
            }

            //constructing login response
            const response: GenericResponse<any> = {
                success: true,
                message: "Details Fetched Successfully !!",
                data: {
                    role: uid.role,
                    username: uid.name,
                    id: uid._id,
                    image: uid.image,
                    email: uid.email,
                    ou: uid.ou,
                    createdAt: uid.createdAt
                },
            };

            return response


        } catch (error) {
            // console.log(error)
        }
    }

    async findManager(data: any): Promise<any> {

        let res = await this.userRepository.findManager(data)


        // Generic Response
        const response: GenericResponse<User[]> = {
            success: true,
            message: "Managers count",
            data: res,
        };

        return response
    }


    async sendEmailToTrainer(data: any): Promise<any> {

        this.mailService.sendMail({
            subject: "إعادة تعيين كلمة المرور",
            template: "sessionCreate",
            context: {
                assDate: data.date,
                text: `لقد وصلك هذا البريد الإلكتروني لأنك طلبت إعادة تعيين كلمة المرورالخاصة بك،
                أدناه معلومات تسجيل الدخول:
                `,
                assTime: data.start_time,  //end time
                heading: "! مرحباً",
                assTitle: data.title
            },
            email: data.email
        });


        // Generic Response
        const response: GenericResponse<User[]> = {
            success: true,
            message: "Email created",
            data: data,
        };

        return response
    }

    /**
     *
     * Get all users
     * @return {*}  {Promise<User[]>}
     * @memberof UserAuthService
     */
    async getActiveUsers(page, offset): Promise<any> {
        let data: User[] = await this.userRepository.findAllActive();

        // Generic Response
        const response: GenericResponse<User[]> = {
            success: true,
            message: "Users fetched Successfully",
            data: data,
        };

        return response
    }

    /**
     *
     * Get all users
     * @return {*}  {Promise<User[]>}
     * @memberof UserAuthService
     */
    async getUsers(page, offset): Promise<any> {
        let data: User[] = await this.userRepository.findAll();

        // Generic Response
        const response: GenericResponse<User[]> = {
            success: true,
            message: "Users fetched Successfully",
            data: data,
        };

        return response
    }


    /**
     *
     *  get user by ID
     * @param {string} id
     * @return {*}  {Promise<User>}
     * @memberof UserAuthService
     */
    async getUserById(id: string): Promise<any> {

        let data: User = await this.userRepository.findById(id);

        // Generic Response
        const response: GenericResponse<User> = {
            success: true,
            message: "User data fetched Successfully",
            data: data,
        };

        return response
    }

    public async updateProfile(url: string, uid: string) {
        //update accesstoken
        const isUpdated = await this.userRepository.updateUser(
            { _id: uid },
            { image: url }
        );
        if (isUpdated.modifiedCount === 0) {
            throw new HttpException("Failed to update profile", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     *
     * Create user
     * @param {User} user
     * @return {*}  {Promise<User>}
     * @memberof UserAuthService
     */
    async createUser(user: User): Promise<GenericResponse<any>> {

        let data: any = await this.userRepository.create(user);

        // Generic Response
        const response: GenericResponse<any> = {
            success: true,
            message: "User created Successfully",
            data: data,
        };

        return response
    }


    public async forgotPassword(email: string): Promise<GenericResponse<null>> {

        //validating the email
        const userExist = await this.userRepository.isUserExist(email);
        if (!userExist) {
            throw new HttpException("User Not Found", HttpStatus.NOT_FOUND);
        }

        //generating random password
        const password = await this.userRepository.generatePassword();
        if (!password) {
            throw new HttpException("Partial Service Outage", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // hash password
        const hashPassword = await this.userRepository.hashPassword(password);
        if (!hashPassword) {
            throw new HttpException("Partial Service Outage", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const data = {
            password: hashPassword,
            "resetPassword.status": true
        }

        //update query
        const isUpdated = await this.userRepository.updateUser(
            { email: email },
            data
        );
        if (isUpdated.modifiedCount == 0) {
            throw new HttpException("Service Unavailable", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            this.mailService.sendMail({
                subject: "إعادة تعيين كلمة المرور",
                template: "email",
                context: {
                    email: email,
                    password: password,
                    text: `لقد وصلك هذا البريد الإلكتروني لأنك طلبت إعادة تعيين كلمة المرورالخاصة بك،
                    أدناه معلومات تسجيل الدخول:
                    `,
                    heading: "! مرحباً",
                },
                email: email
            });
        } catch (e) {
            let mailLog: MailLog = {
                status: 'ERROR',
                error: e,
                meta: {
                    email, context: {
                        email: email,
                        password: password,
                        text: `لقد وصلك هذا البريد الإلكتروني لأنك طلبت إعادة تعيين كلمة المرورالخاصة بك،
                                    أدناه معلومات تسجيل الدخول:
                                    `,
                        heading: "! مرحباً",
                    }, subject: "إعادة تعيين كلمة المرور", template: "email"
                }
            }
            // console.log(e);
            this.mailLogRepository.create(mailLog);
        }
        const res: GenericResponse<null> = {
            message: "يرجى التحقق من بريدك الإلكتروني للحصول على كلمة مرور جديدة",
            success: true,
            data: null
        }
        return res;
    }

    public async addTrainer(trainer: Array<string>): Promise<GenericResponse<any>> {
        let data = {
            "externalUser.role": "trainer"
        }
        let res: any = await this.userRepository.updateMany(trainer, data);
        // Generic Response
        const response: GenericResponse<any> = {
            success: true,
            message: "Trainers Created",
            data: res,
        };

        return response
    }

    public async getSkillTrainingsOfUser(id: string): Promise<GenericResponse<any>> {

        let res: any = await this.userRepository.getSkillTrainingsForUser(id);
        // Generic Response
        const response: GenericResponse<any> = {
            success: true,
            message: "Trainers Created",
            data: res,
        };

        return response
    }


    public async getTrainingUser(id: any): Promise<GenericResponse<any>> {

        let res: any = await this.userRepository.getTrainingUser(id);
        // Generic Response
        const response: GenericResponse<any> = {
            success: true,
            message: "Trainees fetched successfully",
            data: res,
        };

        return response
    }

    async delete(id: string): Promise<GenericResponse<any>> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const deletedUser = await this.userRepository.delete(id);
        if (!deletedUser) {
            throw new NotFoundException('User not found');
        }

        return {
            success: true,
            message: 'User deleted successfully.',
            data: ''
        };
    }
}
