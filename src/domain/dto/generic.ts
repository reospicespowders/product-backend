
/**
 *
 *
 * @export
 * @class GenericRequest
 * @template T
 */
export class GenericRequest<T> {
    data: T;
}


/**
 *
 *
 * @export
 * @class GenericResponse
 * @template T
 */
export class GenericResponse<T> {
    success: boolean;
    message: string;
    data: T;
    pagination?: any = null;
 
    constructor(success: boolean, message: string, data: T) {
        this.success = success;
        this.message = message;
        this.data = data;
        if (Array.isArray(data)) {
            this.pagination = {
                total: data.length,
                pagesize: 10,
                page: 1
            }
        }
    }
}
