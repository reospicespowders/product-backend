import { Inject, Injectable } from '@nestjs/common';
import { DataDraft, UpdateDataDraft } from 'src/domain/data/dto/data-draft.dto';
import { DataDraftRepository } from 'src/domain/data/interfaces/data-draft-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class DataDraftService {

    constructor(@Inject('DataDraftRepository') private DataDraftRepository: DataDraftRepository){}

    public async getAll(page,offset): Promise<GenericResponse<DataDraft[]>> {
        const res = await this.DataDraftRepository.getAll(page,offset);

        const response: GenericResponse<DataDraft[]> = {
            success: true,
            message: 'Data Draft fetched Successfully',
            data: res,
        };
        return response;
    }


    /**
     *
     *
     * @param {DataDraft} data
     * @return {*}  {Promise<GenericResponse<DataDraft>>}
     * @memberof DataDraftService
     */
    public async create(data: DataDraft): Promise<GenericResponse<DataDraft>> {
        const res = await this.DataDraftRepository.create(data)

        const response: GenericResponse<DataDraft> = {
            success: true,
            message: 'Data Draft added Successfully',
            data: res,
        };
        return response;
    }


    public async update(data: UpdateDataDraft): Promise<GenericResponse<DataDraft>> {
        const res = await this.DataDraftRepository.update(data);

        const response: GenericResponse<DataDraft> = {
            success: true,
            message: 'Data Draft updated Successfully',
            data: res,
        };
        return response;
    }

    public async delete(_id: string): Promise<GenericResponse<any>> {
        const res = await this.DataDraftRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res.deletedCount > 0 ? 'Data Draft deleted Successfully' : 'Data DraftId not found',
            data: res,
        };
        return response;
    }

    public async getOne(_id: string): Promise<GenericResponse<DataDraft>>{
        const res = await this.DataDraftRepository.getOne(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res ?  'Data Draft fetched Successfully' : 'Data Draft not found',
            data: res,
        };
        
        return response;
    }

}