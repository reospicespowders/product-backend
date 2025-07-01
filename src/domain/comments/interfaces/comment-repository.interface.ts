import { UpdateWriteOpResult } from "mongoose";
import { Comment, UpdateCommentDto } from "../dto/comment.dto";



/**
 *Comment Repository to interact with comments collection
 *
 * @export
 * @interface CommentRepository
 */
export interface CommentRepository {
    //Create a new comment
    create(comment: Comment): Promise<Comment>;

    //Get all comments
    getAll(status : string, offset: number,page: number): Promise<Comment[]>;

    //Update a comment
    update(comment: any): Promise<UpdateWriteOpResult>;

    //Delete a comment
    delete(_id: string): Promise<any>;

    //Get user specific comments
    getByUser(userId: string , page:number, offset : number): Promise<Comment[]>;

    //Get data specific comments
    getByDataId(dataId:string):Promise<Comment[]>

    //Get by id
    getById(id:string):Promise<Comment>;

    populateProperty(comment:Comment,property:string):Promise<Comment>;
}