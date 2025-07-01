import { Inject, Injectable } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { SurveyTag, SurveyType, UpdateSurveyTagDto, UpdateSurveyTypeDto } from 'src/domain/survey/dto/survey-type.dto';
import { SurveyTypeRepository } from 'src/domain/survey/interfaces/survey-type-repository.interface';

@Injectable()
export class SurveyTypeService {

    constructor(@Inject('SurveyTypeRepository') private readonly surveyTypeRepository: SurveyTypeRepository) { }

    public async getAllTags(type: string): Promise<GenericResponse<SurveyTag[]>> {
        let res = await this.surveyTypeRepository.getSurveyTags(type);
        return {
            message: "Survey Tags fetched successfully",
            success: true,
            data: res,
        }
    }

    public async updateSurveyTag(updateSurveyTagDto: UpdateSurveyTagDto): Promise<GenericResponse<null>> {
        let res = await this.surveyTypeRepository.updateSurveyTag(updateSurveyTagDto);
        return res.modifiedCount > 0 ? {
            message: "Survey Tags updated successfully",
            success: true,
            data: null,
        } : {
            message: "Failed to update survey tag",
            success: false,
            data: null,
        }
    }

    public async createSurveyTag(tag: SurveyTag): Promise<GenericResponse<SurveyTag>> {
        let res = await this.surveyTypeRepository.createSurveyTag(tag);
        return {
            message: "Survey Tags created successfully",
            success: true,
            data: res,
        }
    }


    public async deleteSurveyTag(id: string): Promise<GenericResponse<null>> {
        let res = await this.surveyTypeRepository.deleteSurveyTag(id);
        if (res.deletedCount == 0) {
            return {
                message: "Failed to delete survey type",
                success: false,
                data: null
            }
        }
        return {
            message: "Survey type deleted successfully",
            success: true,
            data: null
        }
    }


    public async create(survey: SurveyType,uid: string): Promise<GenericResponse<SurveyType>> {
        let res = await this.surveyTypeRepository.create(survey, uid);
        return {
            message: "Survey Type created successfully",
            success: true,
            data: res,
        }
    }

    public async getAllCategorized(tags: string[]): Promise<GenericResponse<any>> {
        let res = await this.surveyTypeRepository.getAllCategorized(tags);
        return {
            message: "Surveys fetched successfully",
            success: true,
            data: res
        };
    }

    public async update(survey: UpdateSurveyTypeDto): Promise<GenericResponse<null>> {
        let res = await this.surveyTypeRepository.update(survey);
        if (res.modifiedCount == 0) {
            return {
                message: "Failed to update survey type",
                success: false,
                data: null
            }
        }
        return {
            message: "Survey type updated successfully",
            success: true,
            data: null
        }
    }
    public async delete(_id: string): Promise<GenericResponse<null>> {
        let res = await this.surveyTypeRepository.delete(_id);
        if (res.deletedCount == 0) {
            return {
                message: "Failed to delete survey type",
                success: false,
                data: null
            }
        }
        return {
            message: "Survey type deleted successfully",
            success: true,
            data: null
        }
    }
    public async getAll(): Promise<GenericResponse<SurveyType[]>> {
        let res = await this.surveyTypeRepository.getAll();
        return {
            message: "Survey Types fetched successfully",
            success: true,
            data: res
        }
    }

    public async getAllTagged(tags: string[]): Promise<GenericResponse<SurveyType[]>> {
        let res = await this.surveyTypeRepository.getAllTagged(tags);
        return {
            message: "Survey Types fetched successfully",
            success: true,
            data: res
        }
    }

}
