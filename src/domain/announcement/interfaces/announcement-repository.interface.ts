import { UpdateWriteOpResult } from "mongoose";
import { Announcement, UpdateAnnouncement  } from "../dto/announcement.dto";



export interface AnnouncementRepository {
    create(announcementDto: Announcement, uid:string): Promise<Announcement>;
    
    findById(id: string): Promise<Announcement | null>;
    
    getResults(id: string): Promise<Announcement | null>;
    
    getAllActive(uid: string): Promise<Announcement | null>;
   
    findAll(page: number, size: number): Promise<Announcement[]>;
  
    update(announcementDto: UpdateAnnouncement): Promise<UpdateWriteOpResult>;
  
    delete(id: string): Promise<UpdateWriteOpResult | null>;
}