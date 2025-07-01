import { SetMetadata } from '@nestjs/common';

export const Secured = (unit?: string, flag?: string) => SetMetadata('permission', { unit, flag });
