import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { Data, UpdateData } from 'src/domain/data/dto/data.dto';
import { DataRepository } from 'src/domain/data/interfaces/data-repository.interface';
import { QueryToPipeConverterService } from '../query-to-pipe-converter/query-to-pipe-converter.service';
import { AdvaneSearchDto } from 'src/domain/organizational-unit/dto/advance-search-dto';
import { AdvanceSearchLogsService } from '../advance-search-logs/advance-search-logs.service';
import { AdvanceSearchLogDto } from 'src/domain/advance-search-logs/dto/advance-search-log.dto';
import { OURepository } from 'src/domain/organizational-unit/interfaces/ou-repository.interface';
import { SearchHistory } from 'src/domain/organizational-unit/dto/search-history.dto';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthRepository } from 'src/domain/user-auth/interfaces/auth-repository.interface';

@Injectable()
export class DataService {




    constructor(
        @Inject('DataRepository') private DataRepository: DataRepository,
        private queryToPipe: QueryToPipeConverterService,
        @Inject('OURepository') private ouRepository: OURepository,
        private advanceSearchLogService: AdvanceSearchLogsService,
        // private readonly dataModel: Model<Data>
        @InjectModel('Data') private readonly dataModel: Model<Data>,
         @Inject('AuthRepository') private userRepository: AuthRepository,

    ) { }

    public async getSequence(offset, page): Promise<GenericResponse<Data[]>> {
        try {

            //aggregation to find greatest ID
            const pipe: any = [
                {
                    $group: {
                        _id: null,
                        id: { $max: "$id" }
                    }
                }
            ]

            const greatestID = await this.DataRepository.executePipe(pipe);

            const id: any = greatestID[0].id

            const response: GenericResponse<Data[]> = {
                success: true,
                message: 'Greatest Id Received',
                data: id,
            };

            return response;

        } catch (error) {
            throw new Error(error)
        }
    }

    public async getDataFromOuAndType(ou: number, type: string): Promise<GenericResponse<any>> {

        const res = await this.DataRepository.getDataFromOuAndType(ou, type);

        return {
            success: true,
            message: "Data from OU and Type Fetched Successfully",
            data: res,
        }
    }

    public async getDataFromOuId(ou: number, signedArray?: string[], unsignedArray?: string[]): Promise<GenericResponse<any>> {

        const res = await this.DataRepository.getDataFromOuId(ou, signedArray, unsignedArray);

        return {
            success: true,
            message: "Data from OU ID Fetched Successfully",
            data: res,
        }
    }

    public async advanceSearch(query: AdvaneSearchDto, uid: string): Promise<GenericResponse<any>> {

        //Creating Log
        let log: AdvanceSearchLogDto = { query, uid }
        this.advanceSearchLogService.createLog(log);

        let structuredMatch = this.queryToPipe.convertQuery(query);
        const res = await this.DataRepository.advanceSearch(structuredMatch, query.extras.ou);
        return {
            success: true,
            message: "Advance search completed successfully",
            data: res,
        }
    }

    public async cleanOnOuDeletion() {
        return this.DataRepository.dataCleanQuery();
    }


    public async textSearch(textSearch: string, user_id: string, ou?: number, ous?: string[], signedArray?: string[], unsignedArray?: string[]): Promise<GenericResponse<any> | PromiseLike<GenericResponse<any>>> {

        // console.log(ou);

        let searchLog: SearchHistory = {
            keyword: textSearch,
            user_id: user_id,
        }

        this.ouRepository.createSearchHistory(searchLog);

        let fav = []

        if(textSearch == 'fav'){
            fav = await this.getUserFavorites(user_id)
        }


        const res = ou ? await this.DataRepository.textSearch(textSearch, ou, ous, signedArray, unsignedArray, fav) : await this.DataRepository.textSearch(textSearch, null, ous, signedArray, unsignedArray, fav);
        return {
            success: true,
            message: "Text search completed successfully",
            data: res,
        }
    }

    public async getOneEnhanced(id: number): Promise<GenericResponse<any>> {
        const res = await this.DataRepository.getOneEnhanced(id);
        return {
            success: true,
            message: "Current fetched successfully",
            data: res,
        }
    }


    public async create(data: Data): Promise<GenericResponse<Data>> {
        const res = await this.DataRepository.create(data)

        const response: GenericResponse<Data> = {
            success: true,
            message: 'Data added Successfully',
            data: res,
        };
        return response;
    }


    public async bulkUpload(data: any): Promise<GenericResponse<Data>> {


        let notUploaded: Array<Data> | any = [];

        // console.log("data", data)
        const addData = await this.DataRepository.insertMany(data.data);

        notUploaded = addData;

        const response: GenericResponse<Data> = {
            success: true,
            message: 'New data created from bulk...',
            data: notUploaded,
        };

        return response;
    }

    public async signData(data: any): Promise<GenericResponse<Data>> {
        let notSigned: Array<Data> | any = [];

        let ous :any  = []

        await Promise.all(data.data.map(async (data: any) => {
            ous.push(new Types.ObjectId (data.ou))
            delete data.ou
            data.signed.date = new Date();
            const addData = await this.DataRepository.update(data);
            if (addData == null || !addData) {
                notSigned.push(data);
            }
            else {
                await this.DataRepository.updateCreateSignHistory(data)
            }
        }));

        // await this.DataRepository.cleanOu(ous)

        const response: GenericResponse<Data> = {
            success: true,
            message: 'Data signed successfully.....',
            data: notSigned,
        };

        return response;
    }

    public async changeTempActivationStatus(data: any): Promise<GenericResponse<Data>> {
        // let notSigned: Array<Data> | any = [];

        // console.log("==>Data", data);

        const updateData = await this.DataRepository.updateBulkStatus(data);
        // await Promise.all(data.data.map(async (data: any) => {
        //     data.signed.date = new Date();
        //     const addData = await this.DataRepository.update(data);
        //     if (addData == null || !addData) {
        //         notSigned.push(data);
        //     }
        // }));

        const response: GenericResponse<Data> = {
            success: true,
            message: 'Data updated successfully.....',
            data: updateData,
        };

        return response;
    }

    public async delete(_id: string): Promise<GenericResponse<any>> {
        const res = await this.DataRepository.delete(_id);

        const response: GenericResponse<any> = {
            success: true,
            message: res.deletedCount > 0 ? 'Data template deleted Successfully' : 'Data template Id not found',
            data: res,
        };
        return response;
    }

    public async getViewData(page: number, offset: number): Promise<GenericResponse<any>> {
        const res = await this.DataRepository.getViewData(page, offset);

        const response: GenericResponse<any> = {
            success: true,
            message: res ? 'Data View fetched Successfully' : 'Data template not found',
            data: res,
        };

        return response;
    }

    public async getFilteredViewData(query: any, page: number, offset: number): Promise<GenericResponse<any>> {
        const res = await this.DataRepository.getFilteredViewData(query, page, offset);

        const response: GenericResponse<any> = {
            success: true,
            message: res ? 'Data View fetched Successfully' : 'Data template not found',
            data: res,
        };

        return response;
    }

    public async getExportViewData(query: any, page: number, offset: number): Promise<GenericResponse<any>> {
        const res = await this.DataRepository.getExportViewData(query, page, offset);

        const response: GenericResponse<any> = {
            success: true,
            message: res ? 'Data View fetched Successfully' : 'Data template not found',
            data: res,
        };

        return response;
    }

    public async getContentUpdateView(page: number, offset: number): Promise<GenericResponse<any>> {
        const res = await this.DataRepository.getContentUpdateView(page, offset);

        const response: GenericResponse<any> = {
            success: true,
            message: res ? 'Content Update View fetched Successfully' : 'Content Update View not found',
            data: res,
        };

        return response;
    }


    public async update(data: UpdateData): Promise<GenericResponse<any>> {

        const res = await this.DataRepository.update(data);

        const response: GenericResponse<any> = {
            success: true,
            message: "Data Updated",
            data: res,
        };

        return response;
    }

    public async servieCount(): Promise<GenericResponse<any>> {

        let pipe = [
            {
                '$match': {
                    'active': true
                }
            },
            {
                '$group': {
                    '_id': '$type',
                    'count': {
                        '$count': {}
                    }
                }
            }, {
                '$lookup': {
                    'from': 'data-types',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'type',
                    'pipeline': [
                        {
                            '$match': {
                                'active': true
                            }
                        }
                    ]
                }
            }, {
                '$unwind': {
                    'path': '$type'
                }
            }
        ]

        const res = await this.DataRepository.executePipe(pipe);

        const response: GenericResponse<any> = {
            success: true,
            message: "Data Updated",
            data: res,
        };

        return response;
    }

    public async servieCountPost(query: any): Promise<GenericResponse<any>> {

        let matchallquery = {
            ous: {
                $in: query.all.map((id: string) => new mongoose.Types.ObjectId(id))
            },
            'active': true
        }

        let matchsignedquery = {
            ous: {
                $in: query.signed.map((id: string) => new mongoose.Types.ObjectId(id))
            },
            'active': true,
            'signed.status': true
        }

        let allpipe = [
            {
                $match: matchallquery
            },
            {
                '$group': {
                    '_id': '$type',
                    'count': {
                        '$count': {}
                    }
                }
            }, {
                '$lookup': {
                    'from': 'data-types',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'type', 
                    'pipeline': [
                        {
                            '$match': {
                                'active': true
                            }
                        }
                    ]
                }
            }, {
                '$unwind': {
                    'path': '$type'
                }
            }
        ]
        

        let signedpipe = [
            {
                $match: matchsignedquery
            },
            {
                '$group': {
                    '_id': '$type',
                    'count': {
                        '$count': {}
                    }
                }
            }, {
                '$lookup': {
                    'from': 'data-types',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'type',
                    'pipeline': [
                        {
                            '$match': {
                                'active': true
                            }
                        }
                    ]
                }
            }, {
                '$unwind': {
                    'path': '$type'
                }
            }
        ]

        // console.log(allpipe);

        const resAll = await this.DataRepository.executePipe(allpipe);
        const resSigned = await this.DataRepository.executePipe(signedpipe);

        const res = [...resAll, ...resSigned];

        // console.log(resAll);

        const response: GenericResponse<any> = {
            success: true,
            message: "Data Updated",
            data: res,
        };

        return response;
    }

    public async ouClean(query:any) : Promise<GenericResponse<any>> {
        await this.DataRepository.cleanOu(query)

        const response: GenericResponse<any> = {
            success: true,
            message: "Ou Cleaned Successfully !! ",
            data: null,
        };

        return response;

    }

    public async getSignHistory(data: string): Promise<GenericResponse<any>> {

        const res = await this.DataRepository.getSignHistory(data);

        return {
            success: true,
            message: "Signed History Fetched Successfully",
            data: res,
        }
    }

    public async dataStates(query: any): Promise<GenericResponse<any>> {

        const res = await this.DataRepository.dataStates(query);

        return {
            success: true,
            message: "Signed History Fetched Successfully",
            data: res,
        }
    }

    public async updateFavorite(id: number, uid: string): Promise<GenericResponse<any>> {
        const user = await this.userRepository.findById(uid);
        if (!user) {
            return {
                success: false,
                message: "User not found",
                data: null,
            };
        }
        let favoriteData = user.favoriteData || [];
        const index = favoriteData.indexOf(id);
        let message = "";
        if (index === -1) {
            favoriteData.push(id);
            message = "Added to favorites";
        } else {
            favoriteData.splice(index, 1);
            message = "Removed from favorites";
        }
        const updatedUser = await this.userRepository.updateUser({_id: uid}, {favoriteData : favoriteData} );
        return {
            success: true,
            message: message,
            data: favoriteData,
        };
    }

    async getUserFavorites(uid: string): Promise<Number[]> {
        try {
          const user = await this.userRepository.findById(uid);
          return user && user.favoriteData ? user.favoriteData : [];
        } catch (error) {
          // console.log(error);
          return [];
        }
      }
      
    

}