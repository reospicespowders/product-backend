import { OUType, UpdateOUType } from "../dto/ou-type.dto";


/**
 *
 *
 * @export
 * @interface OUTypeRepository
 */
export interface OUTypeRepository {


    /**
     *
     *
     * @param {OUType} ouType
     * @return {*}  {Promise<OUType>}
     * @memberof OUTypeRepository
     */
    create(ouType: OUType): Promise<OUType>;


    /**
     *
     *
     * @param {OUType} ouType
     * @return {*}  {Promise<OUType>}
     * @memberof OUTypeRepository
     */
    update(ouType: UpdateOUType): Promise<OUType>;


    /**
     *
     *
     * @return {*}  {Promise<OUType[]>}
     * @memberof OUTypeRepository
     */
    getAll(): Promise<OUType[]>;


    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof OUTypeRepository
     */
    delete(_id: string): Promise<any>;

    /**
     *
     *
     * @return {*}  {Promise<OUType[]>}
     * @memberof OUTypeRepository
     */
    getBranches(): Promise<OUType[]>;
}