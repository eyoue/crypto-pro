(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('js2xmlparser'), require('@epsr/crypto-pro'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('@utp/e-sign-lib', ['exports', '@angular/core', 'rxjs', 'rxjs/operators', 'js2xmlparser', '@epsr/crypto-pro', '@angular/common'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.utp = global.utp || {}, global.utp['e-sign-lib'] = {}), global.ng.core, global.rxjs, global.rxjs.operators, global.JsonToXML, global.cryptoPro, global.ng.common));
}(this, (function (exports, core, rxjs, operators, JsonToXML, cryptoPro, common) { 'use strict';

    var CryptoProPluginInfo = /** @class */ (function () {
        function CryptoProPluginInfo(_a) {
            var cadesVersion = _a.cadesVersion, cspVersion = _a.cspVersion;
            this.pluginVersion = cadesVersion;
            this.cspVersion = cspVersion;
        }
        return CryptoProPluginInfo;
    }());

    var ErrorCryptoPro;
    (function (ErrorCryptoPro) {
        ErrorCryptoPro[ErrorCryptoPro["CertificateNotFound"] = 0] = "CertificateNotFound";
        ErrorCryptoPro[ErrorCryptoPro["PluginNotFined"] = 1] = "PluginNotFined";
        ErrorCryptoPro[ErrorCryptoPro["SignNotInGOST"] = 2] = "SignNotInGOST";
        ErrorCryptoPro[ErrorCryptoPro["SignError"] = 3] = "SignError";
        ErrorCryptoPro[ErrorCryptoPro["Success"] = 4] = "Success";
    })(ErrorCryptoPro || (ErrorCryptoPro = {}));

    var index = /*#__PURE__*/Object.freeze({
        __proto__: null,
        CryptoProPluginInfo: CryptoProPluginInfo,
        get ErrorCryptoPro () { return ErrorCryptoPro; }
    });

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    var CryptoProService = /** @class */ (function () {
        function CryptoProService() {
            this.isPlugin = false;
            // Отключить модальное окно с просьбой скачать плагин (встроенное в cadesplugin)
            if ('cadesplugin_skip_extension_install' in window) {
                //@ts-ignore
                window.cadesplugin_skip_extension_install = true;
            }
        }
        CryptoProService.prototype.isPluginValid = function () {
            var _this = this;
            return rxjs.from(cryptoPro.isValidSystemSetup()).pipe(operators.tap(function (value) { return _this.isPlugin = value; }, operators.catchError(function (err) {
                _this.isPlugin = false;
                return err;
            })));
        };
        CryptoProService.prototype.getPluginInfo = function () {
            return rxjs.from(cryptoPro.getSystemInfo()).pipe(operators.map(function (info) { return new CryptoProPluginInfo(info); }));
        };
        CryptoProService.prototype.getUserCertificates = function () {
            return new rxjs.Observable(function (observer) { return rxjs.from(cryptoPro.getUserCertificates(true))
                .subscribe(observer); });
        };
        CryptoProService.prototype.createFileSignature = function (thumbprint, fileBlob) {
            var _this = this;
            return new rxjs.Observable(function (observer) { return rxjs.from(_this.createFileDetachedSignature(thumbprint, fileBlob))
                .subscribe(observer); });
        };
        CryptoProService.prototype.createXMLSignature = function (thumbprint, unencryptedMessage) {
            var _this = this;
            return new rxjs.Observable(function (observer) { return rxjs.from(_this.createXMLSignaturePromise(thumbprint, unencryptedMessage))
                .subscribe(observer); });
        };
        CryptoProService.prototype.createXMLSignaturePromise = function (thumbprint, unencryptedMessage) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, cryptoPro.createXMLSignature(thumbprint, unencryptedMessage)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        CryptoProService.prototype.createFileDetachedSignature = function (thumbprint, fileBlob) {
            return __awaiter(this, void 0, void 0, function () {
                var data, hash;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fileBlob.arrayBuffer()];
                        case 1:
                            data = _a.sent();
                            return [4 /*yield*/, cryptoPro.createHash(data)];
                        case 2:
                            hash = _a.sent();
                            return [4 /*yield*/, cryptoPro.createDetachedSignature(thumbprint, hash)];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        return CryptoProService;
    }());
    CryptoProService.decorators = [
        { type: core.Injectable }
    ];
    CryptoProService.ctorParameters = function () { return []; };

    var CertificatesMapper = /** @class */ (function () {
        function CertificatesMapper() {
        }
        CertificatesMapper.map = function (src) {
            if (!src) {
                return null;
            }
            var issuerName = src.issuerName, name = src.name, thumbprint = src.thumbprint, validFrom = src.validFrom, validTo = src.validTo;
            var matches = issuerName.match(/CN=([^,+]*)/);
            var normalizedName = (matches && matches.length > 0)
                ? matches[1]
                : issuerName;
            return {
                issuerName: normalizedName,
                isValid: true,
                name: name,
                thumbprint: thumbprint,
                validFrom: validFrom,
                validTo: validTo
            };
        };
        return CertificatesMapper;
    }());

    var EMPTY_CERTIFICATE = {
        issuerName: 'Тестовый сертификат',
        isValid: true,
        name: 'Test Certificate',
        thumbprint: 'A2C5DF002CF2260D13D38186AE8C99C9BE660602',
        validFrom: '2021-04-05T16:35:09.000Z',
        validTo: '2021-07-05T16:45:09.000Z'
    };

    var XMLESignDirective = /** @class */ (function () {
        function XMLESignDirective(cryptoService) {
            this.cryptoService = cryptoService;
            /**
             * @description Плагин рабочий
             */
            this.isPluginValid = false;
            /**
             * @description Подписть в процессе
             */
            this.signInProgress = false;
            /**
             * @description События подписи (ошибки или успех)
             */
            this.signEvent$ = new rxjs.BehaviorSubject(null);
            /**
             * @description Флаг тестового режима (Alt + S)
             */
            this.isTestingMode = localStorage.getItem('SIGN_XML_TESTING_MODE') === 'true';
            /**
             * @description Блок в который будет положен распарсенный объект XML
             */
            this.rootField = 'html';
            /**
             * @description Исходный объект
             */
            this.jsonObject = {};
            /**
             * @description Флаг скачивания файла при подписи
             */
            this.isNeedDownloadFile = false;
            /**
             * @description События успеха
             */
            this.successResult = new core.EventEmitter(null);
            /**
             * @description События ошибок
             */
            this.failedResult = new core.EventEmitter(null);
            /**
             *
             * @param body - тело xml с данными пользователя (строка)
             * @param b64cert - сертификат (строка)
             * @param signMethod - метод подписи (строка)
             * @param digestMethod - что-то для канонизации XML (строка)
             */
            this.getXMLTemplate = function (body, b64cert, signMethod, digestMethod) {
                return '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                    '    <s:Header>' +
                    '        <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" s:actor="http://smev.gosuslugi.ru/actors/smev">' +
                    '            <o:BinarySecurityToken u:Id="uuid-ee82d445-758b-42cb-996c-666b74b60022-2" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3" EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">'
                    + b64cert +
                    '</o:BinarySecurityToken>' +
                    '            <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">' +
                    '                <SignedInfo>' +
                    '                    <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />' +
                    '                    <SignatureMethod Algorithm="' + signMethod + '"/>' +
                    '                    <Reference URI="#_1">' +
                    '                        <Transforms>' +
                    '                            <Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />' +
                    '                        </Transforms>' +
                    '                        <DigestMethod Algorithm="' + digestMethod + '"/>' +
                    '                        <DigestValue></DigestValue>' +
                    '                    </Reference>' +
                    '                </SignedInfo>' +
                    '                <SignatureValue></SignatureValue>' +
                    '                <KeyInfo>' +
                    '                    <o:SecurityTokenReference>' +
                    '                    <o:Reference ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3" URI="#uuid-ee82d445-758b-42cb-996c-666b74b60022-2" />' +
                    '                    </o:SecurityTokenReference>' +
                    '                </KeyInfo>' +
                    '            </Signature>' +
                    '        </o:Security>' +
                    '    </s:Header>' +
                    '    <s:Body u:Id="_1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
                    body +
                    '    </s:Body>' +
                    '</s:Envelope>';
            };
            this.listenSignEvents();
        }
        /**
         * @description Вход в режим тестировщика
         * Если не установлен плагин то Alt + S
         * @param event
         */
        XMLESignDirective.prototype.keyEvent = function (event) {
            if (event.altKey && event.code === 'KeyS') {
                this.isTestingMode = !this.isTestingMode;
                localStorage.setItem('SIGN_XML_TESTING_MODE', String(this.isTestingMode));
                console.log('SIGN_XML_TESTING_MODE: ', this.isTestingMode ? 'on' : 'off');
            }
        };
        /**
         * @description слушатель событий подписи
         * Внутри observable - в него пушатся события успеха или ошибки
         * Тут они обрабатываются
         * @private
         */
        XMLESignDirective.prototype.listenSignEvents = function () {
            var _this = this;
            return this.signEvent$
                .pipe(operators.filter(function (response) { return response; }), operators.tap(function (response) {
                var status = response.status, payload = response.payload;
                _this.signInProgress = false;
                if (status === ErrorCryptoPro.Success) {
                    _this.successResult.emit({ status: status, payload: payload });
                    _this.selectedCertificate = null;
                    if (_this.isNeedDownloadFile) {
                        _this.downloadFile(payload, 'signed.xml');
                    }
                    return;
                }
                else {
                    // обработка ошибок
                    if (_this.selectedCertificate) {
                        _this.selectedCertificate.isValid = false;
                        _this.selectedCertificate.class = 'disabled';
                    }
                    _this.failedResult.emit({ status: status, payload: payload });
                    return;
                }
            })).subscribe();
        };
        /**
         * @description Проверить наличие плагина
         */
        XMLESignDirective.prototype.checkPlugin = function () {
            this.isPluginValid = this.cryptoService.isPlugin;
            if (!this.isPluginValid && !this.isTestingMode) {
                this.signEvent$.next({
                    status: ErrorCryptoPro.PluginNotFined,
                    payload: 'Требуется  КриптоПро ЭЦП Browser plug-in и установленная ЭЦП'
                });
            }
        };
        /**
         * @description Если сертификат выбран
         * @param certificate
         */
        XMLESignDirective.prototype.onCertificateSelected = function (certificate) {
            this.selectedCertificate = certificate;
        };
        /**
         * @description Получить список сертификатов
         */
        XMLESignDirective.prototype.getCertificates = function () {
            var _this = this;
            if (!this.jsonObject) {
                return rxjs.of(null);
            }
            var successFn = function () {
                return _this.cryptoService.getUserCertificates();
            };
            var failFn = function () {
                return rxjs.of(_this.isTestingMode ? [EMPTY_CERTIFICATE] : []);
            };
            var action = function () {
                _this.checkPlugin();
                return rxjs.iif(function () { return _this.isPluginValid; }, successFn(), failFn()).pipe(operators.map(function (certificates) { return certificates.map(function (c) { return CertificatesMapper.map(c); }); }), operators.tap(function (certificates) {
                    _this.certificates = certificates;
                }), operators.catchError(function (error) {
                    _this.certificates = [];
                    _this.signEvent$.next({
                        status: ErrorCryptoPro.PluginNotFined,
                        payload: 'Требуется  КриптоПро ЭЦП Browser plug-in и установленная ЭЦП'
                    });
                    return rxjs.throwError(error);
                }));
            };
            return action();
        };
        /**
         *
         * @param text - содержимое файла (строка)
         * @param filename - имя файла
         * @private
         */
        XMLESignDirective.prototype.downloadFile = function (text, filename) {
            if (filename === void 0) { filename = 'filename.xml'; }
            var pom = document.createElement('a');
            var bb = new Blob([text], { type: 'text/plain' });
            pom.setAttribute('href', window.URL.createObjectURL(bb));
            pom.setAttribute('download', filename);
            pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
            pom.draggable = true;
            pom.classList.add('dragout');
            pom.click();
            pom.remove();
        };
        Object.defineProperty(XMLESignDirective.prototype, "jsonToXml", {
            /**
             * @description пользовательский JSON в XML (без мета инфы что это xml)
             */
            get: function () {
                return JsonToXML.parse(this.rootField, this.jsonObject).replace('<?xml version=\'1.0\'?>\n', '');
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @description Генерим xml, и отдаем на подпись - если мы в режиме тестирования
         * сразу отдаем xml (буд-то он подписан)
         */
        XMLESignDirective.prototype.sign = function () {
            var xmlData = this.jsonToXml;
            this.signInProgress = true;
            if (!this.selectedCertificate || this.selectedCertificate.thumbprint === EMPTY_CERTIFICATE.thumbprint) {
                var response = this.isTestingMode ?
                    { status: ErrorCryptoPro.Success, payload: this.getXMLTemplate(xmlData, '', '', '') } :
                    {
                        status: ErrorCryptoPro.PluginNotFined,
                        payload: 'Требуется  КриптоПро ЭЦП Browser plug-in и установленная ЭЦП'
                    };
                this.signEvent$.next(response);
                return;
            }
            else {
                this.signXML(this.selectedCertificate.thumbprint, xmlData);
            }
        };
        /**
         *
         * @param sCertName - имя сертификата  (строка)
         * @param body - строка, которая допишется в xml  (строка)
         * @private
         */
        XMLESignDirective.prototype.signXML = function (sCertName, body) {
            var _this = this;
            // const CAPICOM_CURRENT_USER_STORE = 2;
            // const CAPICOM_MY_STORE = 'My';
            // const CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 2;
            var CADESCOM_CONTAINER_STORE = 100;
            var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
            // const CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME = 1;
            var CADESCOM_XML_SIGNATURE_TYPE_TEMPLATE = 2;
            var CADESCOM_ENCODE_BASE64 = 0;
            var run = function () {
                var that = _this;
                // @ts-ignore
                cadesplugin.async_spawn(function (args) {
                    var oStore, oStoreCerts, oCertificates, certsCount, oCertificate, oPublicKey, oAlgorithm, algoOid, signMethod, digestMethod, errormes, b64cert, sContent, oSigner, oSignedXML, sSignedMessage, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                // Здесь следует заполнить SubjectName сертификата
                                // let sCertName = oCertName.value;
                                if ('' === sCertName) {
                                    alert('Введите имя сертификата (CN).');
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, cadesplugin.CreateObjectAsync('CAdESCOM.Store')];
                            case 1:
                                oStore = _a.sent();
                                return [4 /*yield*/, oStore.Open(CADESCOM_CONTAINER_STORE)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, oStore.Certificates];
                            case 3:
                                oStoreCerts = _a.sent();
                                return [4 /*yield*/, oStoreCerts.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, sCertName)];
                            case 4:
                                oCertificates = _a.sent();
                                return [4 /*yield*/, oCertificates.Count];
                            case 5:
                                certsCount = _a.sent();
                                if (certsCount === 0) {
                                    that.signEvent$.next({ status: ErrorCryptoPro.CertificateNotFound, payload: sCertName });
                                    // alert("Certificate not found: " + sCertName);
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, oCertificates.Item(1)];
                            case 6:
                                oCertificate = _a.sent();
                                return [4 /*yield*/, oStore.Close()];
                            case 7:
                                _a.sent();
                                return [4 /*yield*/, oCertificate.PublicKey()];
                            case 8:
                                oPublicKey = _a.sent();
                                return [4 /*yield*/, oPublicKey.Algorithm];
                            case 9:
                                oAlgorithm = _a.sent();
                                return [4 /*yield*/, oAlgorithm.Value];
                            case 10:
                                algoOid = _a.sent();
                                signMethod = '';
                                digestMethod = '';
                                if (algoOid === '1.2.643.7.1.1.1.1') { // алгоритм подписи ГОСТ Р 34.10-2012 с ключом 256 бит
                                    signMethod = 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-256';
                                    digestMethod = 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-256';
                                }
                                else if (algoOid === '1.2.643.7.1.1.1.2') { // алгоритм подписи ГОСТ Р 34.10-2012 с ключом 512 бит
                                    signMethod = 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-512';
                                    digestMethod = 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-512';
                                }
                                else if (algoOid === '1.2.643.2.2.19') { // алгоритм ГОСТ Р 34.10-2001
                                    signMethod = 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102001-gostr3411';
                                    digestMethod = 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr3411';
                                }
                                else {
                                    errormes = 'Поддерживается XML подпись сертификатами только с алгоритмом ГОСТ Р 34.10-2012, ГОСТ Р 34.10-2001';
                                    that.signEvent$.next({ status: ErrorCryptoPro.SignNotInGOST, payload: errormes });
                                    // alert(errormes);
                                }
                                return [4 /*yield*/, oCertificate.Export(CADESCOM_ENCODE_BASE64)];
                            case 11:
                                b64cert = _a.sent();
                                b64cert = b64cert.replace(/[\r\n]/g, '');
                                sContent = that.getXMLTemplate(body, b64cert, signMethod, digestMethod);
                                return [4 /*yield*/, cadesplugin.CreateObjectAsync('CAdESCOM.CPSigner')];
                            case 12:
                                oSigner = _a.sent();
                                return [4 /*yield*/, oSigner.propset_Certificate(oCertificate)];
                            case 13:
                                _a.sent();
                                return [4 /*yield*/, oSigner.propset_CheckCertificate(true)];
                            case 14:
                                _a.sent();
                                return [4 /*yield*/, cadesplugin.CreateObjectAsync('CAdESCOM.SignedXML')];
                            case 15:
                                oSignedXML = _a.sent();
                                return [4 /*yield*/, oSignedXML.propset_Content(sContent)];
                            case 16:
                                _a.sent();
                                // Указываем тип подписи - в данном случае по шаблону
                                return [4 /*yield*/, oSignedXML.propset_SignatureType(CADESCOM_XML_SIGNATURE_TYPE_TEMPLATE)];
                            case 17:
                                // Указываем тип подписи - в данном случае по шаблону
                                _a.sent();
                                sSignedMessage = '';
                                _a.label = 18;
                            case 18:
                                _a.trys.push([18, 20, , 21]);
                                return [4 /*yield*/, oSignedXML.Sign(oSigner)];
                            case 19:
                                sSignedMessage = _a.sent();
                                that.signEvent$.next({ status: ErrorCryptoPro.Success, payload: sSignedMessage });
                                return [3 /*break*/, 21];
                            case 20:
                                err_1 = _a.sent();
                                // @ts-ignore
                                that.signEvent$.next({ status: ErrorCryptoPro.SignError, payload: cadesplugin.getLastError(err_1.message) });
                                // alert("Failed to create signature. Error: " + cadesplugin.getLastError(err));
                                return [2 /*return*/];
                            case 21: return [2 /*return*/];
                        }
                    });
                });
            };
            run();
        };
        return XMLESignDirective;
    }());
    XMLESignDirective.decorators = [
        { type: core.Directive, args: [{
                    selector: '[xml-e-sign]',
                    exportAs: 'xmlESign'
                },] }
    ];
    XMLESignDirective.ctorParameters = function () { return [
        { type: CryptoProService }
    ]; };
    XMLESignDirective.propDecorators = {
        rootField: [{ type: core.Input }],
        jsonObject: [{ type: core.Input }],
        isNeedDownloadFile: [{ type: core.Input }],
        successResult: [{ type: core.Output }],
        failedResult: [{ type: core.Output }],
        keyEvent: [{ type: core.HostListener, args: ['window:keyup', ['$event'],] }]
    };

    var ESignerModule = /** @class */ (function () {
        function ESignerModule(cryptoService) {
            this.cryptoService = cryptoService;
            this.cryptoService.isPluginValid().subscribe();
        }
        return ESignerModule;
    }());
    ESignerModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        common.CommonModule,
                    ],
                    providers: [CryptoProService],
                    declarations: [XMLESignDirective],
                    exports: [XMLESignDirective]
                },] }
    ];
    ESignerModule.ctorParameters = function () { return [
        { type: CryptoProService }
    ]; };

    /**
     * Generated bundle index. Do not edit.
     */

    exports.CryptoProService = CryptoProService;
    exports.ESignerModule = ESignerModule;
    exports.XMLESignDirective = XMLESignDirective;
    exports.models = index;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=utp-e-sign-lib.umd.js.map
