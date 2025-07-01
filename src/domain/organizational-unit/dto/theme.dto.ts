import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";

/**
 * Theme class for managing application themes
 * @export
 * @class Theme
 */
export class Theme {
    theme: any;
    description?: string;
    created_by: Types.ObjectId;
    updated_by: Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}

/**
 * Update theme DTO
 * @export
 * @class UpdateThemeDto
 * @extends {IntersectionType(Theme)}
 */
export class UpdateThemeDto extends IntersectionType(Theme) {
    _id: string;
}

/**
 * Create theme DTO
 * @export
 * @class CreateThemeDto
 */
export class CreateThemeDto extends Theme {
    // Additional fields specific to creation if needed
} 