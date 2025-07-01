import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { GenericResponse } from 'src/domain/dto/generic';
import { UserAuthService } from '../user-auth/user-auth.service';

@Injectable()
export class FileService {

    constructor(private userService: UserAuthService) { }

    public async uploadFile(file: Express.Multer.File, type: string, uid: string): Promise<GenericResponse<string>> {
        try {
            const size = file.size;
            let nameArr = file.originalname.split('.');
            const extension = nameArr[nameArr.length - 1].toLowerCase();
            let dir: string, allowedExtensions: RegExp;

            switch (type) {
                case "ORGANIZATIONAL_UNIT":
                    allowedExtensions = /png|jpeg|jpg|gif/;
                    let orgCheck = this.checkExtension(allowedExtensions, extension, "Unsupported Extension!");
                    if (!orgCheck.success) return orgCheck;
                    dir = "ous";
                    break;

                case "PROFILE":
                    allowedExtensions = /png|jpeg|jpg|gif/;
                    let profileCheck = this.checkExtension(allowedExtensions, extension, "Unsupported Extension!");
                    if (!profileCheck.success) return profileCheck;
                    dir = "profile";
                    break;

                case "ASSESSMENT":
                    allowedExtensions = /png|jpeg|jpg|gif/;
                    let assessmentCheck = this.checkExtension(allowedExtensions, extension, "Unsupported Extension!");
                    if (!assessmentCheck.success) return assessmentCheck;
                    dir = "assessment";
                    break;

                case "SURVEY":
                    allowedExtensions = /png|jpeg|jpg|gif/;
                    let surveyCheck = this.checkExtension(allowedExtensions, extension, "Unsupported Extension!");
                    if (!surveyCheck.success) return surveyCheck;
                    dir = "survey";
                    break;

                case "QUESTION":
                    allowedExtensions = /png|jpeg|jpg|gif/;
                    let questionCheck = this.checkExtension(allowedExtensions, extension, "Unsupported Extension!");
                    if (!questionCheck.success) return questionCheck;
                    dir = "question";
                    break;

                case "TRAINING_MATERIAL":
                    allowedExtensions = /png|jpe?g|gif|pdf|mp3|xlsx?|docx?|mp4|mov|wmv|avi|mkv|webm/;
                    let materialCheck = this.checkExtension(allowedExtensions, extension, "Unsupported Extension!");
                    if (!materialCheck.success) return materialCheck;
                    dir = "training_material";
                    break;

                case "TRAINING_VEDIOS":
                    allowedExtensions = /mp4|mov|wmv|avi|mkv|webm/;
                    let videoCheck = this.checkExtension(allowedExtensions, extension, "Unsupported Extension!");
                    if (!videoCheck.success) return videoCheck;
                    dir = "training_vedios";
                    break;

                case "KNOWLEDGE_LIBRARY":
                    let notAllowedExtensions = /exe|php|dmg/;
                    if (notAllowedExtensions.test(extension))
                        return new GenericResponse<string>(false, "Unsupported Extension!", null);
                    dir = "knowledge_library";
                    break;

                case "data":
                    let notAllowedExt = /exe|php|dmg/;
                    if (notAllowedExt.test(extension))
                        return new GenericResponse<string>(false, "Unsupported Extension!", null);
                    dir = "data";
                    break;

                case "ANNOUNCEMENTS":
                    allowedExtensions = /png|jpeg|jpg|gif/;
                    let annoCheck = this.checkExtension(allowedExtensions, extension, "Unsupported Extension!");
                    if (!annoCheck.success) return annoCheck;
                    dir = "announcements";
                    break;

                default:
                    return new GenericResponse<string>(
                        false,
                        "Type required or invalid type. Valid: (PROFILE, ASSESSMENT, SURVEY, QUESTION, TRAINING_MATERIAL, TRAINING_VEDIOS, ANNOUNCEMENTS ,data)!",
                        null
                    );
            }

            let url = this.saveFile(file, dir, extension);

            if (type == "PROFILE") {
                await this.userService.updateProfile("/public" + url, uid);
            }

            return new GenericResponse<string>(true, "File uploaded successfully", "/public" + url);

        } catch (e) {
            console.error(e);
            return new GenericResponse<string>(false, "An error occurred during file upload", null);
        }
    }

    private checkExtension(allowedExtensions: RegExp, extension: string, message: string): GenericResponse<string> {
        if (!allowedExtensions.test(extension)) {
            return new GenericResponse<string>(false, message, null);
        }
        return new GenericResponse<string>(true, "Extension is valid", null);
    }

    private saveFile(file: Express.Multer.File, dir: string, extension: string): string {
        try {
            let md5 = this.calculateFileMd5(file);
            const URL = `/${dir}/` + md5 + '.' + extension;
            const basedir = path.resolve(__dirname, '../../../../')
            const exectDir = path.join(basedir, 'public', URL);

            fs.writeFileSync(exectDir, file.buffer)
            return URL;
        } catch (e) {
            // console.log(e);
        }

    }

    private calculateFileMd5(file: Express.Multer.File): string {
        return crypto.createHash('md5').update(file.buffer).digest('hex');
    }
}
