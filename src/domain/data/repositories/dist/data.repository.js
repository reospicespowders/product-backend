"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.DataRepositoryImpl = void 0;
var common_1 = require("@nestjs/common");
var mongoose_1 = require("@nestjs/mongoose");
var DataRepositoryImpl = /** @class */ (function () {
    function DataRepositoryImpl(DataModel, DataViewModel, ContentUpdateViewModel) {
        this.DataModel = DataModel;
        this.DataViewModel = DataViewModel;
        this.ContentUpdateViewModel = ContentUpdateViewModel;
    }
    DataRepositoryImpl.prototype.getDataFromOuAndType = function (ou, type) {
        try {
            var pipe = [
                {
                    '$project': {
                        'id': 1,
                        'name': 1,
                        'type': 1,
                        'score': 1,
                        'ous': 1
                    }
                }, {
                    '$lookup': {
                        'from': 'data-types',
                        'localField': 'type',
                        'foreignField': '_id',
                        'as': 'type'
                    }
                }, {
                    '$addFields': {
                        'type': {
                            '$first': '$type'
                        }
                    }
                }, {
                    '$graphLookup': {
                        'from': 'organization-units',
                        'startWith': '$ous',
                        'connectFromField': 'parent',
                        'connectToField': '_id',
                        'depthField': 'depth',
                        'as': 'ous'
                    }
                }, {
                    '$addFields': {
                        'ous': {
                            '$map': {
                                'input': '$ous',
                                'in': '$$this.id'
                            }
                        }
                    }
                }, {
                    '$match': {
                        'ous': ou,
                        'type.arabic': type
                    }
                }
            ];
            return this.DataModel.aggregate(pipe);
        }
        catch (error) {
            // console.log(error);
            return null;
        }
    };
    DataRepositoryImpl.prototype.create = function (data) {
        try {
            return this.DataModel.create(data);
        }
        catch (error) {
            return null;
        }
    };
    DataRepositoryImpl.prototype.dataCleanQuery = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataPipe;
            return __generator(this, function (_a) {
                try {
                    dataPipe = [
                        {
                            '$lookup': {
                                'from': 'organization-units',
                                'localField': 'ous',
                                'foreignField': '_id',
                                'as': 'result'
                            }
                        }, {
                            '$addFields': {
                                'result': {
                                    '$first': '$result'
                                }
                            }
                        }, {
                            '$match': {
                                'result': {
                                    '$ne': null
                                }
                            }
                        }, {
                            '$unset': 'result'
                        }, {
                            '$out': 'data'
                        }
                    ];
                    this.DataModel.aggregate(dataPipe);
                }
                catch (e) {
                    throw e;
                }
                return [2 /*return*/];
            });
        });
    };
    DataRepositoryImpl.prototype.getOneEnhanced = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var pipe, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // console.log(id);
                        pipe = [
                            {
                                '$match': {
                                    'id': Number(id)
                                }
                            }, {
                                '$graphLookup': {
                                    'from': 'organization-units',
                                    'startWith': '$ous',
                                    'connectFromField': 'parent',
                                    'connectToField': '_id',
                                    'depthField': 'depth',
                                    'as': 'breadcrumbs'
                                }
                            }, {
                                '$addFields': {
                                    'breadcrumbs': {
                                        '$map': {
                                            'input': '$breadcrumbs',
                                            'in': {
                                                '_id': '$$this._id',
                                                'label': '$$this.name',
                                                'id': '$$this.id',
                                                'icon': '$$this.image_sq',
                                                'depth': '$$this.depth'
                                            }
                                        }
                                    }
                                }
                            }, {
                                '$lookup': {
                                    'from': 'data-types',
                                    'localField': 'type',
                                    'foreignField': '_id',
                                    'as': 'type'
                                }
                            }, {
                                '$addFields': {
                                    'type': {
                                        '$first': '$type'
                                    }
                                }
                            }, {
                                '$unwind': {
                                    'path': '$fields'
                                }
                            }, {
                                '$lookup': {
                                    'from': 'data-fields',
                                    'localField': 'fields.type',
                                    'foreignField': '_id',
                                    'as': 'fields.type'
                                }
                            }, {
                                '$addFields': {
                                    'fields.type': {
                                        '$first': '$fields.type'
                                    },
                                    'fields.field': '$fields.type'
                                }
                            }, {
                                '$lookup': {
                                    'from': 'field-types',
                                    'localField': 'fields.type.type',
                                    'foreignField': '_id',
                                    'as': 'fields.type'
                                }
                            }, {
                                '$addFields': {
                                    'fields.type': {
                                        '$first': '$fields.type'
                                    },
                                    'fields.label': {
                                        '$ifNull': [
                                            {
                                                '$first': '$fields.field'
                                            }, '$fields.label'
                                        ]
                                    },
                                    'fields.field': {
                                        '$first': '$fields.field'
                                    }
                                }
                            }, {
                                '$addFields': {
                                    'service': {
                                        '$cond': {
                                            'if': {
                                                '$eq': [
                                                    '$fields.type.name', 'Data Item'
                                                ]
                                            },
                                            'then': {
                                                '$convert': {
                                                    'input': '$fields.data',
                                                    'to': 'objectId',
                                                    'onError': '',
                                                    'onNull': ''
                                                }
                                            },
                                            'else': null
                                        }
                                    }
                                }
                            }, {
                                '$lookup': {
                                    'from': 'view_data_dup',
                                    'localField': 'service',
                                    'foreignField': '_id',
                                    'as': 'service'
                                }
                            }, {
                                '$addFields': {
                                    'service': {
                                        '$first': '$service'
                                    }
                                }
                            }, {
                                '$addFields': {
                                    'fields.data': {
                                        '$ifNull': [
                                            '$service', '$fields.data', '$service'
                                        ]
                                    }
                                }
                            }, {
                                '$group': {
                                    '_id': '$_id',
                                    'id': {
                                        '$first': '$id'
                                    },
                                    'name': {
                                        '$first': '$name'
                                    },
                                    'type': {
                                        '$first': '$type'
                                    },
                                    'fields': {
                                        '$addToSet': '$fields'
                                    },
                                    'ous': {
                                        '$first': '$ous'
                                    },
                                    'active': {
                                        '$first': '$active'
                                    },
                                    'comments': {
                                        '$first': '$comments'
                                    },
                                    'breadcrumbs': {
                                        '$first': '$breadcrumbs'
                                    },
                                    'updatedAt': {
                                        '$first': '$updatedAt'
                                    },
                                    'signed': {
                                        '$first': '$signed'
                                    },
                                    'score': {
                                        '$first': '$score'
                                    }
                                }
                            }, {
                                '$addFields': {
                                    'parent': {
                                        '$reduce': {
                                            'input': '$breadcrumbs',
                                            'initialValue': {
                                                'depth': 0
                                            },
                                            'in': {
                                                '$cond': [
                                                    {
                                                        '$eq': [
                                                            '$$this.depth', '$$value.depth'
                                                        ]
                                                    }, '$$this', '$$value'
                                                ]
                                            }
                                        }
                                    },
                                    'ministry': {
                                        '$reduce': {
                                            'input': '$breadcrumbs',
                                            'initialValue': {
                                                'depth': 0
                                            },
                                            'in': {
                                                '$cond': [
                                                    {
                                                        '$gte': [
                                                            '$$this.depth', '$$value.depth'
                                                        ]
                                                    }, '$$this', '$$value'
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        ];
                        return [4 /*yield*/, this.DataModel.aggregate(pipe)];
                    case 1:
                        res = _a.sent();
                        // console.log(res);
                        return [2 /*return*/, res];
                }
            });
        });
    };
    DataRepositoryImpl.prototype.textSearch = function (textSearch, ou) {
        return __awaiter(this, void 0, Promise, function () {
            function handleArabicPrefixes(item) {
                if (item.startsWith("ال")) {
                    SearchTerm.add(item.substring(2));
                    //// console.log(`Removed "ال" from ${item} to ${item.substring(2)}`);
                }
                else {
                    SearchTerm.add("\u0627\u0644" + item);
                }
            }
            function handleA_B_Relation(item) {
                a_b_relation.forEach(function (rel) {
                    SearchTerm.add(item.replace(rel.a, rel.b));
                    SearchTerm.add(item.replaceAll(rel.a, rel.b));
                    SearchTerm.add(item.replaceAll(rel.b, rel.a));
                    SearchTerm.add(item.replace(rel.b, rel.a));
                });
            }
            var breadcrumb_match, match1, scoreLogic, ogText, a_b_relation, containsPercentSign, SearchTerm, tempTerms, SearchText, pipe, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        breadcrumb_match = {};
                        match1 = {};
                        scoreLogic = { '$toInt': '1' };
                        if (ou) {
                            breadcrumb_match = {
                                "breadcrumbs.id": Number(ou)
                            };
                        }
                        ogText = textSearch.replaceAll(/['"]/g, '');
                        a_b_relation = [
                            { a: "ا", b: "أ" },
                            { a: "ا", b: "إ" },
                            { a: "ا", b: "ى" },
                            { a: "أ", b: "ى" },
                            { a: "أ", b: "إ" },
                            { a: "إ", b: "ى" },
                            { a: "ه", b: "ة" },
                            { a: "و", b: "ؤ" },
                            { a: "ت", b: "ة" },
                            { a: "ض", b: "ظ" },
                            { a: "ئ", b: "ء" },
                        ];
                        containsPercentSign = ogText.includes("%");
                        SearchTerm = new Set();
                        ogText.split(" ").forEach(function (item) {
                            SearchTerm.add(item);
                            handleArabicPrefixes(item);
                            handleA_B_Relation(item);
                        });
                        tempTerms = __spreadArrays(SearchTerm);
                        tempTerms.forEach(function (item) {
                            handleArabicPrefixes(item);
                            handleA_B_Relation(item);
                        });
                        SearchTerm.add(ogText);
                        SearchText = __spreadArrays(SearchTerm).join(" ");
                        // console.log(SearchText);
                        if (textSearch != 'all') {
                            match1 = {
                                '$text': {
                                    '$search': SearchText
                                }
                            };
                            scoreLogic = {
                                '$meta': 'textScore'
                            };
                        }
                        // console.log("function: ", breadcrumb_match);
                        pipe = [
                            {
                                '$match': match1
                            }, {
                                '$match': {
                                    'active': true
                                }
                            }, {
                                '$project': {
                                    'id': 1,
                                    'name': 1,
                                    'ous': 1,
                                    'type': 1
                                }
                            }, {
                                '$lookup': {
                                    'from': 'data-types',
                                    'localField': 'type',
                                    'foreignField': '_id',
                                    'as': 'type'
                                }
                            }, {
                                '$addFields': {
                                    'type': {
                                        '$first': '$type'
                                    }
                                }
                            }, {
                                '$addFields': {
                                    'score': {
                                        '$regexMatch': {
                                            'input': '$name',
                                            'regex': textSearch
                                        }
                                    }
                                }
                            }, {
                                '$addFields': {
                                    'score': {
                                        '$cond': {
                                            'if': {
                                                '$eq': [
                                                    '$score', true
                                                ]
                                            },
                                            'then': 2,
                                            'else': 1
                                        }
                                    }
                                }
                            }, {
                                '$addFields': {
                                    'score': {
                                        '$multiply': [
                                            '$score', scoreLogic
                                        ]
                                    }
                                }
                            }, {
                                '$graphLookup': {
                                    'from': 'organization-units',
                                    'startWith': '$ous',
                                    'connectFromField': 'parent',
                                    'connectToField': '_id',
                                    'depthField': 'depth',
                                    'as': 'breadcrumbs'
                                }
                            }, {
                                '$addFields': {
                                    'breadcrumbs': {
                                        '$map': {
                                            'input': '$breadcrumbs',
                                            'in': {
                                                '_id': '$$this._id',
                                                'label': '$$this.name',
                                                'id': '$$this.id',
                                                'icon': '$$this.image_sq',
                                                'depth': '$$this.depth'
                                            }
                                        }
                                    }
                                }
                            }, {
                                '$match': breadcrumb_match
                            }, {
                                '$addFields': {
                                    'parent': {
                                        '$reduce': {
                                            'input': '$breadcrumbs',
                                            'initialValue': {
                                                'depth': 0
                                            },
                                            'in': {
                                                '$cond': [
                                                    {
                                                        '$eq': [
                                                            '$$this.depth', '$$value.depth'
                                                        ]
                                                    }, '$$this', '$$value'
                                                ]
                                            }
                                        }
                                    },
                                    'ministry': {
                                        '$reduce': {
                                            'input': '$breadcrumbs',
                                            'initialValue': {
                                                'depth': 0
                                            },
                                            'in': {
                                                '$cond': [
                                                    {
                                                        '$gte': [
                                                            '$$this.depth', '$$value.depth'
                                                        ]
                                                    }, '$$this', '$$value'
                                                ]
                                            }
                                        }
                                    }
                                }
                            }, {
                                '$sort': {
                                    'score': -1
                                }
                            }
                        ];
                        return [4 /*yield*/, this.DataModel.aggregate(pipe)];
                    case 1:
                        res = _a.sent();
                        // console.log(res);
                        return [2 /*return*/, res];
                }
            });
        });
    };
    DataRepositoryImpl.prototype.advanceSearch = function (structuredMatch, ou) {
        return __awaiter(this, void 0, Promise, function () {
            var ouMatch, pattern, pipe;
            return __generator(this, function (_a) {
                ouMatch = {};
                if (ou) {
                    ouMatch = {
                        "breadcrumbs.id": ou
                    };
                }
                // console.log(JSON.stringify(structuredMatch));
                pattern = structuredMatch.pattern;
                if (pattern) {
                    delete structuredMatch.pattern;
                }
                else {
                    pattern = [];
                }
                pipe = [
                    {
                        '$match': {
                            'active': true
                        }
                    }, {
                        '$match': structuredMatch
                    }, {
                        '$project': {
                            'id': 1,
                            'name': 1,
                            'type': 1,
                            'score': 1,
                            'data': {
                                '$reduce': {
                                    'input': '$fields.data',
                                    'initialValue': '',
                                    'in': {
                                        '$concat': [
                                            '$$value', '$$this'
                                        ]
                                    }
                                }
                            },
                            'ous': 1
                        }
                    }, {
                        '$addFields': {
                            'matchingWords': {
                                '$filter': {
                                    'input': pattern,
                                    'as': 'pattern',
                                    'cond': {
                                        '$regexMatch': {
                                            'input': '$name',
                                            'regex': '$$pattern'
                                        }
                                    }
                                }
                            },
                            'matchingData': {
                                '$filter': {
                                    'input': pattern,
                                    'as': 'pattern',
                                    'cond': {
                                        '$regexMatch': {
                                            'input': '$data',
                                            'regex': '$$pattern'
                                        }
                                    }
                                }
                            }
                        }
                    }, {
                        '$addFields': {
                            'score': {
                                '$add': [
                                    {
                                        '$multiply': [
                                            {
                                                '$size': '$matchingWords'
                                            }, 2
                                        ]
                                    }, {
                                        '$size': '$matchingData'
                                    }
                                ]
                            }
                        }
                    }, {
                        '$unset': 'data'
                    }, {
                        '$lookup': {
                            'from': 'data-types',
                            'localField': 'type',
                            'foreignField': '_id',
                            'as': 'type'
                        }
                    }, {
                        '$addFields': {
                            'type': {
                                '$first': '$type'
                            }
                        }
                    }, {
                        '$graphLookup': {
                            'from': 'organization-units',
                            'startWith': '$ous',
                            'connectFromField': 'parent',
                            'connectToField': '_id',
                            'depthField': 'depth',
                            'as': 'breadcrumbs'
                        }
                    }, {
                        '$addFields': {
                            'breadcrumbs': {
                                '$map': {
                                    'input': '$breadcrumbs',
                                    'in': {
                                        '_id': '$$this._id',
                                        'label': '$$this.name',
                                        'id': '$$this.id',
                                        'icon': '$$this.image_sq',
                                        'depth': '$$this.depth'
                                    }
                                }
                            }
                        }
                    }, {
                        '$match': ouMatch
                    }, {
                        '$addFields': {
                            'parent': {
                                '$reduce': {
                                    'input': '$breadcrumbs',
                                    'initialValue': {
                                        'depth': 0
                                    },
                                    'in': {
                                        '$cond': [
                                            {
                                                '$eq': [
                                                    '$$this.depth', '$$value.depth'
                                                ]
                                            }, '$$this', '$$value'
                                        ]
                                    }
                                }
                            },
                            'ministry': {
                                '$reduce': {
                                    'input': '$breadcrumbs',
                                    'initialValue': {
                                        'depth': 0
                                    },
                                    'in': {
                                        '$cond': [
                                            {
                                                '$gte': [
                                                    '$$this.depth', '$$value.depth'
                                                ]
                                            }, '$$this', '$$value'
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        '$sort': {
                            'score': -1
                        }
                    }
                ];
                return [2 /*return*/, this.DataModel.aggregate(pipe)];
            });
        });
    };
    DataRepositoryImpl.prototype.update = function (data) {
        return this.DataModel.findByIdAndUpdate(data._id, data);
    };
    DataRepositoryImpl.prototype.getAll = function (page, offset) {
        //pagination 
        var skip = page * offset - offset;
        return this.DataModel.find().limit(offset).skip(skip);
    };
    DataRepositoryImpl.prototype.getViewData = function (page, offset) {
        try {
            //pagination 
            var skip = page * offset - offset;
            return this.DataViewModel.find({ active: true });
        }
        catch (error) {
            throw new Error(error);
        }
    };
    DataRepositoryImpl.prototype.getContentUpdateView = function (page, offset) {
        try {
            //pagination 
            var skip = page * offset - offset;
            return this.ContentUpdateViewModel.find();
        }
        catch (error) {
            throw new Error(error);
        }
    };
    DataRepositoryImpl.prototype["delete"] = function (_id) {
        return this.DataModel.deleteOne({ _id: _id });
    };
    DataRepositoryImpl.prototype.getOne = function (_id) {
        return this.DataModel.findById({ _id: _id });
    };
    DataRepositoryImpl.prototype.executePipe = function (pipe) {
        return this.DataModel.aggregate(pipe);
    };
    DataRepositoryImpl.prototype.countRecord = function (query) {
        return this.DataModel.countDocuments(query);
    };
    DataRepositoryImpl.prototype.insertMany = function (data) {
        return this.DataModel.create(data);
    };
    DataRepositoryImpl = __decorate([
        common_1.Injectable(),
        __param(0, mongoose_1.InjectModel('Data')),
        __param(1, mongoose_1.InjectModel('view_data')),
        __param(2, mongoose_1.InjectModel('view_content_updates'))
    ], DataRepositoryImpl);
    return DataRepositoryImpl;
}());
exports.DataRepositoryImpl = DataRepositoryImpl;
