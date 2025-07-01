import { ContentUpdate } from "../dto/content-update.dto";
import { Data, UpdateData } from "../dto/data.dto";


export interface ContentUpdateRepository {

    populateProperty(data:ContentUpdate,field:string[]):Promise<ContentUpdate>;
    //Create content update log  
    create(ContentUpdate: ContentUpdate): Promise<ContentUpdate>;

    multipleDelete(ContentUpdate: Array<ContentUpdate>): Promise<any>;

    //Update content update log  
    update(ContentUpdate: ContentUpdate): Promise<ContentUpdate>;

    //Delete content update log  
    delete(_id: string): Promise<any>;

    //Get all content update log  
    getAll(query:any,page: number, offset: number): Promise<ContentUpdate[]>;

    //get content update users
    getUsers(page: number, offset: number): Promise<any>;

    //Get content update log by ID
    getOne(_id: string): Promise<ContentUpdate>

    //Execute Pipe
    executePipe(pipe: Array<any>): Promise<any>

    //Get record counts
    countRecord(query: any): Promise<number>

    createData(fieldType: Data): Promise<any>

    //update data in data model
    updateData(data: any): Promise<any>

    //create new field 
    addNewField(data : any): Promise<any>

    //data pipeline execution
    executeDataPipe(pipe: Array<any>): Promise<any> 

    //delete data
    deleteData(data: any): Promise<any> 

    //update name
    updateName(data: UpdateData): Promise<Data>

    //undo delete
    undoDeleteData(id: string): Promise<any>

    
}