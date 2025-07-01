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
exports.__esModule = true;
exports.DataService = void 0;
var common_1 = require("@nestjs/common");
var DataService = /** @class */ (function () {
    function DataService(DataRepository, queryToPipe, ouRepository, advanceSearchLogService) {
        this.DataRepository = DataRepository;
        this.queryToPipe = queryToPipe;
        this.ouRepository = ouRepository;
        this.advanceSearchLogService = advanceSearchLogService;
    }
    DataService.prototype.getSequence = function () {
        return __awaiter(this, void 0, Promise, function () {
            var pipe, greatestID, id, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        pipe = [
                            {
                                $group: {
                                    _id: null,
                                    id: { $max: "$id" }
                                }
                            }
                        ];
                        return [4 /*yield*/, this.DataRepository.executePipe(pipe)];
                    case 1:
                        greatestID = _a.sent();
                        id = greatestID[0].id;
                        response = {
                            success: true,
                            message: 'Greatest Id Received',
                            data: id
                        };
                        return [2 /*return*/, response];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error(error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DataService.prototype.getDataFromOuAndType = function (ou, type) {
        return __awaiter(this, void 0, Promise, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.DataRepository.getDataFromOuAndType(ou, type)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Data from OU and Type Fetched Successfully",
                                data: res
                            }];
                }
            });
        });
    };
    DataService.prototype.advanceSearch = function (query, uid) {
        return __awaiter(this, void 0, Promise, function () {
            var log, structuredMatch, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = { query: query, uid: uid };
                        this.advanceSearchLogService.createLog(log);
                        structuredMatch = this.queryToPipe.convertQuery(query);
                        return [4 /*yield*/, this.DataRepository.advanceSearch(structuredMatch, query.extras.ou)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Advance search completed successfully",
                                data: res
                            }];
                }
            });
        });
    };
    DataService.prototype.cleanOnOuDeletion = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.DataRepository.dataCleanQuery()];
            });
        });
    };
    DataService.prototype.textSearch = function (textSearch, user_id, ou) {
        return __awaiter(this, void 0, Promise, function () {
            var searchLog, res, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // console.log(ou);
                        searchLog = {
                            keyword: textSearch,
                            user_id: user_id
                        };
                        this.ouRepository.createSearchHistory(searchLog);
                        if (!ou) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.DataRepository.textSearch(textSearch, ou)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.DataRepository.textSearch(textSearch)];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        res = _a;
                        return [2 /*return*/, {
                                success: true,
                                message: "Text search completed successfully",
                                data: res
                            }];
                }
            });
        });
    };
    DataService.prototype.getOneEnhanced = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.DataRepository.getOneEnhanced(id)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Current fetched successfully",
                                data: res
                            }];
                }
            });
        });
    };
    DataService.prototype.create = function (data) {
        return __awaiter(this, void 0, Promise, function () {
            var res, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.DataRepository.create(data)];
                    case 1:
                        res = _a.sent();
                        response = {
                            success: true,
                            message: 'Data added Successfully',
                            data: res
                        };
                        return [2 /*return*/, response];
                }
            });
        });
    };
    DataService.prototype.bulkUpload = function (data) {
        return __awaiter(this, void 0, Promise, function () {
            var notUploaded, addData, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        notUploaded = [];
                        // console.log("data", data);
                        return [4 /*yield*/, this.DataRepository.insertMany(data.data)];
                    case 1:
                        addData = _a.sent();
                        notUploaded = addData;
                        response = {
                            success: true,
                            message: 'New data created from bulk...',
                            data: notUploaded
                        };
                        return [2 /*return*/, response];
                }
            });
        });
    };
    DataService.prototype.signData = function (data) {
        return __awaiter(this, void 0, Promise, function () {
            var notSigned, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        notSigned = [];
                        return [4 /*yield*/, Promise.all(data.data.map(function (data) { return __awaiter(_this, void 0, void 0, function () {
                                var addData;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            data.signed.date = new Date();
                                            return [4 /*yield*/, this.DataRepository.update(data)];
                                        case 1:
                                            addData = _a.sent();
                                            if (addData == null || !addData) {
                                                notSigned.push(data);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        response = {
                            success: true,
                            message: 'Data signed successfully.....',
                            data: notSigned
                        };
                        return [2 /*return*/, response];
                }
            });
        });
    };
    DataService.prototype["delete"] = function (_id) {
        return __awaiter(this, void 0, Promise, function () {
            var res, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.DataRepository["delete"](_id)];
                    case 1:
                        res = _a.sent();
                        response = {
                            success: true,
                            message: res.deletedCount > 0 ? 'Data template deleted Successfully' : 'Data template Id not found',
                            data: res
                        };
                        return [2 /*return*/, response];
                }
            });
        });
    };
    DataService.prototype.getViewData = function (page, offset) {
        return __awaiter(this, void 0, Promise, function () {
            var res, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.DataRepository.getViewData(page, offset)];
                    case 1:
                        res = _a.sent();
                        response = {
                            success: true,
                            message: res ? 'Data View fetched Successfully' : 'Data template not found',
                            data: res
                        };
                        return [2 /*return*/, response];
                }
            });
        });
    };
    DataService.prototype.getContentUpdateView = function (page, offset) {
        return __awaiter(this, void 0, Promise, function () {
            var res, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.DataRepository.getContentUpdateView(page, offset)];
                    case 1:
                        res = _a.sent();
                        response = {
                            success: true,
                            message: res ? 'Content Update View fetched Successfully' : 'Content Update View not found',
                            data: res
                        };
                        return [2 /*return*/, response];
                }
            });
        });
    };
    DataService.prototype.update = function (data) {
        return __awaiter(this, void 0, Promise, function () {
            var res, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.DataRepository.update(data)];
                    case 1:
                        res = _a.sent();
                        response = {
                            success: true,
                            message: "Data Updated",
                            data: res
                        };
                        return [2 /*return*/, response];
                }
            });
        });
    };
    DataService.prototype.servieCount = function () {
        return __awaiter(this, void 0, Promise, function () {
            var pipe, res, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pipe = [
                            {
                                '$match': {
                                    'active': true
                                }
                            },
                            {
                                '$group': {
                                    '_id': '$type',
                                    'count': {
                                        '$count': {}
                                    }
                                }
                            }, {
                                '$lookup': {
                                    'from': 'data-types',
                                    'localField': '_id',
                                    'foreignField': '_id',
                                    'as': 'type'
                                }
                            }, {
                                '$addFields': {
                                    'type': {
                                        '$first': '$type'
                                    }
                                }
                            }
                        ];
                        return [4 /*yield*/, this.DataRepository.executePipe(pipe)];
                    case 1:
                        res = _a.sent();
                        response = {
                            success: true,
                            message: "Data Updated",
                            data: res
                        };
                        return [2 /*return*/, response];
                }
            });
        });
    };
    DataService = __decorate([
        common_1.Injectable(),
        __param(0, common_1.Inject('DataRepository')),
        __param(2, common_1.Inject('OURepository'))
    ], DataService);
    return DataService;
}());
exports.DataService = DataService;
