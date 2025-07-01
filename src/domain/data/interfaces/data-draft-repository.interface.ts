import { UpdateDataDraft, DataDraft } from "../dto/data-draft.dto";



export interface DataDraftRepository {

    //Create data type 
    create(DataDraft: DataDraft): Promise<DataDraft>;

    //Update data type 
    update(DataDraft: UpdateDataDraft): Promise<DataDraft>;

    //Delete data type 
    delete(_id: string): Promise<any>;

    //Get All data type 
    getAll(page: number, offset: number): Promise<DataDraft[]>;

    //Get data type by ID
    getOne(_id:string): Promise<DataDraft>


}