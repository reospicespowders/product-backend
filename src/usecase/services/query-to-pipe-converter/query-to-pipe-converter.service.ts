import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { AdvaneSearchDto, Rule } from 'src/domain/organizational-unit/dto/advance-search-dto';

@Injectable()
export class QueryToPipeConverterService {

    convertQuery(query: AdvaneSearchDto): any {
        if (!query) {
            return {};
        }

        let regexPatterns: any[] = [];

        let fieldMatch = { $and: [] };

        query.rules.map((rule: Rule) => {
            if (!rule.value) {
                return;
            }
            if (rule.operator == 'equal') {
                regexPatterns.push(new RegExp(rule.value))
                fieldMatch.$and.push({
                    fields: {
                        $elemMatch: {
                            label: rule.field,
                            data: {
                                $regex: rule.value ?? '',
                                $options: "i",
                            }
                        }
                    }
                })
            } else if (rule.operator == 'not contains') {
                let notIncludeValue = rule.value?.split(' ').join('|');
                let notIncludeValueRegex: any = new RegExp(`^(?!.*(?:${notIncludeValue})).*`);
                regexPatterns.push(notIncludeValueRegex);
                fieldMatch.$and.push({
                    fields: {
                        $elemMatch: {
                            label: rule.field,
                            data: {
                                $regex: notIncludeValueRegex,
                                $options: "i",
                            }
                        }
                    }
                })
            } else if (rule.operator == 'contains any') {
                let containsValue: any = '';

                if (rule.value.length == 1) {
                    containsValue = new RegExp(this.transformArabicText(rule.value), "i")
                } else {
                    containsValue = rule.value?.split(' ').map(t => this.transformArabicText(t)).join('|');
                }
                regexPatterns.push(new RegExp(containsValue));
                fieldMatch.$and.push({
                    fields: {
                        $elemMatch: {
                            label: this.transformArabicText(rule.field),
                            data: {
                                $regex: containsValue,
                                $options: "i",
                            }
                        }
                    }
                })
            } else if (rule.operator == 'contains all') {
                let allValues = rule.value?.split(' ').map(t => this.transformArabicText(t)).join('.*');
                let allValuesRegex: any = new RegExp(`.*${allValues}`);
                regexPatterns.push(allValuesRegex);
                fieldMatch.$and.push({
                    fields: {
                        $elemMatch: {
                            label: this.transformArabicText(rule.field),
                            data: {
                                $regex: allValuesRegex,
                                $options: "i",
                            }
                        }
                    }
                })
            }
        });


        let allWords: any = query.extras.likeAll?.split(' ').map(t => this.transformArabicText(t));
        let allWordsRegex: any = ''
        if (allWords) {
            if (allWords.length > 1) {
                allWords = allWords.join('.*');
                allWordsRegex = new RegExp(`.*${allWords}`);
            } else {
                allWordsRegex = new RegExp(`.*${allWords[0]}`);
            }
        }

        let notIncludeWords: any = query.extras.notContains?.split(' ');
        let notIncludeRegex: any = '';
        if (notIncludeWords) {
            if (notIncludeWords.length > 1) {
                notIncludeWords = notIncludeWords.join('|');
                notIncludeRegex = new RegExp(notIncludeWords);
            } else {
                notIncludeRegex = new RegExp(notIncludeWords[0]);
            }
        }

        let anyWordsCase: any = '';

        if (query.extras.likeAny && query.extras.likeAny.length == 1) {
            anyWordsCase = new RegExp(`/${this.transformArabicText(query.extras.likeAny)}/i`)
        } else {
            anyWordsCase = query.extras.likeAny?.split(' ').map(t => this.transformArabicText(t)).join('|');
        }



        let basicMatch: any = { $and: [] }

        //Includes all words condition
        if (allWords && allWords.length > 0) {
            regexPatterns.push(allWordsRegex);
            basicMatch.$and.push({
                $or: [
                    {
                        name: {
                            $regex: allWordsRegex,
                            $options: "i",
                        },
                    },
                    {
                        "field.label": {
                            $regex: allWordsRegex,
                            $options: "i",
                        },
                    },
                    {
                        "field.data": {
                            $regex: allWordsRegex,
                            $options: "i",
                        },
                    },
                ],
            })
        }

        //Should Not include condition
        if (notIncludeWords && notIncludeWords.length > 0) {
            regexPatterns.push(notIncludeRegex);
            basicMatch.$and.push({
                $and: [
                    {
                        name: {
                            $not: {
                                $regex: notIncludeRegex,
                                $options: "i",
                            }
                        },
                    },
                    {
                        "fields.label": {
                            $not: {
                                $regex: notIncludeRegex,
                                $options: "i",
                            }
                        },
                    },
                    {
                        "fields.data": {
                            $not: {
                                $regex: notIncludeRegex,
                                $options: "i",
                            }
                        },
                    },
                ],
            })
        }

        //Exact Same word
        if (query.extras.sameWord) {
            regexPatterns.push(new RegExp(query.extras.sameWord));
            basicMatch.$and.push({
                $or: [
                    {
                        name: {
                            $regex: query.extras.sameWord ?? '',
                            $options: "i",
                        },
                    },
                    {
                        "fields.label": {
                            $regex: query.extras.sameWord ?? '',
                            $options: "i",
                        },
                    },
                    {
                        "fields.data": {
                            $regex: query.extras.sameWord ?? '',
                            $options: "i",
                        },
                    },
                ],
            })
        }

        //Any of these words
        if (anyWordsCase) {
            regexPatterns.push(new RegExp(anyWordsCase));
            basicMatch.$and.push({
                $or: [
                    {
                        name: {
                            $regex: anyWordsCase ?? '',
                            $options: "i",
                        },
                    },
                    {
                        "fields.label": {
                            $regex: anyWordsCase ?? '',
                            $options: "i",
                        },
                    },
                    {
                        "fields.data": {
                            $regex: anyWordsCase ?? '',
                            $options: "i",
                        },
                    },
                ],
            },)
        }


        if (query.extras.type) {
            basicMatch['type'] = new Types.ObjectId(query.extras.type);
        }
        if (fieldMatch.$and.length > 0) {
            basicMatch.$and.push(fieldMatch);
        }

        if (regexPatterns.length > 0) {
            basicMatch['pattern'] = regexPatterns;
        }

        if (basicMatch.$and.length > 0) {
            return basicMatch;
        }

        if (basicMatch.type) {
            delete basicMatch.$and;
            return basicMatch;
        }

        return {};
    }


    transformArabicText(text: string) {
        // Define a regex pattern to account for interchangeable letters
        // const regexPattern = text?.replace(/ا|أ|إ/g, '[اأإ]')
        //     .replace(/ة/g, '[ةه]')
        //     .replace(/ؤ/g, '[ؤو]')
        //     .replace(/ى/g, '[ىأإ]')
        //     .replace(/ظ/g, '[ظض]')
        //     .replace(/ء/g, '[ءئ]');
            
        // return regexPattern;
        return text;
    }
}
