import { OUCategory, UpdateOUCategory } from "../dto/ou-category.dto";


export interface OUCategoryRepository {
    
    /**
     *
     *
     * @param {OUCategory} ouCategory
     * @return {*}  {Promise<OUCategory>}
     * @memberof OUCategoryRepository
     */
    create(ouCategory: OUCategory): Promise<OUCategory>;
   


    /**
     *
     *
     * @return {*}  {Promise<OUCategory[]>}
     * @memberof OUCategoryRepository
     */
    getAll(): Promise<OUCategory[]>;
    

    /**
     *
     *
     * @param {UpdateOUCategory} ouCategory
     * @return {*}  {Promise<OUCategory>}
     * @memberof OUCategoryRepository
     */
    update(ouCategory: UpdateOUCategory): Promise<OUCategory>;
    

    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof OUCategoryRepository
     */
    delete(_id: string): Promise<any>;
}