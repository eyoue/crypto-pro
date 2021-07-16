(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/mazimzv/Desktop/GIT_PROJECTS/ST/e-sign/src/main.ts */"zUnb");


/***/ }),

/***/ "1YfB":
/*!*********************************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/models/sign-result.intreface.ts ***!
  \*********************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "AytR":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "Hbtn":
/*!*****************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/models/index.ts ***!
  \*****************************************************/
/*! exports provided: CryptoProPluginInfo, ErrorCryptoPro */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _certificate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./certificate */ "rYp4");
/* empty/unused harmony star reexport *//* harmony import */ var _crypto_pro_plugin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./crypto-pro-plugin */ "pFe+");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CryptoProPluginInfo", function() { return _crypto_pro_plugin__WEBPACK_IMPORTED_MODULE_1__["CryptoProPluginInfo"]; });

/* harmony import */ var _error_crypto_pro__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./error-crypto-pro */ "co8t");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ErrorCryptoPro", function() { return _error_crypto_pro__WEBPACK_IMPORTED_MODULE_2__["ErrorCryptoPro"]; });

/* harmony import */ var _sign_result_intreface__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sign-result.intreface */ "1YfB");
/* empty/unused harmony star reexport */





/***/ }),

/***/ "HhWF":
/*!*******************************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/mapper/certificates.mapper.ts ***!
  \*******************************************************************/
/*! exports provided: CertificatesMapper */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CertificatesMapper", function() { return CertificatesMapper; });
class CertificatesMapper {
    static map(src) {
        if (!src) {
            return null;
        }
        const { issuerName, name, thumbprint, validFrom, validTo } = src;
        const matches = issuerName.match(/CN=([^,+]*)/);
        const normalizedName = (matches && matches.length > 0)
            ? matches[1]
            : issuerName;
        return {
            issuerName: normalizedName,
            isValid: true,
            name,
            thumbprint,
            validFrom,
            validTo
        };
    }
}


/***/ }),

/***/ "J3BL":
/*!********************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/e-signer.module.ts ***!
  \********************************************************/
/*! exports provided: ESignerModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ESignerModule", function() { return ESignerModule; });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _crypto_pro_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./crypto-pro.service */ "cbmc");
/* harmony import */ var _xml_e_sign_directive__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./xml-e-sign.directive */ "wwlw");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "fXoL");





class ESignerModule {
    constructor(cryptoService) {
        this.cryptoService = cryptoService;
        this.cryptoService.isPluginValid().subscribe();
    }
}
ESignerModule.ɵfac = function ESignerModule_Factory(t) { return new (t || ESignerModule)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_crypto_pro_service__WEBPACK_IMPORTED_MODULE_1__["CryptoProService"])); };
ESignerModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineNgModule"]({ type: ESignerModule });
ESignerModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjector"]({ providers: [_crypto_pro_service__WEBPACK_IMPORTED_MODULE_1__["CryptoProService"]], imports: [[
            _angular_common__WEBPACK_IMPORTED_MODULE_0__["CommonModule"],
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsetNgModuleScope"](ESignerModule, { declarations: [_xml_e_sign_directive__WEBPACK_IMPORTED_MODULE_2__["XMLESignDirective"]], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_0__["CommonModule"]], exports: [_xml_e_sign_directive__WEBPACK_IMPORTED_MODULE_2__["XMLESignDirective"]] }); })();


/***/ }),

/***/ "Sy1n":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _dialog_dialog_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dialog/dialog.component */ "ZYp2");
/* harmony import */ var _projects_e_sign_lib_src_lib_xml_e_sign_directive__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../projects/e-sign-lib/src/lib/xml-e-sign.directive */ "wwlw");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/button */ "bTqV");







class AppComponent {
    constructor(dialog) {
        this.dialog = dialog;
        this.title = 'e-sign';
    }
    openSignDialog1() {
        const xmlDirective = this.xmlESignList.get(0);
        const getDialogContext = (certificates) => {
            return this.dialog.open(_dialog_dialog_component__WEBPACK_IMPORTED_MODULE_1__["DialogComponent"], {
                width: '800px',
                data: {
                    title: 'Sign dialog 1',
                    actionButton: {
                        label: 'Sign',
                        disabled: !xmlDirective.selectedCertificate,
                        selectionAction: (data) => {
                            xmlDirective.selectedCertificate = data;
                        },
                        clickAction: () => {
                            xmlDirective.sign();
                        }
                    },
                    cancelButton: {
                        label: 'Close',
                    },
                    listItems: certificates.map((cert) => ({
                        data: cert,
                        view: `
            <span>${cert.name}</span>
            <span>${cert.issuerName}</span>
            <span>${cert.validTo}</span>
            `
                    }))
                }
            });
        };
        const getPreparedJson = () => {
            return { json: { data: 'xxx' } };
        };
        const certificates = xmlDirective.getCertificates();
        const action = () => {
            xmlDirective.jsonObject = getPreparedJson();
            certificates.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["tap"])(getDialogContext)).subscribe();
        };
        action();
    }
    openSignDialog2() {
        const xmlDirective = this.xmlESignList.get(1);
        const getDialogContext = (certificates) => {
            return this.dialog.open(_dialog_dialog_component__WEBPACK_IMPORTED_MODULE_1__["DialogComponent"], {
                width: '400px',
                data: {
                    title: 'Sign dialog 2',
                    actionButton: {
                        label: 'Sign',
                        disabled: !xmlDirective.selectedCertificate,
                        selectionAction: (data) => {
                            xmlDirective.selectedCertificate = data;
                        },
                        clickAction: () => {
                            xmlDirective.sign();
                        }
                    },
                    cancelButton: {
                        label: 'Close',
                    },
                    listItems: certificates.map((cert) => ({
                        data: cert,
                        view: `
            <span>${cert.name}</span>
            <span>${cert.issuerName}</span>
            <span>${cert.validTo}</span>
            `
                    }))
                }
            });
        };
        const getPreparedJson = () => {
            return { json: { data: 123 } };
        };
        const certificates = xmlDirective.getCertificates();
        const action = () => {
            xmlDirective.jsonObject = getPreparedJson();
            certificates.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["tap"])(getDialogContext)).subscribe();
        };
        action();
    }
    getSignedXML({ payload }) {
        console.log(payload);
    }
    getSignError({ payload }) {
        console.log(payload);
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_4__["MatDialog"])); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], viewQuery: function AppComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵviewQuery"](_projects_e_sign_lib_src_lib_xml_e_sign_directive__WEBPACK_IMPORTED_MODULE_2__["XMLESignDirective"], 1);
    } if (rf & 2) {
        let _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵloadQuery"]()) && (ctx.xmlESignList = _t);
    } }, decls: 4, vars: 1, consts: [["xml-e-sign", "", "mat-raised-button", "", 3, "isNeedDownloadFile", "click", "successResult", "failedResult"], ["xml-e-sign", "", "mat-raised-button", "", 3, "click", "successResult", "failedResult"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "button", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_Template_button_click_0_listener() { return ctx.openSignDialog1(); })("successResult", function AppComponent_Template_button_successResult_0_listener($event) { return ctx.getSignedXML($event); })("failedResult", function AppComponent_Template_button_failedResult_0_listener($event) { return ctx.getSignError($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, " Sign 1\n");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "button", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_Template_button_click_2_listener() { return ctx.openSignDialog2(); })("successResult", function AppComponent_Template_button_successResult_2_listener($event) { return ctx.getSignedXML($event); })("failedResult", function AppComponent_Template_button_failedResult_2_listener($event) { return ctx.getSignError($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3, " Sign 2\n");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("isNeedDownloadFile", true);
    } }, directives: [_angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButton"], _projects_e_sign_lib_src_lib_xml_e_sign_directive__WEBPACK_IMPORTED_MODULE_2__["XMLESignDirective"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhcHAuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ "ZAI4":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app-routing.module */ "vY5A");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.component */ "Sy1n");
/* harmony import */ var _dialog_dialog_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./dialog/dialog.component */ "ZYp2");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/platform-browser/animations */ "R1ws");
/* harmony import */ var _projects_e_sign_lib_src_lib_e_signer_module__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../projects/e-sign-lib/src/lib/e-signer.module */ "J3BL");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/core */ "fXoL");










class AppModule {
}
AppModule.ɵfac = function AppModule_Factory(t) { return new (t || AppModule)(); };
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdefineInjector"]({ providers: [], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_7__["BrowserAnimationsModule"],
            _app_routing_module__WEBPACK_IMPORTED_MODULE_1__["AppRoutingModule"],
            _projects_e_sign_lib_src_lib_e_signer_module__WEBPACK_IMPORTED_MODULE_8__["ESignerModule"],
            _angular_material_dialog__WEBPACK_IMPORTED_MODULE_4__["MatDialogModule"],
            _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButtonModule"],
            _angular_material_list__WEBPACK_IMPORTED_MODULE_6__["MatListModule"],
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"],
        _dialog_dialog_component__WEBPACK_IMPORTED_MODULE_3__["DialogComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_7__["BrowserAnimationsModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_1__["AppRoutingModule"],
        _projects_e_sign_lib_src_lib_e_signer_module__WEBPACK_IMPORTED_MODULE_8__["ESignerModule"],
        _angular_material_dialog__WEBPACK_IMPORTED_MODULE_4__["MatDialogModule"],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButtonModule"],
        _angular_material_list__WEBPACK_IMPORTED_MODULE_6__["MatListModule"]] }); })();


/***/ }),

/***/ "ZYp2":
/*!********************************************!*\
  !*** ./src/app/dialog/dialog.component.ts ***!
  \********************************************/
/*! exports provided: DialogComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DialogComponent", function() { return DialogComponent; });
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/button */ "bTqV");






function DialogComponent_mat_list_option_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-list-option", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", item_r1.data);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("innerHTML", item_r1.view, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeHtml"]);
} }
class DialogComponent {
    constructor(data) {
        this.data = data;
    }
    ngOnInit() {
    }
    get actionDisabled() {
        var _a, _b;
        return (_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.actionButton) === null || _b === void 0 ? void 0 : _b.disabled;
    }
    clickAction() {
        var _a, _b;
        return ((_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.actionButton) === null || _b === void 0 ? void 0 : _b.clickAction()) || undefined;
    }
    selectAction(data) {
        var _a, _b;
        this.data.actionButton.disabled = false;
        return (_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.actionButton) === null || _b === void 0 ? void 0 : _b.selectionAction(data);
    }
}
DialogComponent.ɵfac = function DialogComponent_Factory(t) { return new (t || DialogComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MAT_DIALOG_DATA"])); };
DialogComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: DialogComponent, selectors: [["app-dialog"]], decls: 10, vars: 6, consts: [["mat-dialog-title", ""], ["mat-dialog-content", ""], [3, "multiple", "selectionChange"], [3, "value", 4, "ngFor", "ngForOf"], ["mat-dialog-actions", ""], ["mat-button", "", "mat-dialog-close", ""], ["mat-button", "", "mat-dialog-close", "", 3, "disabled", "click"], [3, "value"], [3, "innerHTML"]], template: function DialogComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h1", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "mat-selection-list", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("selectionChange", function DialogComponent_Template_mat_selection_list_selectionChange_3_listener($event) { return ctx.selectAction($event.option.value); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](4, DialogComponent_mat_list_option_4_Template, 2, 2, "mat-list-option", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "button", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "button", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function DialogComponent_Template_button_click_8_listener() { return ctx.clickAction(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx.data == null ? null : ctx.data.title);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("multiple", false);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.data == null ? null : ctx.data.listItems);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx.data == null ? null : ctx.data.cancelButton == null ? null : ctx.data.cancelButton.label);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("disabled", ctx.actionDisabled);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx.data == null ? null : ctx.data.actionButton == null ? null : ctx.data.actionButton.label);
    } }, directives: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MatDialogTitle"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MatDialogContent"], _angular_material_list__WEBPACK_IMPORTED_MODULE_2__["MatSelectionList"], _angular_common__WEBPACK_IMPORTED_MODULE_3__["NgForOf"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MatDialogActions"], _angular_material_button__WEBPACK_IMPORTED_MODULE_4__["MatButton"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MatDialogClose"], _angular_material_list__WEBPACK_IMPORTED_MODULE_2__["MatListOption"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJkaWFsb2cuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ "Zl6m":
/*!******************************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/default-data/certificates.ts ***!
  \******************************************************************/
/*! exports provided: EMPTY_CERTIFICATE */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EMPTY_CERTIFICATE", function() { return EMPTY_CERTIFICATE; });
const EMPTY_CERTIFICATE = {
    issuerName: 'Тестовый сертификат',
    isValid: true,
    name: 'Test Certificate',
    thumbprint: 'A2C5DF002CF2260D13D38186AE8C99C9BE660602',
    validFrom: '2021-04-05T16:35:09.000Z',
    validTo: '2021-07-05T16:45:09.000Z'
};


/***/ }),

/***/ "cbmc":
/*!***********************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/crypto-pro.service.ts ***!
  \***********************************************************/
/*! exports provided: CryptoProService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CryptoProService", function() { return CryptoProService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _epsr_crypto_pro__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @epsr/crypto-pro */ "CT4D");
/* harmony import */ var _epsr_crypto_pro__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_epsr_crypto_pro__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./models */ "Hbtn");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "fXoL");






class CryptoProService {
    constructor() {
        this.isPlugin = false;
        // Отключить модальное окно с просьбой скачать плагин (встроенное в cadesplugin)
        if ('cadesplugin_skip_extension_install' in window) {
            //@ts-ignore
            window.cadesplugin_skip_extension_install = true;
        }
    }
    isPluginValid() {
        return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["from"])(Object(_epsr_crypto_pro__WEBPACK_IMPORTED_MODULE_2__["isValidSystemSetup"])()).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((value) => this.isPlugin = value, Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])(err => {
            this.isPlugin = false;
            return err;
        })));
    }
    getPluginInfo() {
        return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["from"])(Object(_epsr_crypto_pro__WEBPACK_IMPORTED_MODULE_2__["getSystemInfo"])()).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])(info => new _models__WEBPACK_IMPORTED_MODULE_4__["CryptoProPluginInfo"](info)));
    }
    getUserCertificates() {
        return new rxjs__WEBPACK_IMPORTED_MODULE_1__["Observable"](observer => Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["from"])(Object(_epsr_crypto_pro__WEBPACK_IMPORTED_MODULE_2__["getUserCertificates"])(true))
            .subscribe(observer));
    }
    createFileSignature(thumbprint, fileBlob) {
        return new rxjs__WEBPACK_IMPORTED_MODULE_1__["Observable"](observer => Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["from"])(this.createFileDetachedSignature(thumbprint, fileBlob))
            .subscribe(observer));
    }
    createXMLSignature(thumbprint, unencryptedMessage) {
        return new rxjs__WEBPACK_IMPORTED_MODULE_1__["Observable"](observer => Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["from"])(this.createXMLSignaturePromise(thumbprint, unencryptedMessage))
            .subscribe(observer));
    }
    createXMLSignaturePromise(thumbprint, unencryptedMessage) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return yield Object(_epsr_crypto_pro__WEBPACK_IMPORTED_MODULE_2__["createXMLSignature"])(thumbprint, unencryptedMessage);
        });
    }
    createFileDetachedSignature(thumbprint, fileBlob) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const data = yield fileBlob.arrayBuffer();
            const hash = yield Object(_epsr_crypto_pro__WEBPACK_IMPORTED_MODULE_2__["createHash"])(data);
            return yield Object(_epsr_crypto_pro__WEBPACK_IMPORTED_MODULE_2__["createDetachedSignature"])(thumbprint, hash);
        });
    }
}
CryptoProService.ɵfac = function CryptoProService_Factory(t) { return new (t || CryptoProService)(); };
CryptoProService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjectable"]({ token: CryptoProService, factory: CryptoProService.ɵfac });


/***/ }),

/***/ "co8t":
/*!****************************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/models/error-crypto-pro.ts ***!
  \****************************************************************/
/*! exports provided: ErrorCryptoPro */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ErrorCryptoPro", function() { return ErrorCryptoPro; });
var ErrorCryptoPro;
(function (ErrorCryptoPro) {
    ErrorCryptoPro[ErrorCryptoPro["CertificateNotFound"] = 0] = "CertificateNotFound";
    ErrorCryptoPro[ErrorCryptoPro["PluginNotFined"] = 1] = "PluginNotFined";
    ErrorCryptoPro[ErrorCryptoPro["SignNotInGOST"] = 2] = "SignNotInGOST";
    ErrorCryptoPro[ErrorCryptoPro["SignError"] = 3] = "SignError";
    ErrorCryptoPro[ErrorCryptoPro["Success"] = 4] = "Success";
})(ErrorCryptoPro || (ErrorCryptoPro = {}));


/***/ }),

/***/ "pFe+":
/*!*****************************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/models/crypto-pro-plugin.ts ***!
  \*****************************************************************/
/*! exports provided: CryptoProPluginInfo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CryptoProPluginInfo", function() { return CryptoProPluginInfo; });
class CryptoProPluginInfo {
    constructor({ cadesVersion, cspVersion }) {
        this.pluginVersion = cadesVersion;
        this.cspVersion = cspVersion;
    }
}


/***/ }),

/***/ "rYp4":
/*!***********************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/models/certificate.ts ***!
  \***********************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "vY5A":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");



const routes = [];
class AppRoutingModule {
}
AppRoutingModule.ɵfac = function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); };
AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"].forRoot(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] }); })();


/***/ }),

/***/ "wwlw":
/*!*************************************************************!*\
  !*** ./projects/e-sign-lib/src/lib/xml-e-sign.directive.ts ***!
  \*************************************************************/
/*! exports provided: XMLESignDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "XMLESignDirective", function() { return XMLESignDirective; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var js2xmlparser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! js2xmlparser */ "P1SL");
/* harmony import */ var js2xmlparser__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(js2xmlparser__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _mapper_certificates_mapper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mapper/certificates.mapper */ "HhWF");
/* harmony import */ var _default_data_certificates__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./default-data/certificates */ "Zl6m");
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./models */ "Hbtn");
/* harmony import */ var _crypto_pro_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./crypto-pro.service */ "cbmc");









class XMLESignDirective {
    constructor(cryptoService) {
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
        this.signEvent$ = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](null);
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
        this.successResult = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"](null);
        /**
         * @description События ошибок
         */
        this.failedResult = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"](null);
        /**
         *
         * @param body - тело xml с данными пользователя (строка)
         * @param b64cert - сертификат (строка)
         * @param signMethod - метод подписи (строка)
         * @param digestMethod - что-то для канонизации XML (строка)
         */
        this.getXMLTemplate = (body, b64cert, signMethod, digestMethod) => {
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
    keyEvent(event) {
        if (event.altKey && event.code === 'KeyS') {
            this.isTestingMode = !this.isTestingMode;
            localStorage.setItem('SIGN_XML_TESTING_MODE', String(this.isTestingMode));
            console.log('SIGN_XML_TESTING_MODE: ', this.isTestingMode ? 'on' : 'off');
        }
    }
    /**
     * @description слушатель событий подписи
     * Внутри observable - в него пушатся события успеха или ошибки
     * Тут они обрабатываются
     * @private
     */
    listenSignEvents() {
        return this.signEvent$
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["filter"])(response => response), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((response) => {
            const { status, payload } = response;
            this.signInProgress = false;
            if (status === _models__WEBPACK_IMPORTED_MODULE_6__["ErrorCryptoPro"].Success) {
                this.successResult.emit({ status, payload });
                this.selectedCertificate = null;
                if (this.isNeedDownloadFile) {
                    this.downloadFile(payload, 'signed.xml');
                }
                return;
            }
            else {
                // обработка ошибок
                if (this.selectedCertificate) {
                    this.selectedCertificate.isValid = false;
                    this.selectedCertificate.class = 'disabled';
                }
                this.failedResult.emit({ status, payload });
                return;
            }
        })).subscribe();
    }
    /**
     * @description Проверить наличие плагина
     */
    checkPlugin() {
        this.isPluginValid = this.cryptoService.isPlugin;
        if (!this.isPluginValid && !this.isTestingMode) {
            this.signEvent$.next({
                status: _models__WEBPACK_IMPORTED_MODULE_6__["ErrorCryptoPro"].PluginNotFined,
                payload: 'Требуется  КриптоПро ЭЦП Browser plug-in и установленная ЭЦП'
            });
        }
    }
    /**
     * @description Если сертификат выбран
     * @param certificate
     */
    onCertificateSelected(certificate) {
        this.selectedCertificate = certificate;
    }
    /**
     * @description Получить список сертификатов
     */
    getCertificates() {
        if (!this.jsonObject) {
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["of"])(null);
        }
        const successFn = () => {
            return this.cryptoService.getUserCertificates();
        };
        const failFn = () => {
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["of"])(this.isTestingMode ? [_default_data_certificates__WEBPACK_IMPORTED_MODULE_5__["EMPTY_CERTIFICATE"]] : []);
        };
        const action = () => {
            this.checkPlugin();
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["iif"])(() => this.isPluginValid, successFn(), failFn()).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["map"])((certificates) => certificates.map(c => _mapper_certificates_mapper__WEBPACK_IMPORTED_MODULE_4__["CertificatesMapper"].map(c))), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])(certificates => {
                this.certificates = certificates;
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])(error => {
                this.certificates = [];
                this.signEvent$.next({
                    status: _models__WEBPACK_IMPORTED_MODULE_6__["ErrorCryptoPro"].PluginNotFined,
                    payload: 'Требуется  КриптоПро ЭЦП Browser plug-in и установленная ЭЦП'
                });
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["throwError"])(error);
            }));
        };
        return action();
    }
    /**
     *
     * @param text - содержимое файла (строка)
     * @param filename - имя файла
     * @private
     */
    downloadFile(text, filename = 'filename.xml') {
        const pom = document.createElement('a');
        const bb = new Blob([text], { type: 'text/plain' });
        pom.setAttribute('href', window.URL.createObjectURL(bb));
        pom.setAttribute('download', filename);
        pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
        pom.draggable = true;
        pom.classList.add('dragout');
        pom.click();
        pom.remove();
    }
    /**
     * @description пользовательский JSON в XML (без мета инфы что это xml)
     */
    get jsonToXml() {
        return js2xmlparser__WEBPACK_IMPORTED_MODULE_3__["parse"](this.rootField, this.jsonObject).replace('<?xml version=\'1.0\'?>\n', '');
    }
    /**
     * @description Генерим xml, и отдаем на подпись - если мы в режиме тестирования
     * сразу отдаем xml (буд-то он подписан)
     */
    sign() {
        const xmlData = this.jsonToXml;
        this.signInProgress = true;
        if (!this.selectedCertificate || this.selectedCertificate.thumbprint === _default_data_certificates__WEBPACK_IMPORTED_MODULE_5__["EMPTY_CERTIFICATE"].thumbprint) {
            const response = this.isTestingMode ?
                { status: _models__WEBPACK_IMPORTED_MODULE_6__["ErrorCryptoPro"].Success, payload: this.getXMLTemplate(xmlData, '', '', '') } :
                {
                    status: _models__WEBPACK_IMPORTED_MODULE_6__["ErrorCryptoPro"].PluginNotFined,
                    payload: 'Требуется  КриптоПро ЭЦП Browser plug-in и установленная ЭЦП'
                };
            this.signEvent$.next(response);
            return;
        }
        else {
            this.signXML(this.selectedCertificate.thumbprint, xmlData);
        }
    }
    /**
     *
     * @param sCertName - имя сертификата  (строка)
     * @param body - строка, которая допишется в xml  (строка)
     * @private
     */
    signXML(sCertName, body) {
        // const CAPICOM_CURRENT_USER_STORE = 2;
        // const CAPICOM_MY_STORE = 'My';
        // const CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 2;
        const CADESCOM_CONTAINER_STORE = 100;
        const CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
        // const CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME = 1;
        const CADESCOM_XML_SIGNATURE_TYPE_TEMPLATE = 2;
        const CADESCOM_ENCODE_BASE64 = 0;
        const run = () => {
            const that = this;
            // @ts-ignore
            cadesplugin.async_spawn(function* (args) {
                // Здесь следует заполнить SubjectName сертификата
                // let sCertName = oCertName.value;
                if ('' === sCertName) {
                    alert('Введите имя сертификата (CN).');
                    return;
                }
                // Ищем сертификат для подписи
                // @ts-ignore
                const oStore = yield cadesplugin.CreateObjectAsync('CAdESCOM.Store');
                yield oStore.Open(CADESCOM_CONTAINER_STORE);
                const oStoreCerts = yield oStore.Certificates;
                const oCertificates = yield oStoreCerts.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, sCertName);
                const certsCount = yield oCertificates.Count;
                if (certsCount === 0) {
                    that.signEvent$.next({ status: _models__WEBPACK_IMPORTED_MODULE_6__["ErrorCryptoPro"].CertificateNotFound, payload: sCertName });
                    // alert("Certificate not found: " + sCertName);
                    return;
                }
                const oCertificate = yield oCertificates.Item(1);
                yield oStore.Close();
                const oPublicKey = yield oCertificate.PublicKey();
                const oAlgorithm = yield oPublicKey.Algorithm;
                const algoOid = yield oAlgorithm.Value;
                let signMethod = '';
                let digestMethod = '';
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
                    const errormes = 'Поддерживается XML подпись сертификатами только с алгоритмом ГОСТ Р 34.10-2012, ГОСТ Р 34.10-2001';
                    that.signEvent$.next({ status: _models__WEBPACK_IMPORTED_MODULE_6__["ErrorCryptoPro"].SignNotInGOST, payload: errormes });
                    // alert(errormes);
                }
                let b64cert = yield oCertificate.Export(CADESCOM_ENCODE_BASE64);
                b64cert = b64cert.replace(/[\r\n]/g, '');
                // В шаблоне документа обязательно должны присутствовать следующие элементы:
                // BinarySecurityToken - сертификат ключа подписи в кодировке BASE64
                //                       атрибут Id должен содержать уникальный идентификатор
                //                       сертификата в документе
                // Signature - элемент с описанием свойств подписи:
                //     SignedInfo - информация о подписываемых элементах:
                //         CanonicalizationMethod - алгоритм приведения к каноническому виду.
                //                                  Для СМЭВ "http://www.w3.org/2001/10/xml-exc-c14n#"
                //         SignatureMethod - идентификатор алгоритма подписи.
                //                           Для СМЭВ "http://www.w3.org/2001/04/xmldsig-more#gostr34102001-gostr3411"
                //         Reference - атрибут URI должен содержать ссылку на подписываемые элементы в вашем документе:
                //             Transforms - преобразования, которые следует применить к подписываемым элементам.
                //                          В примере - приведение к каноническому виду.
                //             DigestMethod - идентификатор алгоритма хэширования.
                //                            Для СМЭВ "http://www.w3.org/2001/04/xmldsig-more#gostr3411"
                //             DigestValue - Хэш-значение подписываемых элементов. Данный элемент следует оставить пустым.
                //                           Его значение будет заполнено при создании подписи.
                //     SignatureValue - значение подписи. Данный элемент следует оставить пустым.
                //                      Его значение будет заполнено при создании подписи.
                //     KeyInfo - информация о сертификате ключа подписи
                //         SecurityTokenReference - ссылка на сертификат
                //             Reference - атрибут ValueType должен содержать значение
                //                         "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3"
                //                         Атрибут URI должен содержать ссылку на уникальный идентификатор
                //                         сертификата (такой же, как указан в элементе BinarySecurityToken)
                const sContent = that.getXMLTemplate(body, b64cert, signMethod, digestMethod);
                // Создаем объект CAdESCOM.CPSigner
                // @ts-ignore
                const oSigner = yield cadesplugin.CreateObjectAsync('CAdESCOM.CPSigner');
                yield oSigner.propset_Certificate(oCertificate);
                yield oSigner.propset_CheckCertificate(true);
                // Создаем объект CAdESCOM.SignedXML
                // @ts-ignore
                const oSignedXML = yield cadesplugin.CreateObjectAsync('CAdESCOM.SignedXML');
                yield oSignedXML.propset_Content(sContent);
                // Указываем тип подписи - в данном случае по шаблону
                yield oSignedXML.propset_SignatureType(CADESCOM_XML_SIGNATURE_TYPE_TEMPLATE);
                let sSignedMessage = '';
                try {
                    sSignedMessage = yield oSignedXML.Sign(oSigner);
                    that.signEvent$.next({ status: _models__WEBPACK_IMPORTED_MODULE_6__["ErrorCryptoPro"].Success, payload: sSignedMessage });
                }
                catch (err) {
                    // @ts-ignore
                    that.signEvent$.next({ status: _models__WEBPACK_IMPORTED_MODULE_6__["ErrorCryptoPro"].SignError, payload: cadesplugin.getLastError(err.message) });
                    // alert("Failed to create signature. Error: " + cadesplugin.getLastError(err));
                    return;
                }
                // Полученный подписанный XML-документ должен проходить проверку на сайте СМЭВ
                // console.log(sSignedMessage);
                // Verification
                // Создаем объект CAdESCOM.SignedXML
                // @ts-ignore
                // let oSignedXML2 = yield cadesplugin.CreateObjectAsync("CAdESCOM.SignedXML");
                // try {
                //   yield oSignedXML2.Verify(sSignedMessage);
                //   alert("Signature verified");
                // } catch (err) {
                //   // @ts-ignore
                //   alert("Failed to verify signature. Error: " + cadesplugin.getLastError(err));
                //   return false;
                // }
            });
        };
        run();
    }
}
XMLESignDirective.ɵfac = function XMLESignDirective_Factory(t) { return new (t || XMLESignDirective)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_crypto_pro_service__WEBPACK_IMPORTED_MODULE_7__["CryptoProService"])); };
XMLESignDirective.ɵdir = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineDirective"]({ type: XMLESignDirective, selectors: [["", "xml-e-sign", ""]], hostBindings: function XMLESignDirective_HostBindings(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("keyup", function XMLESignDirective_keyup_HostBindingHandler($event) { return ctx.keyEvent($event); }, false, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵresolveWindow"]);
    } }, inputs: { rootField: "rootField", jsonObject: "jsonObject", isNeedDownloadFile: "isNeedDownloadFile" }, outputs: { successResult: "successResult", failedResult: "failedResult" }, exportAs: ["xmlESign"] });


/***/ }),

/***/ "zUnb":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "ZAI4");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "AytR");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ "zn8P":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "zn8P";

/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map