import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { OrganizationalUnit, UpdateOUDto } from 'src/domain/organizational-unit/dto/organizational-unit.dto';
import { SearchHistory } from 'src/domain/organizational-unit/dto/search-history.dto';
import { OURepository } from 'src/domain/organizational-unit/interfaces/ou-repository.interface';
import { ActiveUserSocketGateway } from 'src/infrastructure/gateway/active-user-socket.gateway';
import { DataService } from '../data/data.service';

/**
 * @export
 * @class OrganizationalUnitService
 */
@Injectable()
export class OrganizationalUnitService {

    constructor(
        @Inject('OURepository') private ouRepository: OURepository,
        private updateOUSocket: ActiveUserSocketGateway,
        private dataService: DataService

    ) { }


    public async getParentAndChildOuIds(ous:string[]):Promise<GenericResponse<any>> {
        let data = await this.ouRepository.getParentAndChildOuIds(ous);

        const response = {
            success: true,
            message: 'Organizational Units Fetched Successfully',
            data: data,
        };
        return response;
    }

    /**
     *
     * Get Organizational unit by ID
     * @return {*}  {Promise<OrganizationalUnit>}
     * @memberof OrganizationalUnitService
     */
    public async getById(id: number): Promise<GenericResponse<OrganizationalUnit[]>> {
        let data = await this.ouRepository.getById(id);

        const response = {
            success: true,
            message: 'Organizational Units Fetched Successfully',
            data: data,
        };
        return response;
    }



    /**
     *
     * Get All Organizational units
     * @return {*}  {Promise<OrganizationalUnit[]>}
     * @memberof OrganizationalUnitService
     */
    public async getAll(page, offset): Promise<GenericResponse<OrganizationalUnit[]>> {
        let data = await this.ouRepository.getAll();
        // Generic Response
        const response: GenericResponse<OrganizationalUnit[]> = {
            success: true,
            message: 'Organizational Units Fetched Successfully',
            data: data,
        };
        return response;
    }


    /**
     *Get OUs with children
     *
     * @memberof OrganizationalUnitService
     */
    public async getWithChildren(page: any, offset: any, removeInactive: boolean = false): Promise<GenericResponse<any>> {
        let data = await this.ouRepository.getWithChildren(removeInactive);
        const response: GenericResponse<OrganizationalUnit[]> = {
            success: true,
            message: 'Organizational Units with children Fetched Successfully',
            data: data,
        };
        return response;
    }

    public async getWithGraph(query: any, page, offset): Promise<GenericResponse<any>> {
        let data = await this.ouRepository.getWithGraph(query);
        const response: GenericResponse<OrganizationalUnit[]> = {
            success: true,
            message: 'Organizational Units with graph Fetched Successfully',
            data: data,
        };
        return response;
    }

    public async getParentID(query: any): Promise<GenericResponse<any>> {
        let data = await this.ouRepository.getParentID(query);
        const response: GenericResponse<any> = {
            success: true,
            message: 'Parent ID returned Successfully',
            data: data,
        };
        return response;
    }

    /**
     *Search category by keyword
     *
     * @return {*}  {Promise<GenericResponse<OrganizationalUnit[]>>}
     * @memberof OrganizationalUnitService
     */
    public async searchCategory(keyword: string, userId: string, categoryId?: number, page?: number, offset?: number): Promise<GenericResponse<OrganizationalUnit[]>> {

        let searchLog: SearchHistory = {
            category_id: categoryId,
            keyword: keyword,
            user_id: userId,
        }

        this.ouRepository.createSearchHistory(searchLog);

        let res = await this.ouRepository.searchCategory(keyword, categoryId);

        const response: GenericResponse<OrganizationalUnit[]> = {
            success: true,
            message: 'Searched data fetched Successfully',
            data: res,
        };
        return response;
    }


    public async cleanOUQuery() {
        let firstCount = 0;
        let secondCount = 0;
        do {
            await this.ouRepository.ouCleanQuery();
            firstCount = await this.ouRepository.documentCount();
            await this.ouRepository.ouCleanQuery();
            secondCount = await this.ouRepository.documentCount();
        } while (firstCount != secondCount);

        this.dataService.cleanOnOuDeletion();
        return true;
    }


    /**
     *
     *
     * @param {string} uid
     * @return {*}  {Promise<GenericResponse<SearchHistory[]>>}
     * @memberof OrganizationalUnitService
     */
    public async getSearchHistory(uid: string, page: number, offset: number): Promise<GenericResponse<string[]>> {
        let data = await this.ouRepository.getSearchHistory(uid);
        const response: GenericResponse<string[]> = {
            success: true,
            message: 'Search history fetched Successfully',
            data: data,
        };
        return response;
    }


    /**
     *
     *
     * @return {*}  {Promise<GenericResponse<OrganizationalUnit[]>>}
     * @memberof OrganizationalUnitService
     */
    public async getWithoutParent(page: number, offset: number): Promise<GenericResponse<OrganizationalUnit[]>> {
        let data = await this.ouRepository.getWithoutParent();
        const response: GenericResponse<OrganizationalUnit[]> = {
            success: true,
            message: 'Organizational Units without parent Fetched Successfully',
            data: data,
        };
        return response;
    }


    /**
     *
     *  Create Organizational Unit
     * @param {OrganizationalUnit} ou
     * @return {*}  {Promise<OrganizationalUnit>}
     * @memberof OrganizationalUnitService
     */
    public async create(ou: OrganizationalUnit): Promise<GenericResponse<OrganizationalUnit>> {
        let res = await this.ouRepository.create(ou);
        this.updateOUSocket.updateEvent("OU");
        const response: GenericResponse<OrganizationalUnit> = {
            success: true,
            message: 'Organizational unit created Successfully',
            data: res,
        };
        return response;
    }



    /**
     *Get all ous by category ID "specifically created for" category filter component
     *
     * @param {number} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof OrganizationalUnitService
     */
    public async getByCategoryId(id: number): Promise<GenericResponse<any>> {
        let res = await this.ouRepository.getByCategoryId(id);
        const response: GenericResponse<any> = {
            success: true,
            message: 'Organizational units fetched Successfully',
            data: res,
        };
        return response;
    }


    /**
     *
     * Update Organizational Unit
     * @param {UpdateOUDto} ou
     * @return {*}  {Promise<OrganizationalUnit>}
     * @memberof OrganizationalUnitService
     */
    public async update(ou: UpdateOUDto): Promise<GenericResponse<OrganizationalUnit>> {
        let data = await this.ouRepository.update(ou);
        this.updateOUSocket.updateEvent("OU");
        const response: GenericResponse<OrganizationalUnit> = {
            success: true,
            message: 'Organizational unit updated Successfully',
            data: data,
        };
        return response;
    }


    /**
     *
     * Bulk Create Organizational Unit
     * @return {*}  {Promise<OrganizationalUnit[]>}
     * @memberof OrganizationalUnitService
     */
    async insertMany(data: any): Promise<GenericResponse<any>> {

        let notUploaded: Array<OrganizationalUnit[]> | any = [];

        // console.log("data", data)
        const addData = await this.ouRepository.insertMany(data.data);

        notUploaded = addData;

        const response: GenericResponse<OrganizationalUnit[]> = {
            success: true,
            message: 'New data created from bulk...',
            data: notUploaded,
        };

        return response;
    }


    /**
     *
     * Delete Organizational Unit
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof OrganizationalUnitService
     */
    public async delete(_id: string): Promise<GenericResponse<any>> {
        let res = await this.ouRepository.delete(_id);
        this.updateOUSocket.updateEvent("OU");
        this.cleanOUQuery();
        const response: GenericResponse<any> = {
            success: true,
            message: 'Organizational unit deleted Successfully',
            data: res,
        };
        return response;
    }

    public async clean(): Promise<GenericResponse<any>> {
        let res = await this.ouRepository.clean();
        let response: GenericResponse<any> = {
            success: false,
            message: 'Failed to clean ou',
            data: null,
        };
        if (res) {
            response = {
                success: true,
                message: 'OU cleaned successfully',
                data: res,
            };
        }

        return response;
    }

    public async getDataFromOuId(id: number, signedArray?: string[], unsignedArray?: string[]): Promise<GenericResponse<any>> {
        let res = await this.ouRepository.getDataFromOuId(id,signedArray,unsignedArray);
        let response: GenericResponse<any> = {
            success: true,
            message: 'Got the data from ou id',
            data: res,
        };

        return response;
    }

    public async getByOuId(id: string): Promise<GenericResponse<any>> {
        let res = await this.ouRepository.getByOuId(id);
        let response: GenericResponse<any> = {
            success: true,
            message: 'Got the data from ou object id',
            data: res,
        };

        return response;
    }


    public async getBranchCity(ids: string[]): Promise<GenericResponse<any>> {
        let res = await this.ouRepository.getBranchCity(ids);
        let response: GenericResponse<any> = {
            success: true,
            message: 'Cities fetched Successfully',
            data: res,
        };
        return response;
        
    }

    public async getOuManager(id: string): Promise<GenericResponse<any>> {
        let res = await this.ouRepository.getOuManager(id);
        let response: GenericResponse<any> = {
            success: true,
            message: 'OU manager fetched Successfully',
            data: res,
        };
        return response;
    }

    public async getThemeById(id: string): Promise<GenericResponse<any>> {
        let res = await this.ouRepository.getThemeById(id);
        let response: GenericResponse<any> = {
            success: true,
            message: 'theme',
            data: res,
        };
        return response;
    }

    /**
     * Save default theme for organizational units
     * @param theme Theme data to be saved
     * @param req Request object containing user information
     * @returns Promise<GenericResponse<OrganizationalUnit[]>>
     */
    public async saveDefaultTheme(theme: string, req: any): Promise<GenericResponse<OrganizationalUnit[]>> {
        try {
            // Update the theme in the repository
            const updatedOUs = await this.ouRepository.saveDefaultTheme(theme, req.user.ous);
               
            const response: GenericResponse<OrganizationalUnit[]> = {
                success: true,
                message: 'Default theme saved successfully',
                data: updatedOUs,
            };
            return response;
        } catch (error) {
            const response: GenericResponse<OrganizationalUnit[]> = {
                success: false,
                message: 'Failed to save default theme',
                data: null,
            };
            return response;
        }
    }

    /**
     * Save default theme for organizational units
     * @param theme Theme data to be saved
     * @param req Request object containing user information
     * @returns Promise<GenericResponse<OrganizationalUnit[]>>
     */
    public async geteDefaultTheme(): Promise<GenericResponse<any>> {
        try {
            // Update the theme in the repository
            const updatedOUs = await this.ouRepository.getDefaultTheme();
               
            const response: GenericResponse<OrganizationalUnit[]> = {
                success: true,
                message: 'Default theme fetched successfully',
                data: updatedOUs,
            };
            return response;
        } catch (error) {
            const response: GenericResponse<OrganizationalUnit[]> = {
                success: false,
                message: 'Failed to save default theme',
                data: null,
            };
            return response;
        }
    }
    


}
