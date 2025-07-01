import { UpdateWriteOpResult } from "mongoose";
import { KLibrary, UpdateKLibrary } from "../dto/klibrary.dto";
import { KLibraryCategory } from "../dto/klibrary-category.dto";



export interface KLIbraryRepository {
    create(kLibrary:KLibrary):Promise<KLibrary>;
    getAll():Promise<KLibrary[]>;
    update(kLibrary:UpdateKLibrary):Promise<UpdateWriteOpResult>;
    delete(_id:string):Promise<any>;
    deleteMany(query:any):Promise<any>;
    updateByName(name:string,changeCategory:KLibraryCategory):Promise<UpdateWriteOpResult>
}