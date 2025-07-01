


export class AdvaneSearchDto {
    rules: Array<Rule>;
    extras: Extras;
}

export class Rule {
    field:string;
    operator:string;
    value:string;
}

export class Extras {
    likeAll: string;
    likeAny: string;
    notContains: string;
    sameWord: string;
    type:string;
    ou?:number;
}