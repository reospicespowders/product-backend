import { AdvanceSearchLogsRepository } from "../interfaces/advance-search-log-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdvanceSearchLogDto } from "../dto/advance-search-log.dto";



export class AdvanceSearchLogsRepositoryImpl implements AdvanceSearchLogsRepository {

    constructor(@InjectModel("AdvanceSearchLogs") private readonly advanceSearchLogs: Model<AdvanceSearchLogDto>) { }

    createLog(log: AdvanceSearchLogDto): Promise<AdvanceSearchLogDto> {
        return this.advanceSearchLogs.create(log);
    }

}