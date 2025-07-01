import { UpdateWriteOpResult } from "mongoose";
import { Role, UpdateRoleDto } from "../dto/role.dto";



/**
 *Role Repository Interface
 *
 * @export
 * @interface RoleRepository
 */
export interface RoleRepository {
    create(role: Role): Promise<Role>;
    update(role: UpdateRoleDto): Promise<UpdateWriteOpResult>;
    delete(_id: string): Promise<any>;
    getAll(): Promise<Role[]>;
    getSBCCoordinatorRole(): Promise<any>;
}