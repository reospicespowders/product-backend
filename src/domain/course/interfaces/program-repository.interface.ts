import { UpdateWriteOpResult } from "mongoose";
import { Program, UpdateProgram } from "../dto/program.dto";


/**
 *
 *
 * @export
 * @interface ProgramRepository
 */
export interface ProgramRepository {
    create(assessment: Program): Promise<Program>;
    getAll(page:number,size:number): Promise<Program[]>;
    update(assessment: UpdateProgram): Promise<UpdateWriteOpResult>;
    delete(_id: string): Promise<any>;
}