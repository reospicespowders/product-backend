import mongoose from "mongoose";
import { OrganizationalUnit, UpdateOUDto } from "../dto/organizational-unit.dto";
import { SearchHistory } from "../dto/search-history.dto";


/**
 * @export
 * @interface OURepository
 */
export interface OURepository {
    getById(id: number): Promise<OrganizationalUnit[]>;

    getByOuId(id: string): Promise<any>;


    ouCleanQuery():any;
    documentCount():Promise<number>;

    getWithChildren(removeInactive:boolean): Promise<any>;
    //create organizationally unit 
    create(ou: OrganizationalUnit): Promise<OrganizationalUnit>;
    //Update organizationally unit 
    update(ou: UpdateOUDto): Promise<OrganizationalUnit>;
    //Delete organizationally unit 
    delete(_id: string): Promise<any>;
    //Get All organizationally units
    getAll(): Promise<OrganizationalUnit[]>;
    //Get all without parent
    getWithoutParent(): Promise<OrganizationalUnit[]>;
    //get with graph
    getWithGraph(query : any): Promise<any>
    //Get search history
    getSearchHistory(uid: string): Promise<string[]>;
    //Search category by keyword
    searchCategory(keyword: string, categoryId?: number): Promise<OrganizationalUnit[]>
    //Create searchHistory
    createSearchHistory(searchHistory: SearchHistory): Promise<SearchHistory>
    //clean function to set data
    clean():Promise<any>;
    //get parent ID form name and parent
    getParentID(query: any): Promise<any> 
    //Get category search ous
    getByCategoryId(id:number);
    //Insert Many Ous
    insertMany(data: OrganizationalUnit[]): Promise<OrganizationalUnit[]>

    getDataFromOuId(ou: number, signedArray?: string[], unsignedArray?: string[]): Promise<any>
    
    getBranchCity(ids: string[]): Promise<any>

    getOuManagersByIds(ids: mongoose.Types.ObjectId[]):Promise<any[]>

    getParentAndChildOuIds(ous:string[]):Promise<any>;

    getOuManager(id: string): Promise<any>;

    getUserTheme(ous:Array<any> ) : Promise<any>;

    getThemeById(id: string): Promise<any>;

    saveDefaultTheme(theme: string, uid: string): Promise<any>;

    getDefaultTheme(): Promise <any>;

}