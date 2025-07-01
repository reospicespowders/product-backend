import { Inject, Injectable } from '@nestjs/common';
import { UpdateSurveyResultDto } from 'src/domain/survey/dto/survey-result.dto';
import { SurveyResultRepository } from 'src/domain/survey/interfaces/survey-result-repository.interface';
import { SurveyAttemptRepository } from 'src/domain/survey/interfaces/survey-attempt-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { NotificationService } from '../notification/notification.service';
import { SurveyRepository } from 'src/domain/survey/interfaces/survey-repository.interface';
import { MailService } from '../mail/mail.service';

/**
 *Survey Service
 *
 * @export
 * @class SurveyService
 */
@Injectable()
export class SurveyResultService {

    /**
     * Creates an instance of SurveyService.
     * @param {SurveyResultRepository} surveyResultRepository
     * @memberof SurveyResultService
     */
    constructor(
        @Inject('SurveyResultRepository') private surveyResultRepository: SurveyResultRepository,
        @Inject('SurveyAttemptRepository') private surveyAttemptRepository: SurveyAttemptRepository,
        @Inject('SurveyRepository') private surveyRepository: SurveyRepository,
        private notificationService: NotificationService,
        private mailService: MailService,
    ) { }

    /**
     *Get surveys results paginated
     *
     * @param {number} page
     * @param {number} size
     * @return {*}  {Promise<GenericResponse<SurveyResult[]>>}
     * @memberof SurveyResultService
     */
     public async getSurveyResults(id: string, page: number, size: number, courseId:string, ratingFor:string, ratingForID:string, external:string, searchText:string): Promise<GenericResponse<any>> {
        let res = await this.surveyResultRepository.getSurveyResults(id, page, size, courseId, ratingFor, ratingForID, external, searchText);
        return {
            message: "Surveys Results fetched successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get surveys results paginated
     *
     * @return {*}  {Promise<GenericResponse<SurveyResult[]>>}
     * @memberof SurveyResultService
     */
     public async generateResults(): Promise<GenericResponse<any>> {
        let res = await this.surveyResultRepository.generateResults();
        return {
            message: "Surveys Results generated Successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get surveys results paginated
     *
     * @return {*}  {Promise<GenericResponse<SurveyResult[]>>}
     * @memberof SurveyResultService
     */
     public async generateExcel(idsArray: string[], courseId:string, ratingFor:string, ratingForID:string): Promise<GenericResponse<any>> {
        let res = await this.surveyResultRepository.generateExcel(idsArray,courseId, ratingFor, ratingForID);
        return {
            message: "Excel Data fetched Successfully",
            success: true,
            data: res,
        }
    }

    public async generatePdf(idsArray: string[]): Promise<GenericResponse<any>> {
        let res = await this.surveyResultRepository.generatePdf(idsArray);
        return {
            message: "Excel Data fetched Successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get surveys results paginated
     *
     * @return {*}  {Promise<GenericResponse<SurveyResult[]>>}
     * @memberof SurveyResultService
     */
     public async getGraphData(id: string, courseId:string, ratingFor:string, ratingForID:string): Promise<GenericResponse<any>> {
        let res = await this.surveyResultRepository.getGraphData(id,courseId, ratingFor, ratingForID);
        return {
            message: "Graph Data fetched Successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get surveys results paginated
     *
     * @return {*}  {Promise<GenericResponse<SurveyResult[]>>}
     * @memberof SurveyResultService
     */
     public async update(surveyResult: UpdateSurveyResultDto): Promise<GenericResponse<any>> {
        let res = await this.surveyResultRepository.update(surveyResult);
        return {
            message: "Survey Result Updated Successfully",
            success: true,
            data: res,
        }
    }

    /**
     *Get surveys results in bulk
     *
     * @param {string} idsArray
     * @return {*}  {Promise<any>}
     * @memberof SurveyResultService
     */
     public async getBulkResults(idsArray: string[]): Promise<any> {
        let res = await this.surveyResultRepository.getBulkResults(idsArray)
        return {
            message: "Bulk Surveys Results fetched successfully",
            success: true,
            data: res,
        }
    }

    public async sendEmailUsers(data: any): Promise<GenericResponse<any>> {
        let res;
        if (data._id)
        {
            let previous = await this.surveyRepository.findById(data._id);
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

            let res = await this.surveyRepository.update(assessment);
        }
        else{
            let newEmails = data?.emails;
            if (newEmails?.length > 0) {
                newEmails.forEach(email => {
                    this.mailService.sendUserAssessmentMail(data.emailLink, email, data.emailText);
                });
            }
            res = '';
        }

        return {
            message: "Email Sent successfully",
            success: true,
            data: res,
        }
    }

    public async deleteUsers(data: any): Promise<GenericResponse<any>> {
        let newEmails = data?.emails;
    
        for (let email of newEmails) {
            await this.surveyResultRepository.deleteByEmail(data._id, email, '');
            await this.surveyAttemptRepository.deleteByEmail(data._id, email, '')
        }
    
        return {
            message: "User Deleted Successfully",
            success: true,
            data: '',
        };
    }
    
}
