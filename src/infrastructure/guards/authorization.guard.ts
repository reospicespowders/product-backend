import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Permission } from 'src/domain/permission/dto/permission.dto';
import { AuthRepository } from 'src/domain/user-auth/interfaces/auth-repository.interface';


@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, @Inject('AuthRepository') private readonly userRepository: AuthRepository) { }

    
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredPermission: Permission | undefined = this.reflector.get<Permission>('permission', context.getHandler());
    
        if (!requiredPermission) {
            return true;
        }
    
        const { unit, flag } = requiredPermission;
    
        if (!unit && !flag) {
            return true;
        }
    
        const { user } = context.switchToHttp().getRequest();
        const hasPermission = this.hasPermission(unit, flag, user.uid);
    
        return hasPermission;
    }

    async hasPermission(unit: string, flag: string, uid: string): Promise<boolean> {
        let role: any = await this.userRepository.findOne({ _id: uid }, ['role']);
        if (!role) {
            return false;
        }

        let permissions: Permission[] = role.role.permissions;
        let result: boolean = false;

        for (let pData of permissions) {
            //checking if parent is the unit
            for (let permission of pData.permissions) {
                if (permission.name == unit) {
                    result = this.checkFlag(flag, permission.options);
                    if (result) {
                        break;
                    }
                } else {
                    if (permission.children && permission.children.length > 0) {
                        let childPermission = permission.children.find(
                            (child: any) => child.name == unit
                        );
                        if (childPermission) {
                            result = this.checkFlag(flag, childPermission.options);
                            if (result) {
                                break;
                            }
                        }
                    }
                }
            }
            if (result) {
                break;
            }
        }
        return result;
    }

    private checkFlag(flag: any, options: any): boolean {
        if (options.type == 'RADIO') {
            return options.options.allow;
        } else if (options.type == 'CHECKBOX') {
            switch (flag) {
                case 'c':
                    return options.options.write;
                case 'r':
                    return options.options.read;
                case 'u':
                    return options.options.update;
                case 'd':
                    return options.options.delete;
            }
        }
        return false;
    }
}
