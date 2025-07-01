import { UpdateWriteOpResult } from "mongoose";
import { KLibraryCategory, UpdateKLibraryCategory } from "../dto/klibrary-category.dto";


export interface KLibraryCategoryRepository {
    create(kLibrary: KLibraryCategory): Promise<KLibraryCategory>;
    getAll(): Promise<KLibraryCategory[]>;
    update(kLibrary: UpdateKLibraryCategory): Promise<UpdateWriteOpResult>;
    delete(_id: string): Promise<any>;
    findById(_id:string):Promise<any>;
}