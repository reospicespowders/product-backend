import { FieldType, UpdateFieldType } from "../dto/field-type.dto";


export interface FieldTypeRepository {

    //Create data fields 
    create(dataField: FieldType): Promise<FieldType>;

    //Update data fields 
    update(dataField: UpdateFieldType): Promise<UpdateFieldType>;

    //Delete data fields 
    delete(_id: string): Promise<any>;

    //Get All data fields 
    getAll(page: number, offset: number): Promise<FieldType[]>;
}