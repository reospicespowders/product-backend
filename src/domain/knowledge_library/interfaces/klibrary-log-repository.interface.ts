import { KLibraryLog, UpdateKLibraryLog } from "../dto/Klibrary-log.dto";
import { UpdateKLibrary } from "../dto/klibrary.dto";

export interface KLibraryLogRepository {
    create(kLibrary: KLibraryLog): Promise<KLibraryLog>;
    getAll(page,offset,query): Promise<KLibraryLog[]>;
    count(query):Promise<any>
    update(kLibrary: UpdateKLibraryLog): Promise<any>;
    delete(_id: string): Promise<any>;
    findById(_id:string):Promise<any>;
}