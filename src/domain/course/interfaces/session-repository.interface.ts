import { UpdateWriteOpResult } from "mongoose";
import { Session, UpdateSession } from "../dto/session.dto";



/**
 *
 *
 * @export
 * @interface SessionRepository
 */
export interface SessionRepository {
    updateSessionOrder(data: any[]): any;
    create(assessment: Session): Promise<Session>;
    getAll(): Promise<Session[]>;
    getSessionTrainers(id:any) : Promise<any>
    update(assessment: UpdateSession): Promise<UpdateWriteOpResult>;
    addSeenBy(Session: any):Promise<null>
    delete(_id: string): Promise<any>;
    checkTrainerAvailability(query:any) : Promise<any>
    updateResults(courseId:string,id:string,results:any): Promise<UpdateWriteOpResult>;
}