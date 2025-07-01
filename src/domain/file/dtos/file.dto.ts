import { IsNotEmpty } from "class-validator";



export class FileDto {
    @IsNotEmpty()
    file: Express.Multer.File
}