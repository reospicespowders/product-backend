import mongoose, { ObjectId, UpdateWriteOpResult } from "mongoose";
import { User } from "../dto/user-type..dto";


/**
 * @export
 * @interface AuthRepository
 */
export interface AuthRepository {
    getByUserEmails(emails: string[]): Promise<User[]>;
    getByUserIds(_id: string[]): Promise<User[]>;
    //Check is user exists
    isUserExist(email: string)
    //generate random passwords
    generatePassword()
    //generate otp
    generateOTP()
    //encrypt the password
    hashPassword(password: string)
    //validate password
    validatePassword(email: string, password: string)
    //find one record with filter and fields
    findOne(filter: Record<string, any>, fields: Array<string>)
    //update user
    updateUser(filter: Record<string, any>, data: any): Promise<UpdateWriteOpResult>
    //create jwt tokens
    createJwtTokens(email: string, id: string)
    //increment login attempts
    incrementLoginAttempts(email: string)
    // find all users
    findAll();
    //find all filtered Users
    findAllFiltered(query: any);
    // find user by ID
    findById(id: string): Promise<User>;
    findByIdWithoutOu(id: string): Promise<User>
    //create user
    create(user: User);
    //Update User
    update(user: any): Promise<UpdateWriteOpResult>;

    addOuInManager(ouId: string, userIds: string[]): Promise<void>;
    //update multiple user records
    updateMany(ids: Array<string>, data: any)
    //get skill training for the user
    getSkillTrainingsForUser(id: any)

    //get skill training for the user
    getTrainingUser(data: any)

    findAllActive(): Promise<User[]>;

    //get skill training for the user
    findManager(data: any);
    getSBCCoordinators(): Promise<any[]>

    getByOus(ous: mongoose.Types.ObjectId[]): Promise<any[]>

    getByOusAll(ous: mongoose.Types.ObjectId[]): Promise<any[]>

    delete(id: string): Promise<UpdateWriteOpResult | null>;

    getAllVendors(): Promise<User[]>;

    getManagersByUsers(userIds: string[]): Promise<any[]>;
    getEmailByIds(ids: string[]): Promise<any>
}