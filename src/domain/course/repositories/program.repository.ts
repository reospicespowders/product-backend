import { Injectable } from "@nestjs/common";
import { ProgramRepository } from "../interfaces/program-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import { Program, UpdateProgram } from "../dto/program.dto";




@Injectable()
export class ProgramRepositoryImpl implements ProgramRepository {

    constructor(@InjectModel('Program') private readonly assessmentModel: Model<Program>) { }

    /**
     *
     *
     * @param {Program} Program
     * @return {*}  {Promise<Program>}
     * @memberof ProgramRepositoryImpl
     */
    public create(Program: Program): Promise<Program> {
        return this.assessmentModel.create(Program);
    }
    /**
     *
     *
     * @param {number} page
     * @param {number} size
     * @return {*}  {Promise<Program[]>}
     * @memberof ProgramRepositoryImpl
     */
    public getAll(page:number,size:number): Promise<Program[]> {
        return this.assessmentModel.find();
    }
    /**
     *
     *
     * @param {UpdateProgram} Program
     * @return {*}  {Promise<UpdateWriteOpResult>}
     * @memberof ProgramRepositoryImpl
     */
    public update(Program: UpdateProgram): Promise<UpdateWriteOpResult> {
        let _id = Program._id;
        delete Program._id;
        return this.assessmentModel.updateOne({ _id }, { $set: Program })
    }
    /**
     *
     *
     * @param {string} _id
     * @return {*}  {Promise<any>}
     * @memberof ProgramRepositoryImpl
     */
    public delete(_id: string): Promise<any> {
        return this.assessmentModel.deleteOne({ _id });
    }
}