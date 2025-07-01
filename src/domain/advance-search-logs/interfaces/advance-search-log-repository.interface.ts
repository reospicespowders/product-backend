import { AdvanceSearchLogDto } from "../dto/advance-search-log.dto";


export interface AdvanceSearchLogsRepository {
    createLog(advanceSearchLogDto:AdvanceSearchLogDto): Promise<AdvanceSearchLogDto>;
}