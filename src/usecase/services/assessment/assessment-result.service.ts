import { Inject, Injectable } from '@nestjs/common';
import { UpdateAssessmentResultDto } from 'src/domain/assessment/dto/assessment-result.dto';
import { AssessmentResultRepository } from 'src/domain/assessment/interfaces/assessment-result-repository.interface';
import { AssessmentAttemptRepository } from 'src/domain/assessment/interfaces/assessment-attempt-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { NotificationService } from '../notification/notification.service';
import { AssessmentRepository } from 'src/domain/assessment/interfaces/assessment-repository.interface';
import { MailService } from '../mail/mail.service';


/**
 *Assessment Service
 *
 * @export
 * @class AssessmentService
 */
@Injectable()
export class AssessmentResultService {


    /**
     * Creates an instance of AssessmentService.
     * @param {AssessmentResultRepository} assessmentResultRepository
     * @memberof AssessmentResultService
     */
    constructor(
        @Inject('AssessmentResultRepository') private assessmentResultRepository: AssessmentResultRepository,
        @Inject('AssessmentAttemptRepository') private assessmentAttemptRepository: AssessmentAttemptRepository,
        @Inject('AssessmentRepository') private assessmentRepository: AssessmentRepository,
        private notificationService: NotificationService,
        private mailService: MailService,
    ) { }

    /**
     *Get assessments results paginated
     *
     * @param {number} page
     * @param {number} size
     * @return {*}  {Promise<GenericResponse<AssessmentResult[]>>}
     * @memberof AssessmentResultService
     */
     public async getAssessmentResults(id: string, page: number, size: number, external:string, searchText:string): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.getAssessmentResults(id, page, size, external, searchText);
        return {
            message: "Assessments Results fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get assessments results paginated
     *
     * @return {*}  {Promise<GenericResponse<AssessmentResult[]>>}
     * @memberof AssessmentResultService
     */
     public async generateResults(): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.generateResults();
        return {
            message: "Assessments Results generated Successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Regenerate assessments results
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof AssessmentResultService
     */
    public async regenerateResults(id: string): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.regenerateResults(id);
        return {
            message: "Assessments Results regenerated Successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get assessments results paginated
     *
     * @return {*}  {Promise<GenericResponse<AssessmentResult[]>>}
     * @memberof AssessmentResultService
     */
     public async getGraphData(id: string): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.getGraphData(id);
        return {
            message: "Graph Data fetched Successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get assessments results paginated
     *
     * @return {*}  {Promise<GenericResponse<AssessmentResult[]>>}
     * @memberof AssessmentResultService
     */
     public async update(assessmentResult: UpdateAssessmentResultDto): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.update(assessmentResult);
        return {
            message: "Assessment Result Updated Successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get assessments results in bulk
     *
     * @param {string} idsArray
     * @return {*}  {Promise<any>}
     * @memberof AssessmentResultService
     */
     public async getBulkResults(idsArray: string[],page : number,size: number,filtering:string): Promise<any> {
        let res = await this.assessmentResultRepository.getBulkResults(idsArray,page,size,filtering)
        return {
            message: "Bulk Assessments Results fetched successfully",
            success: true,
            data: res,
        }
    }

    public async getBulkGraph(idsArray: string[]): Promise<any> {
        let res = await this.assessmentResultRepository.getBulkGraph(idsArray)
        return {
            message: "Bulk Assessments Results fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     *find Id By Email
     *
     * @param {string} assessmentId
     * @param {string} email
     * @return {*}  {Promise<GenericResponse<AssessmentResult[]>>}
     * @memberof AssessmentResultService
     */
     public async findIdByEmail(assessmentId: string, email:string): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.findIdByEmail(assessmentId, email);
        return {
            message: "Assessments Results fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get assessment results paginated
     *
     * @return {*}  {Promise<GenericResponse<AssessmentResult[]>>}
     * @memberof AssessmentResultService
     */
    public async generateExcel(idsArray: string[]): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.generateExcel(idsArray);

        // console.log("res",res);

        return {
            message: "Excel Data fetched Successfully",
            success: true,
            data: res,
        }
    }

    public async generateBulkUserExcel(idsArray: string[]): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.generateBulkUserExcel(idsArray);

        // console.log("res",res);

        return {
            message: "Excel Data fetched Successfully",
            success: true,
            data: res,
        }
    }

    public async generatePdf(idsArray: string[]): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.generatePdf(idsArray);
        return {
            message: "PDF Data fetched Successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get assessment results paginated
     *
     * @return {*}  {Promise<GenericResponse<AssessmentResult[]>>}
     * @memberof AssessmentResultService
     */
     public async generateBulkExcel(idsArray: string[]): Promise<GenericResponse<any>> {
        let res = await this.assessmentResultRepository.generateBulkExcel(idsArray);

        // console.log("res",res);

        return {
            message: "Excel Data fetched Successfully",
            success: true,
            data: res,
        }
    }

    public async sendEmailUsers(data: any): Promise<GenericResponse<any>> {
        let res;
        if (data._id)
        {
            let previous = await this.assessmentRepository.findById(data._id);
            let previousEmails = previous?.externals;
            let newEmails = data?.emails;
            let distinctEmails = newEmails?.filter(newEmail => !previousEmails.includes(newEmail));

            if (distinctEmails?.length > 0) {
                distinctEmails.forEach(email => {
                    this.mailService.sendUserAssessmentMail(data.emailLink, email, data.emailText);
                });
            }

            let assessment:any = {
                _id: data._id,
                externals : data.emails
            }

            res = await this.assessmentRepository.update(assessment);
        }
        else{

            let newEmails = data?.emails;
            if (newEmails?.length > 0) {
                newEmails.forEach(email => {
                    this.mailService.sendUserAssessmentMail(data.emailLink, email, data.emailText);
                });
            }
            res = ''
        }

        return {
            message: "Assessments Results fetched successfully",
            success: true,
            data: res,
        }
    }

    public async sendCertEmailUsers(data: any): Promise<GenericResponse<any>> {
        const { emails: newEmails, assessmentId } = data;
        try {
            if (newEmails && newEmails.length > 0) {
                await Promise.all(
                    newEmails.map(email => this.mailService.sendUserAssessmentCertificateMail(email, assessmentId))
                );
            } else {
                const results = await this.assessmentResultRepository.findByAssessmentId(assessmentId);
                if (results && results.length > 0) {
                    await Promise.all(
                        results.map(result => this.mailService.sendUserAssessmentCertificateMail(result.email, assessmentId))
                    );
                } else {
                    return {
                        message: "No results found for the provided assessment ID",
                        success: false,
                        data: null,
                    };
                }
            }
            return {
                message: "Assessment certificates sent successfully",
                success: true,
                data: null,
            };
        } catch (error) {
            // console.log('EMIAL ERROR', error);
            return {
                message: "Failed to send assessment certificates",
                success: false,
                data: { error: error.message },
            };
        }
    }
    

    public async deleteUsers(data: any): Promise<GenericResponse<any>> {
        let newEmails = data?.emails;
    
        for (let email of newEmails) {
            await this.assessmentAttemptRepository.deleteByEmail(data._id, email);
            await this.assessmentResultRepository.delete(data._id, email)
        }
    
        return {
            message: "User Deleted Successfully",
            success: true,
            data: '',
        };
    }
}
