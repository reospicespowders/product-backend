import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { Role, UpdateRoleDto } from 'src/domain/role/dto/role.dto';
import { RoleRepository } from 'src/domain/role/interfaces/role.repository.interface';


/**
 *Role serivce contains all logics related to role
 *
 * @export
 * @class RoleService
 */
@Injectable()
export class RoleService {


    /**
     * Creates an instance of RoleService.
     * @param {RoleRepository} roleRepository
     * @memberof RoleService
     */
    constructor(@Inject('RoleRepository') private roleRepository: RoleRepository) { }


    /**
     *Get all available roles
     *
     * @return {*}  {Promise<GenericResponse<Role[]>>}
     * @memberof RoleService
     */
    public async getAll(page,offset): Promise<GenericResponse<Role[]>> {
        let data = await this.roleRepository.getAll();

        let res: GenericResponse<Role[]> = {
            message: "Roles fetched successfully",
            success: true,
            data: data
        }
        return res;
    }


    /**
     *Create new role
     *
     * @param {Role} role
     * @return {*}  {Promise<GenericResponse<Role>>}
     * @memberof RoleService
     */
    public async create(role: Role): Promise<GenericResponse<Role>> {
        let data = await this.roleRepository.create(role);

        let res: GenericResponse<Role> = {
            message: "Roles created successfully",
            success: true,
            data: data
        }
        return res;
    }


    /**
     *Update existing role
     *
     * @param {UpdateRoleDto} role
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof RoleService
     */
    public async update(role: UpdateRoleDto): Promise<GenericResponse<null>> {
        let data = await this.roleRepository.update(role);

        let res: GenericResponse<null> = {
            message: "Role not updated",
            success: false,
            data: null
        }
        if (data.modifiedCount > 0) {
            res = {
                message: "Role updated successfully",
                success: true,
                data: null
            };
        }
        return res;
    }


    /**
     *Delete existing role
     *
     * @param {string} _id
     * @return {*}  {Promise<GenericResponse<null>>}
     * @memberof RoleService
     */
    public async delete(_id: string): Promise<GenericResponse<null>> {
        let data = await this.roleRepository.delete(_id);

        let res: GenericResponse<null> = {
            message: "Role not deleted",
            success: false,
            data: data
        }
        if (data.deletedCount > 0) {
            res = {
                message: "Role deleted successfully",
                success: true,
                data: null
            };
        }
        return res;
    }
}
