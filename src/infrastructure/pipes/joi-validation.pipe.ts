import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi'


/**
 *
 * Joi  Validation Pipeline to validate all request body
 * @export
 * @class JoiValidationPipe
 * @implements {PipeTransform}
 */
@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema | any){}
  transform(value: Record<string,any>) {
    try {
      const  { error }  = this.schema.validate(value);
      //If invalid throw error
      if(error) throw new BadRequestException({
        error : 'Validation failed',
        message : error.details[0].message.replace(/\"/g,"")
      })
      return value;
    } catch (error) {
      throw new BadRequestException({
        error : 'Validation failed',
        message : error.message
      })
    }
  }
}
