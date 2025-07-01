import { UpdateWriteOpResult } from "mongoose";
import { MSChannel, UpdateMSChannel } from "../dto/ms-channel.dto";



/**
 *Mystery Shopper Channels Repsoitory Interface
 *
 * @export
 * @interface MSChannelRepository
 */
export interface MSChannelRepository {
    findByProjectId(id: string): Promise<MSChannel[]>;
    
    getVisitProjectId(id: string, sessionId:string): Promise<MSChannel[]>;

    create(questionBankDto: MSChannel): Promise<MSChannel>;

    createMany(msChannelDto: MSChannel[]): Promise<MSChannel[]>;

    findById(id: string): Promise<MSChannel | null>;

    findAll(page: number, size: number, tags: string[]): Promise<MSChannel[]>;

    update(id: string, questionBankDto: UpdateMSChannel): Promise<UpdateWriteOpResult>;

    delete(id: string): Promise<UpdateWriteOpResult | null>;

    getChannelsWithCriterias(id: string, page: number, size: number):Promise<any>;
}