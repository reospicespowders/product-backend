import { Model, UpdateWriteOpResult } from "mongoose";
import { InvestorPermissionDto, Permission, UpdatePermissionDto } from "../dto/permission.dto";
import { PermissionRepository } from "../interfaces/permission.repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class PermissionRepositoryImpl implements PermissionRepository {

    constructor(@InjectModel('Permission') private readonly permissionModel: Model<Permission>,
        @InjectModel('investor-permissions') private readonly investorModel: Model<InvestorPermissionDto>
    ) { }

    create(permission: Permission): Promise<Permission> {
        return this.permissionModel.create(permission);
    }
    getAll(): Promise<Permission[]> {
        return this.permissionModel.find();
    }
    update(permission: UpdatePermissionDto): Promise<UpdateWriteOpResult> {
        return this.permissionModel.updateOne({ _id: permission._id }, permission);
    }
    delete(_id: string): Promise<any> {
        return this.permissionModel.deleteOne({ _id });
    }

    updateInvestorPermission(data: InvestorPermissionDto): Promise<any> {
        return this.investorModel.updateOne(
            { _id: data._id }, // Assuming data contains an _id field
            { $set: data },
            { upsert: true }
        );
    }

    getInvestorPermission(): Promise<InvestorPermissionDto> {
        return this.investorModel.findOne();
    }

    async getPermissionUser(permissionName: string, value:string): Promise<any> {
        try {

            let match :any = {
                'permissions.name': permissionName,
                'permissions.options.options.allow' : true
            }


            const pipeline = [
                {
                    '$unwind': {
                        'path': '$permissions'
                    }
                }, {
                    '$match': match
                }, {
                    '$lookup': {
                        'from': 'roles', 
                        'localField': '_id', 
                        'foreignField': 'permissions', 
                        'as': 'roles'
                    }
                }, {
                    '$addFields': {
                        'roles': '$roles._id'
                    }
                }, {
                    '$lookup': {
                        'from': 'users', 
                        'localField': 'roles', 
                        'foreignField': 'role', 
                        'as': 'users', 
                        'pipeline': [
                            {
                                '$project': {
                                    '_id': 1, 
                                    'email': 1, 
                                    'name': 1
                                }
                            }
                        ]
                    }
                }, {
                    '$unwind': {
                        'path': '$users'
                    }
                }, {
                    '$replaceRoot': {
                        'newRoot': '$users'
                    }
                }
            ];
    

            return this.permissionModel.aggregate(pipeline);
          
        } catch (error) {
            throw new Error(error);
        }
    }



}