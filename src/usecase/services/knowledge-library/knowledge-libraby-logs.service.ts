import { Inject, Injectable } from '@nestjs/common';
import { UpdateWriteOpResult } from 'mongoose';
import { GenericResponse } from 'src/domain/dto/generic';
import { KLibraryLog, UpdateKLibraryLog } from 'src/domain/knowledge_library/dto/Klibrary-log.dto';
import { KLibraryLogRepository } from 'src/domain/knowledge_library/interfaces/klibrary-log-repository.interface';


@Injectable()
export class KnowledgeLibraryLogService {

    constructor(
        @Inject('KLibraryLogRepository') private klLogRepository: KLibraryLogRepository,
    ) { }

    public async create(KLibraryLog: KLibraryLog): Promise<GenericResponse<KLibraryLog>> {
        let data = await this.klLogRepository.create(KLibraryLog);

        let response: GenericResponse<KLibraryLog> = {
            success: true,
            message: 'Knowledge library category created successfully',
            data: data,
        };

        return response;

    }

    public async getAll(page:number,offset:number, query:any): Promise<GenericResponse<any>> {
       
        let data = await this.klLogRepository.getAll(page,offset,query);
       
        let count = await  this.klLogRepository.count(query)


        let response: GenericResponse<any> = {
            success: true,
            message: 'Knowledge library categories fetched successfully',
            data: {data : data,count: count},
        };

        return response;
    }

    public async update(KLibraryLog: UpdateKLibraryLog): Promise<GenericResponse<null>> {
        let res: UpdateWriteOpResult = await this.klLogRepository.update(KLibraryLog);

        let response: GenericResponse<null> = {
            success: false,
            message: 'Failed to update Knowledge library category',
            data: null,
        };

        if (res.modifiedCount === 1) {
            response = {
                success: true,
                message: 'Knowledge library category updated successfully',
                data: null,
            };
        }
        return response;
    }

    // public async delete(_id: string, deleteData: boolean, changeCategory: KLibraryLog): Promise<GenericResponse<null>> {
    //     let response: GenericResponse<null>;

        
    //     return response;
    // }
}
