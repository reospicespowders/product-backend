import { ContentUpdateReports, UpdateContentUpdateReports } from "../dto/content-update-reports.dto";

export interface ContentUpdateReportsRepository {
    create(report: ContentUpdateReports): Promise<ContentUpdateReports>;
    update(report: UpdateContentUpdateReports): Promise<ContentUpdateReports>;
    getAll(page?: number, offset?: number, filters?: Object): Promise<ContentUpdateReports[]>;
    getAllWithoutPagination(filters?: Object): Promise<ContentUpdateReports[]>;
    delete(_id: string): Promise<any>;
    getOne(_id: string): Promise<ContentUpdateReports>;
    getReportsToRegenerate(): Promise<ContentUpdateReports[]>;
    getOuContentUpdateReport(ous: Array<string>): Promise<any>;  
    getContentExperts(ou: string): Promise<any>;
}
