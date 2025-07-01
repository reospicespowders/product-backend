import { Data } from "../dto/data.dto";

export interface DataRepository {
    getDataFromOuId(ou: number, signedArray?: string[], unsignedArray?: string[]): Promise<any>;

    //Create data  
    create(Data: Data): Promise<Data>;

    //Update data  
    update(Data: Data): Promise<Data>;

    //Update data  
    cleanOu(ous : any): Promise<any>;

    //Delete data  
    delete(_id: string): Promise<any>;

    //Get All data  
    getAll(page: number, offset: number): Promise<Data[]>;

    //Get data by ID
    getOne(_id: string): Promise<Data>;

    //Get data sign history by ID
    getSignHistory(dataId: string): Promise<Data>;

    //Get States 
    dataStates(query: any): Promise<any>

    getOneEnhanced(id: number): Promise<any>;

    //Use Text Search
    textSearch(textSearch: string, ou?: number, ous?: string[],signedArray?: string[], unsignedArray?: string[] , fav ?: Number[]): Promise<Data[]>;

    //Execute Pipe
    executePipe(pipe: Array<any>): Promise<any>

    //Get record counts
    countRecord(query: any): Promise<number>

    //Get Data View
    getViewData(page: number, offset: number): Promise<any>

    getFilteredViewData(query: any, page: number, offset: number): Promise<any>

    //get data for export
    getExportViewData(query: any, page: number, offset: number): Promise<any>

    //Get Content Update View
    getContentUpdateView(page: number, offset: number): Promise<any>

    advanceSearch(basicMatch: any, ou?: number): any;

    dataCleanQuery(): any;

    insertMany(Data: Data[]): Promise<Data[]>;

    getDataFromOuAndType(ou: number, type: string): any;

    updateBulkStatus(data): any

    updateCreateSignHistory(data:any):any

    // updateFavorite(id: number, uid : string)

}