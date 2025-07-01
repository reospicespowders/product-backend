import { IntersectionType } from "@nestjs/swagger";


export class MSMeasuringType {
    type: string;
}

export class UpdateMSMeasuringType extends IntersectionType(MSMeasuringType) {
    _id: string;
}