import { Inject, Injectable } from '@nestjs/common';
import { Settings, UpdateSettings } from 'src/domain/data/dto/settings.dto';
import { SettingsRepository } from 'src/domain/data/interfaces/settings.interface';
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class SettingsService {
    constructor(@Inject('SettingsRepository') private SettingsRepository: SettingsRepository) { }


    public async getAll(page, offset): Promise<GenericResponse<Settings[]>> {
        const res = await this.SettingsRepository.getAll(page, offset);

        const response: GenericResponse<Settings[]> = {
            success: true,
            message: 'Settings fetched Successfully',
            data: res,
        };
        return response;
    }


    public async create(data: Settings): Promise<GenericResponse<Settings>> {
        const res = await this.SettingsRepository.create(data)

        const response: GenericResponse<Settings> = {
            success: true,
            message: 'Settings added Successfully',
            data: res,
        };
        return response;
    }


    public async update(data: UpdateSettings): Promise<GenericResponse<Settings>> {
        const res = await this.SettingsRepository.update(data);

        const response: GenericResponse<Settings> = {
            success: true,
            message: 'Settings updated Successfully',
            data: res,
        };
        return response;
    }

    public async delete(_id: string): Promise<GenericResponse<any>> {
        const res = await this.SettingsRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: 'Settings deleted Successfully',
            data: res,
        };
        return response;
    }

}