import { DataField, UpdateDataField } from "../dto/data-fields.dto";



/**
 * @export
 * @interface OURepository
 */
export interface DataFieldRepository {

    //Create data fields 
    create(dataField: DataField): Promise<DataField>;

    //Update data fields 
    update(dataField: UpdateDataField): Promise<DataField>;

    //Delete data fields 
    delete(_id: string): Promise<any>;

    //Get All data fields 
    getAll(page: number, offset: number): Promise<DataField[]>;

    //Get  data field by ID
    getOne(_id:string): Promise<DataField>


    getFieldsWithType(): Promise<DataField[]>;


}