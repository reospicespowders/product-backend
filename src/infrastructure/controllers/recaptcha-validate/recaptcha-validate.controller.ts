import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GenericResponse } from 'src/domain/dto/generic';
import { OpenRoute } from 'src/domain/user-auth/decorators/public-route.decorator';
import { RecaptchaValidateService } from 'src/usecase/services/recaptcha-validate/recaptcha-validate.service';

@Controller('recaptcha-validate')
export class RecaptchaValidateController {
    constructor(private service: RecaptchaValidateService) { }

    @Post()
    @OpenRoute()
    public validateRecaptchaToken(@Body() body: { token: string }): Promise<GenericResponse<boolean>> {
        return this.service.validateRecaptchaToken(body.token);
    }
}
