import { Model, UpdateWriteOpResult } from "mongoose";
import { Role, UpdateRoleDto } from "../dto/role.dto";
import { RoleRepository } from "../interfaces/role.repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";


/**
 *Role Repository implementation
 *
 * @export
 * @class RoleRepositoryImpl
 * @implements {RoleRepository}
 */
@Injectable()
export class RoleRepositoryImpl implements RoleRepository {


    /**
     * Creates an instance of RoleRepositoryImpl.
     * @param {Model<Role>} roleModel
     * @memberof RoleRepositoryImpl
     */
    constructor(@InjectModel('Role') private readonly roleModel: Model<Role>) { }


    /**
     *Create new role
     *
     * @param {Role} role
     * @return {*}  {Promise<Role>}
     * @memberof RoleRepositoryImpl
     */
    create(role: Role): Promise<Role> {
        return this.roleModel.create(role);
    }


    getSBCCoordinatorRole(): Promise<any> {
        return this.roleModel.findOne({ name: "SBC Coordinator" });
    }


    /**
     *Update existing role
     *
     * @param {UpdateRoleDto} role
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof RoleRepositoryImpl
     */
    update(role: UpdateRoleDto): Promise<UpdateWriteOpResult> {
        return this.roleModel.updateOne({ _id: role._id }, role);
    }


    /**
     *Delete existing role
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof RoleRepositoryImpl
     */
    delete(_id: string): Promise<any> {
        return this.roleModel.deleteOne({ _id });
    }


    /**
     *Get all available roles
     *
     * @return {*}  {Promise<Role[]>}
     * @memberof RoleRepositoryImpl
     */
    getAll(): Promise<Role[]> {
        return this.roleModel.find().populate('permissions');
    }

}