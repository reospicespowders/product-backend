import { UpdateWriteOpResult } from "mongoose";
import { InvestorPermissionDto, Permission, UpdatePermissionDto } from "../dto/permission.dto";



export interface PermissionRepository {
    create(permission:Permission) : Promise<Permission>;
    getAll() : Promise<Permission[]>;
    update(permission:UpdatePermissionDto) : Promise<UpdateWriteOpResult>;
    delete(_id:string) : Promise<any>;
    updateInvestorPermission(data:InvestorPermissionDto) : Promise<any>;
    getInvestorPermission() : Promise<any>;
    getPermissionUser(permissionName: string, value:string): Promise<any>
}