import { IntersectionType } from "@nestjs/swagger";
import { OrganizationalUnit } from "src/domain/organizational-unit/dto/organizational-unit.dto";


export class COption {
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
}

export class AOption {
    allow: boolean;
    disallow: boolean;
}

export class Option {
    type: string;
    options: COption | AOption;
}

//Child interfaces
export class Child {
    name: string;
    ouRequired: boolean;
    arabic: string;
    ou: OrganizationalUnit | string;
    tagAlias: string;
    options: Option;
}

export class Parent {
    name: string;
    ouRequired: boolean;
    ou: OrganizationalUnit | string;
    ouLabel: string;
    options: Option;
    tagAlias: string;
    children: Array<Child>;
    arabic: string;
}

export class Permission {
    name: string;
    permissions: Array<Parent>;
    active: boolean;
    unit?: string;
    flag?: string;
}

export class UpdatePermissionDto extends IntersectionType(Permission) {
    _id: string;
}



export class Content {
    allow: boolean
    signedOus: Array<any>
    allOus: Array<any>
}

export class kLibrary {
    allow: boolean
    ou: Array<any>
    categories: Array<any>
}

export class dataView {
    allow: boolean
    allowPrint: boolean
    signedOus: Array<any>
    allOus: Array<any>
}

export class templateHide {
    fields: Array<any>
}

export class InvestorPermissionDto {
    _id: any;
    content: Content;
    kLibrary: kLibrary;
    dataView: dataView;
    templateHide: templateHide;

}