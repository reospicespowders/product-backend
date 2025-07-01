import { Inject, Injectable } from '@nestjs/common';
import { ContentUpdateReportsRepository } from 'src/domain/data/interfaces/content-update-reports.interface';
import { ContentUpdateReports, UpdateContentUpdateReports } from 'src/domain/data/dto/content-update-reports.dto';
import { GenericResponse } from 'src/domain/dto/generic';
import { MailService } from 'src/usecase/services/mail/mail.service';

@Injectable()
export class ContentUpdateReportsService {
    constructor(
        @Inject('ContentUpdateReportsRepository')
        private readonly contentUpdateReportsRepository: ContentUpdateReportsRepository,
        private readonly mailService: MailService
    ) {}

    async create(report: ContentUpdateReports): Promise<ContentUpdateReports> {
        // Get content experts for the OU
        const experts = await this.contentUpdateReportsRepository.getContentExperts(report.ou);

        console.log("---",experts)

        // Create the report
        const createdReport = await this.contentUpdateReportsRepository.create(report);

        // Send email to each expert
        if (experts && Array.isArray(experts)) {
            for (const expert of experts) {
                if (expert.email) {
                    await this.mailService.sendMail({
                        email: expert.email,
                        subject: 'تقرير تحديث المحتوى جديد',
                        template: 'report-templet',
                        context: {
                            name: expert.name || 'الخبير',
                            ouName: report.ou, // Replace with actual OU name if available
                            status: report.status,
                            createdAt: report.createdAt,
                            comment: report.comments,
                            states: report.states || []
                        }
                    });
                }
            }
        }

        return createdReport;
    }

    async update(report: UpdateContentUpdateReports): Promise<ContentUpdateReports> {
        return await this.contentUpdateReportsRepository.update(report);
    }

    async getAll(page: number, offset : number, filters?: Object): Promise<ContentUpdateReports[]> {
        return await this.contentUpdateReportsRepository.getAll(page, offset, filters);
    }

    async getAllWithoutPagination(filters?: Object): Promise<ContentUpdateReports[]> {
        return await this.contentUpdateReportsRepository.getAllWithoutPagination(filters);
    }

    async delete(id: string): Promise<any> {
        return await this.contentUpdateReportsRepository.delete(id);
    }

    async getOne(id: string): Promise<ContentUpdateReports> {
        return await this.contentUpdateReportsRepository.getOne(id);
    }

    async recreateReport(): Promise<ContentUpdateReports> {
        
        let reportsToRegenerate : any[] = await this.contentUpdateReportsRepository.getReportsToRegenerate();


    //    let  reportsToRegenerate :any[] = [{
    //         "_id": "67c34ee7b2aebd3642fc30bf",
    //         "ou": "656ec5ceba096706e35e0e22",
    //         "days": 4,
    //         "time": "12:00 PM",
    //         "status": "SIGNED",
    //         "agreement": true,
    //         "confirmation": true,
    //         "manager": {
    //             "_id": "659e9fabcb1fee9524042d2f",
    //             "name": "زيد إزهار صديقي",
    //             "email": "zaidizhar@intwish.com"
    //         },
    //         "sendingDate": "2025-03-05T18:15:52.530Z",
    //         "isRegenerated": false,
    //         "states": [
    //             {
    //                 "data": [
    //                     {
    //                         "_id": "الخدمات",
    //                         "count": 2
    //                     }
    //                 ],
    //                 "type": "OU CHANGE"
    //             },
    //             {
    //                 "data": [
    //                     {
    //                         "_id": "الخدمات",
    //                         "count": 2
    //                     }
    //                 ],
    //                 "type": "EDIT"
    //             },
    //             {
    //                 "data": [
    //                     {
    //                         "_id": "الأسئلة الشائعة",
    //                         "count": 1
    //                     },
    //                     {
    //                         "_id": "الخدمات",
    //                         "count": 2
    //                     },
    //                     {
    //                         "_id": "التراخيص",
    //                         "count": 1
    //                     }
    //                 ],
    //                 "type": "ADD SERVICE"
    //             },
    //             {
    //                 "data": [
    //                     {
    //                         "_id": "الخدمات",
    //                         "count": 2
    //                     },
    //                     {
    //                         "count": 1
    //                     }
    //                 ],
    //                 "type": "DELETE"
    //             }
    //         ],
    //         "reportForm": "New Report form started",
    //         "reportTo": "2025-03-01T18:16:10.528Z",
    //         "createdAt": "2025-03-01T18:16:07.259Z",
    //         "updatedAt": "2025-03-01T18:16:52.241Z",
    //         "__v": 0,
    //         "comment": "test"
    //     }]

        console.log("Reports to Regenerate: ", reportsToRegenerate);

        if(reportsToRegenerate.length <= 0){
            return;
        }

        for(let report of reportsToRegenerate){
            await this.regenerateReports(report);
        }
     }


    async regenerateReports(report: ContentUpdateReports){
        let oldReport : any = report
        // Create new report with same properties as old report
        let newReport: ContentUpdateReports = {
            ...oldReport, 
            isRegenerated: false,
            status: 'PENDING',
            reportForm: oldReport.createdAt,
            reportTo: new Date(),

        };
        // // Get content updates for each type
        // const types = ['OU CHANGE', 'EDIT', 'ADD SERVICE', 'DELETE'];
        // const ousArray = [oldReport.ou]; // Using the original report's OU

        // // Get content updates for each type with date filters
        // const contentUpdates = await Promise.all(types.map(async type => {
        //     const filters = {
        //         type: type,
        //         ous: ousArray,
        //         status: 'APPROVED',
        //         createdAt: {
        //             $gte: oldReport.createdAt,
        //             $lte: new Date()
        //         }
        //     };

        //     const response = await this.contentUpdateReportsRepository.getAllWithoutPagination(filters);

        //     if (response && response.length > 0) {
        //         return {
        //             data: response[0].data_type,
        //             type: type
        //         };
        //     }
        //     return null;
        // }));

        // Filter out null values and set states
        newReport.states = await this.getContentUpdates(oldReport);
        delete newReport.createdAt;
        delete newReport.updatedAt; 
        delete newReport._id;
        delete newReport['__v'];
        delete newReport['manager']
        delete newReport['hoursBefore']
        delete newReport['matchDateTime']
        
        // await this.contentUpdateReportsRepository.create(newReport);
        await this.contentUpdateReportsRepository.update({
            _id: oldReport._id,
            isRegenerated: true
        });
        return 
    }


    async getContentUpdates(report:any) {
        try {
        
          // Flatten entity tree to get all OUs
          let ousArray: any[] = [];
         
          // Make API calls for each type
          const types = ['OU CHANGE', 'EDIT', 'ADD SERVICE', 'DELETE'];
          const responses = await Promise.all(types.map(type => 
            this.contentUpdateReportsRepository.getAllWithoutPagination({
                type: type,
                ous: ousArray,
                status: 'APPROVED',
                createdAt: {
                    $gte: report.createdAt,
                    $lte: new Date()
                }
            })
          ));
    
          let finalData: any = [];
          
    
          responses.forEach((res:any, index) => {
            if (res) {
              const type = types[index];
              
              // Store stats for this specific type
              if (res.data) {
                const typeStat = res.data[0].data_type
                if (typeStat) {
                  finalData.push({
                    data: typeStat,
                    type: type
                  });
                }
              }
            }
          });
    
          // Store processed data
         return finalData;
    
        } catch (error) {
          console.error('Error in getContentUpdates:', error);
        }
      }

      public async getOuContentUpdateReport(ous: Array<string>): Promise<GenericResponse<any>> {
        try {
            const report = await this.contentUpdateReportsRepository.getOuContentUpdateReport(ous)
            
            const response: GenericResponse<any> = {
                success: true,
                message: 'Report fetched successfully',
                data: report,
            };
            return response;
    
        } catch (error) {
            throw new Error(error);
        }
    }

public async getContentExperts(ou: string): Promise<GenericResponse<any>> {
    try {
        const experts = await this.contentUpdateReportsRepository.getContentExperts(ou);
        
        const response: GenericResponse<any> = {
            success: true,
            message: 'Content experts fetched successfully',
            data: experts,
        };
        return response;

    } catch (error) {
        throw new Error(error);
    }
}

}
