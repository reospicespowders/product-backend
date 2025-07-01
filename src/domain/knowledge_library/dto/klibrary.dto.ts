import { IntersectionType } from "@nestjs/swagger";


export class KLibrary {
    name: string;
    description: string;
    image: string;
    categoryname: string;
    categoryicon: string;
    link: Array<Link>;
    ou: string;
    downloadcount: number;
    announceNotification:boolean;
}

class Link {
    link:string;
    name:string;
}


export class UpdateKLibrary extends IntersectionType(KLibrary) {
    _id: string;
}