import { Injectable,Inject } from '@nestjs/common';
import { AdvanceSearchLogDto } from 'src/domain/advance-search-logs/dto/advance-search-log.dto';
import { AdvanceSearchLogsRepository } from 'src/domain/advance-search-logs/interfaces/advance-search-log-repository.interface';

@Injectable()
export class AdvanceSearchLogsService {

    constructor(@Inject('AdvanceSearchLogsRepository') private advanceSearchLogsRepository: AdvanceSearchLogsRepository) { }

    public async createLog(log:AdvanceSearchLogDto):Promise<AdvanceSearchLogDto> {
        return this.advanceSearchLogsRepository.createLog(log);
    }
}
