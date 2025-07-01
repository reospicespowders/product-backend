import { IntersectionType } from "@nestjs/swagger";
import { Types } from "mongoose";

export class Settings {
    sign_duration  : number
}


class SettingsWithId {
    _id : Types.ObjectId
}

export class UpdateSettings extends IntersectionType(Settings, SettingsWithId) {
}

