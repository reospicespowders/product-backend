


export class PrintQuestionDTO {
    tags: string[];
    ministriesWithCount: MinistryWithCount[];
}


export class MinistryWithCount {
    ministryId: string;
    count: number;
}