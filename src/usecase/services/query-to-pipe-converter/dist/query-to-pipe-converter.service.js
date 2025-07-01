"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.QueryToPipeConverterService = void 0;
var common_1 = require("@nestjs/common");
var mongoose_1 = require("mongoose");
var QueryToPipeConverterService = /** @class */ (function () {
    function QueryToPipeConverterService() {
    }
    QueryToPipeConverterService.prototype.convertQuery = function (query) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        if (!query) {
            return {};
        }
        var regexPatterns = [];
        var fieldMatch = { $and: [] };
        query.rules.map(function (rule) {
            var _a, _b, _c, _d;
            if (!rule.value) {
                return;
            }
            if (rule.operator == 'equal') {
                regexPatterns.push(new RegExp(rule.value));
                fieldMatch.$and.push({
                    fields: {
                        $elemMatch: {
                            label: rule.field,
                            data: {
                                $regex: (_a = rule.value) !== null && _a !== void 0 ? _a : '',
                                $options: "i"
                            }
                        }
                    }
                });
            }
            else if (rule.operator == 'not contains') {
                var notIncludeValue = (_b = rule.value) === null || _b === void 0 ? void 0 : _b.split(' ').join('|');
                var notIncludeValueRegex = new RegExp("^(?!.*(?:" + notIncludeValue + ")).*");
                regexPatterns.push(notIncludeValueRegex);
                fieldMatch.$and.push({
                    fields: {
                        $elemMatch: {
                            label: rule.field,
                            data: {
                                $regex: notIncludeValueRegex,
                                $options: "i"
                            }
                        }
                    }
                });
            }
            else if (rule.operator == 'contains any') {
                var containsValue = '';
                if (rule.value.length == 1) {
                    containsValue = new RegExp(_this.transformArabicText(rule.value), "i");
                }
                else {
                    containsValue = (_c = rule.value) === null || _c === void 0 ? void 0 : _c.split(' ').map(function (t) { return _this.transformArabicText(t); }).join('|');
                }
                regexPatterns.push(new RegExp(containsValue));
                fieldMatch.$and.push({
                    fields: {
                        $elemMatch: {
                            label: _this.transformArabicText(rule.field),
                            data: {
                                $regex: containsValue,
                                $options: "i"
                            }
                        }
                    }
                });
            }
            else if (rule.operator == 'contains all') {
                var allValues = (_d = rule.value) === null || _d === void 0 ? void 0 : _d.split(' ').map(function (t) { return _this.transformArabicText(t); }).join('.*');
                var allValuesRegex = new RegExp(".*" + allValues);
                regexPatterns.push(allValuesRegex);
                fieldMatch.$and.push({
                    fields: {
                        $elemMatch: {
                            label: _this.transformArabicText(rule.field),
                            data: {
                                $regex: allValuesRegex,
                                $options: "i"
                            }
                        }
                    }
                });
            }
        });
        var allWords = (_a = query.extras.likeAll) === null || _a === void 0 ? void 0 : _a.split(' ').map(function (t) { return _this.transformArabicText(t); });
        var allWordsRegex = '';
        if (allWords) {
            if (allWords.length > 1) {
                allWords = allWords.join('.*');
                allWordsRegex = new RegExp(".*" + allWords);
            }
            else {
                allWordsRegex = new RegExp(".*" + allWords[0]);
            }
        }
        var notIncludeWords = (_b = query.extras.notContains) === null || _b === void 0 ? void 0 : _b.split(' ');
        var notIncludeRegex = '';
        if (notIncludeWords) {
            if (notIncludeWords.length > 1) {
                notIncludeWords = notIncludeWords.join('|');
                notIncludeRegex = new RegExp(notIncludeWords);
            }
            else {
                notIncludeRegex = new RegExp(notIncludeWords[0]);
            }
        }
        var anyWordsCase = '';
        if (query.extras.likeAny && query.extras.likeAny.length == 1) {
            anyWordsCase = new RegExp("/" + this.transformArabicText(query.extras.likeAny) + "/i");
        }
        else {
            anyWordsCase = (_c = query.extras.likeAny) === null || _c === void 0 ? void 0 : _c.split(' ').map(function (t) { return _this.transformArabicText(t); }).join('|');
        }
        var basicMatch = { $and: [] };
        //Includes all words condition
        if (allWords && allWords.length > 0) {
            regexPatterns.push(allWordsRegex);
            basicMatch.$and.push({
                $or: [
                    {
                        name: {
                            $regex: allWordsRegex,
                            $options: "i"
                        }
                    },
                    {
                        "field.label": {
                            $regex: allWordsRegex,
                            $options: "i"
                        }
                    },
                    {
                        "field.data": {
                            $regex: allWordsRegex,
                            $options: "i"
                        }
                    },
                ]
            });
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
                                $options: "i"
                            }
                        }
                    },
                    {
                        "fields.label": {
                            $not: {
                                $regex: notIncludeRegex,
                                $options: "i"
                            }
                        }
                    },
                    {
                        "fields.data": {
                            $not: {
                                $regex: notIncludeRegex,
                                $options: "i"
                            }
                        }
                    },
                ]
            });
        }
        //Exact Same word
        if (query.extras.sameWord) {
            regexPatterns.push(new RegExp(query.extras.sameWord));
            basicMatch.$and.push({
                $or: [
                    {
                        name: {
                            $regex: (_d = query.extras.sameWord) !== null && _d !== void 0 ? _d : '',
                            $options: "i"
                        }
                    },
                    {
                        "fields.label": {
                            $regex: (_e = query.extras.sameWord) !== null && _e !== void 0 ? _e : '',
                            $options: "i"
                        }
                    },
                    {
                        "fields.data": {
                            $regex: (_f = query.extras.sameWord) !== null && _f !== void 0 ? _f : '',
                            $options: "i"
                        }
                    },
                ]
            });
        }
        //Any of these words
        if (anyWordsCase) {
            regexPatterns.push(new RegExp(anyWordsCase));
            basicMatch.$and.push({
                $or: [
                    {
                        name: {
                            $regex: anyWordsCase !== null && anyWordsCase !== void 0 ? anyWordsCase : '',
                            $options: "i"
                        }
                    },
                    {
                        "fields.label": {
                            $regex: anyWordsCase !== null && anyWordsCase !== void 0 ? anyWordsCase : '',
                            $options: "i"
                        }
                    },
                    {
                        "fields.data": {
                            $regex: anyWordsCase !== null && anyWordsCase !== void 0 ? anyWordsCase : '',
                            $options: "i"
                        }
                    },
                ]
            });
        }
        if (query.extras.type) {
            basicMatch['type'] = new mongoose_1.Types.ObjectId(query.extras.type);
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
    };
    QueryToPipeConverterService.prototype.transformArabicText = function (text) {
        // Define a regex pattern to account for interchangeable letters
        // const regexPattern = text?.replace(/ا|أ|إ/g, '[اأإ]')
        //     .replace(/ة/g, '[ةه]')
        //     .replace(/ؤ/g, '[ؤو]')
        //     .replace(/ى/g, '[ىأإ]')
        //     .replace(/ظ/g, '[ظض]')
        //     .replace(/ء/g, '[ءئ]');
        // return regexPattern;
        return text;
    };
    QueryToPipeConverterService = __decorate([
        common_1.Injectable()
    ], QueryToPipeConverterService);
    return QueryToPipeConverterService;
}());
exports.QueryToPipeConverterService = QueryToPipeConverterService;
