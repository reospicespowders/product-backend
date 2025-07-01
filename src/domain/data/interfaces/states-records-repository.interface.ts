import { UpdateStates, States } from "../dto/states-records.dto";

export interface StatesRepository {

    //Create data type 
    create(States: States): Promise<States>;

    //Update data type 
    update(States: UpdateStates): Promise<States>;

    //Delete data type 
    delete(_id: string): Promise<any>;

    //Get All data type 
    getAll(page: number, offset: number): Promise<States[]>;

    //Get data type by ID
    getOne(_id:string): Promise<States>

    //get states
    getProgress(uid : string): Promise<any[]>


}