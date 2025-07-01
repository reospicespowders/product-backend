import { DataTemplate } from "../dto/data-templates.dto";

// #253 Service card Template

export interface DataTemplateRepository {

    //Create data type 
    create(DataTemplate: DataTemplate): Promise<DataTemplate>;

    //Update data type 
    update(DataTemplate: DataTemplate): Promise<DataTemplate>;

    //Delete data type 
    delete(_id: string): Promise<any>;

    //Get All data type 
    getAll(page: number, offset: number): Promise<DataTemplate[]>;

    //Get data type by ID
    getOne(_id:string): Promise<DataTemplate>

     //Get data type by ID
     executePipe(pipe:Array<any>): Promise<any>

     countRecord(query: any): Promise<number>


}