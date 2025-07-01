import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MSProject, UpdateMSProject } from 'src/domain/mystory-shopper/dto/ms-project.dto';
import { MSProjectRepository } from 'src/domain/mystory-shopper/interfaces/ms-project-repository.interface';
import { GenericResponse } from 'src/domain/dto/generic';
import { AuthRepository } from 'src/domain/user-auth/interfaces/auth-repository.interface';
import { MailService } from '../mail/mail.service';
import { JsonService } from '../json/json.service';
import * as path from 'path';

const basePath = process.env.NODE_ENV === 'production'
   ? path.join('C:/kgate/kgateBeta/dist')
   : path.join(__dirname);

/**
 *MSProject Service
 *
 * @export
 * @class MSProjectService
 */
@Injectable()
export class MSProjectService {

    /**
     * Creates an instance of MSProjectService.
     * @param {MSProjectRepository} MSProjectRepository
     * @memberof MSProjectService
     */
    constructor(
        @Inject('MSProjectRepository') private msProjectRepository: MSProjectRepository,
        @Inject('AuthRepository') private userRepository: AuthRepository,
        private mailService: MailService,
        private jsonService: JsonService,
    ) { }


    /**
     *Create a new project
     *
     * @param {MSProject} msProjectDto
     * @return {*}  {Promise<GenericResponse<MSProject>>}
     * @memberof MSProjectService
     */
    async create(msProjectDto: MSProject): Promise<GenericResponse<MSProject>> {
        const createdMSProject = await this.msProjectRepository.create(msProjectDto);

        if (createdMSProject) {
            if (createdMSProject.vendor) {
                for (const id of createdMSProject.vendor) {
                    await this.sendEmail(id, 'vendor', 'vendor');
                }
            }
    
            if (createdMSProject.internalPm) {
                await this.sendEmail(createdMSProject.internalPm, 'vendor', 'vendor');
            }
        }

        return {
            success: true,
            message: 'MSProject created successfully.',
            data: createdMSProject
        };
    }

    async sendEmail(userId, messagesKey, templateName) {
        try {
            const userEmail = await this.userRepository.findOne({ _id: userId }, ['email', '_id']);
            if (userEmail) {
                let messages = await this.jsonService.parseJson(path.join(basePath, 'domain/json/email-messages/email-messages.json'));
                await this.mailService.sendMail({
                    subject: messages[messagesKey].subject,
                    template: templateName,
                    context: {
                        text: messages[messagesKey].text,
                        heading: messages[messagesKey].heading
                    },
                    email: userEmail.email
                });
            } else {
                // console.log(`User not found for ID: ${userId}`);
            }
        } catch (e) {
            // console.log('EMAIL ERROR', e);
        }
    }
    

    /**
     *Get an existing project by id
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<MSProject>>}
     * @memberof MSProjectService
     */
    async get(id: string): Promise<GenericResponse<MSProject>> {
        const msProject = await this.msProjectRepository.findById(id);
        if (!msProject) {
            throw new NotFoundException('MSProject not found');
        }
        return {
            success: true,
            message: 'MSProject retrieved successfully.',
            data: msProject
        };
    }

    /**
     *Get all projects paginated
     *
     * @param {number} page
     * @param {number} size
     * @param {string[]} tags
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSProjectService
     */
    async getAll(page: number, size: number, tags: string[]): Promise<GenericResponse<any>> {
        const msProjects = await this.msProjectRepository.findAll(page, size, tags);
        return {
            success: true,
            message: 'MSProjects retrieved successfully.',
            data: msProjects
        };
    }

    /**
     *Update an existing project
     *
     * @param {string} id
     * @param {UpdateMSProject} msProjectDto
     * @return {*}  {Promise<GenericResponse<MSProject>>}
     * @memberof MSProjectService
     */
    async update(id: string, msProjectDto: UpdateMSProject): Promise<GenericResponse<MSProject>> {
        const msProject = await this.msProjectRepository.findById(id);
        if (!msProject) {
            throw new NotFoundException('MSProject not found');
        }
        await this.msProjectRepository.update(id, msProjectDto);
        const updatedMSProject: any = await this.msProjectRepository.findById(id);
        return {
            success: true,
            message: 'MSProject updated successfully.',
            data: updatedMSProject.data
        };
    }

    /**
     *Get all vendor projects paginated
     *
     * @param {string} vendorId
     * @param {number} page
     * @param {number} size
     * @return {*} 
     * @memberof MSProjectService
     */
    async getVendorProjects(vendorId: string, page: number, size: number) {
        const msProjects = await this.msProjectRepository.getVendorProjects(vendorId, page, size);
        return {
            success: true,
            message: 'MSProjects retrieved successfully.',
            data: msProjects
        };
    }

    /**
     *Delete an existing project
     *
     * @param {string} id
     * @return {*}  {Promise<GenericResponse<any>>}
     * @memberof MSProjectService
     */
    async delete(id: string): Promise<GenericResponse<any>> {
        const msProject = await this.msProjectRepository.findById(id);
        if (!msProject) {
            throw new NotFoundException('MSProject not found');
        }
        const deletedMSProject = await this.msProjectRepository.delete(id);
        if (!deletedMSProject) {
            throw new NotFoundException('MSProject not found');
        }

        return {
            success: true,
            message: 'MSProject deleted successfully.',
            data: ''
        };
    }
}
