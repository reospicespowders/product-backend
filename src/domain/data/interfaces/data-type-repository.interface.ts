
import { DataType, UpdateDataType } from "../dto/data-type.dto";


export interface DataTypeRepository {

    //Create data type 
    create(DataType: DataType): Promise<DataType>;

    //Update data type 
    update(DataType: UpdateDataType): Promise<DataType>;

    //Delete data type 
    delete(_id: string): Promise<any>;

    //Get All data type 
    getAll(page: number, offset: number): Promise<DataType[]>;

    //Get data type by ID
    getOne(_id:string): Promise<DataType>


}