import { Settings, UpdateSettings } from "../dto/settings.dto";


export interface SettingsRepository {

    //Create Settings fields 
    create(SettingsField: Settings): Promise<Settings>;

    //Update Settings fields 
    update(SettingsField: UpdateSettings): Promise<UpdateSettings>;

    //Delete Settings fields 
    delete(_id: string): Promise<any>;

    //Get All Settings fields 
    getAll(page: number, offset: number): Promise<Settings[]>;
}