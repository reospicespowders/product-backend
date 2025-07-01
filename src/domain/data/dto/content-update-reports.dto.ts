export class ContentUpdateReports {
    _id?: string;
    ou: string;
    days: number;
    time: string;
    status: string;
    comments: string;
    agreement: boolean;
    confirmation: boolean;
    manager: ManagerDto;
    sendingDate: string;
    isRegenerated: boolean;
    states: Array<Object>;
    updatedAt: Date;
    createdAt?: Date;
    reportForm: string;
    reportTo: string;

}

export class UpdateContentUpdateReports {
    _id: string;
    ou?: string;
    days?: number;
    time?: string;
    status?: string;
    comments?: string;
    agreement?: boolean;
    confirmation?: boolean;
    manager?: ManagerDto;
    sendingDate?: string;
    isRegenerated?: boolean;
    states?: Array<Object>;
    updatedAt?: Date;
    reportForm?: string;
    reportTo?: string;
}

export class ManagerDto {
    _id: string;
    name: string;
    email: string;
}
