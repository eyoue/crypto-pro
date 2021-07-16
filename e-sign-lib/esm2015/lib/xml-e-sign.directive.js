import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { BehaviorSubject, iif, of, throwError } from "rxjs";
import { catchError, filter, map, tap } from "rxjs/operators";
import * as JsonToXML from "js2xmlparser";
import { CertificatesMapper } from "./mapper/certificates.mapper";
import { EMPTY_CERTIFICATE } from "./default-data/certificates";
import { ErrorCryptoPro } from "./models";
import * as i0 from "@angular/core";
import * as i1 from "./crypto-pro.service";
export class XMLESignDirective {
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
        this.signEvent$ = new BehaviorSubject(null);
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
        this.successResult = new EventEmitter(null);
        /**
         * @description События ошибок
         */
        this.failedResult = new EventEmitter(null);
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
            .pipe(filter(response => response), tap((response) => {
            const { status, payload } = response;
            this.signInProgress = false;
            if (status === ErrorCryptoPro.Success) {
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
                status: ErrorCryptoPro.PluginNotFined,
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
            return of(null);
        }
        const successFn = () => {
            return this.cryptoService.getUserCertificates();
        };
        const failFn = () => {
            return of(this.isTestingMode ? [EMPTY_CERTIFICATE] : []);
        };
        const action = () => {
            this.checkPlugin();
            return iif(() => this.isPluginValid, successFn(), failFn()).pipe(map((certificates) => certificates.map(c => CertificatesMapper.map(c))), tap(certificates => {
                this.certificates = certificates;
            }), catchError(error => {
                this.certificates = [];
                this.signEvent$.next({
                    status: ErrorCryptoPro.PluginNotFined,
                    payload: 'Требуется  КриптоПро ЭЦП Browser plug-in и установленная ЭЦП'
                });
                return throwError(error);
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
        return JsonToXML.parse(this.rootField, this.jsonObject).replace('<?xml version=\'1.0\'?>\n', '');
    }
    /**
     * @description Генерим xml, и отдаем на подпись - если мы в режиме тестирования
     * сразу отдаем xml (буд-то он подписан)
     */
    sign() {
        const xmlData = this.jsonToXml;
        this.signInProgress = true;
        if (!this.selectedCertificate || this.selectedCertificate.thumbprint === EMPTY_CERTIFICATE.thumbprint) {
            const response = this.isTestingMode ?
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
    }
    /**
     *
     * @param sCertName - имя сертификата  (строка)
     * @param body - строка, которая допишется в xml  (строка)
     * @private
     */
    signXML(sCertName, body) {
        const CAPICOM_CURRENT_USER_STORE = 2;
        const CAPICOM_MY_STORE = 'My';
        const CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 2;
        const CAPICOM_SMART_CARD_USER_STORE = 4;
        const CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
        const CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME = 1;
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
                yield oStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE, CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED, CAPICOM_SMART_CARD_USER_STORE);
                const oStoreCerts = yield oStore.Certificates;
                const oCertificates = yield oStoreCerts.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, sCertName);
                const certsCount = yield oCertificates.Count;
                if (certsCount === 0) {
                    that.signEvent$.next({ status: ErrorCryptoPro.CertificateNotFound, payload: sCertName });
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
                    that.signEvent$.next({ status: ErrorCryptoPro.SignNotInGOST, payload: errormes });
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
                    that.signEvent$.next({ status: ErrorCryptoPro.Success, payload: sSignedMessage });
                }
                catch (err) {
                    // @ts-ignore
                    that.signEvent$.next({ status: ErrorCryptoPro.SignError, payload: cadesplugin.getLastError(err.message) });
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
XMLESignDirective.ɵfac = function XMLESignDirective_Factory(t) { return new (t || XMLESignDirective)(i0.ɵɵdirectiveInject(i1.CryptoProService)); };
XMLESignDirective.ɵdir = i0.ɵɵdefineDirective({ type: XMLESignDirective, selectors: [["", "xml-e-sign", ""]], hostBindings: function XMLESignDirective_HostBindings(rf, ctx) { if (rf & 1) {
        i0.ɵɵlistener("keyup", function XMLESignDirective_keyup_HostBindingHandler($event) { return ctx.keyEvent($event); }, false, i0.ɵɵresolveWindow);
    } }, inputs: { rootField: "rootField", jsonObject: "jsonObject", isNeedDownloadFile: "isNeedDownloadFile" }, outputs: { successResult: "successResult", failedResult: "failedResult" }, exportAs: ["xmlESign"] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(XMLESignDirective, [{
        type: Directive,
        args: [{
                selector: '[xml-e-sign]',
                exportAs: 'xmlESign'
            }]
    }], function () { return [{ type: i1.CryptoProService }]; }, { rootField: [{
            type: Input
        }], jsonObject: [{
            type: Input
        }], isNeedDownloadFile: [{
            type: Input
        }], successResult: [{
            type: Output
        }], failedResult: [{
            type: Output
        }], keyEvent: [{
            type: HostListener,
            args: ['window:keyup', ['$event']]
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sLWUtc2lnbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9lLXNpZ24tbGliL3NyYy9saWIveG1sLWUtc2lnbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFDLGVBQWUsRUFBRSxHQUFHLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN0RSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUQsT0FBTyxLQUFLLFNBQVMsTUFBTSxjQUFjLENBQUM7QUFFMUMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDOUQsT0FBTyxFQUFtQixjQUFjLEVBQWMsTUFBTSxVQUFVLENBQUM7OztBQU12RSxNQUFNLE9BQU8saUJBQWlCO0lBNEU1QixZQUFvQixhQUErQjtRQUEvQixrQkFBYSxHQUFiLGFBQWEsQ0FBa0I7UUFoRW5EOztXQUVHO1FBQ0gsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFFdEI7O1dBRUc7UUFDSCxtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUV2Qjs7V0FFRztRQUNILGVBQVUsR0FBRyxJQUFJLGVBQWUsQ0FBTSxJQUFJLENBQUMsQ0FBQztRQUU1Qzs7V0FFRztRQUNILGtCQUFhLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLE1BQU0sQ0FBQztRQUV6RTs7V0FFRztRQUVILGNBQVMsR0FBRyxNQUFNLENBQUM7UUFFbkI7O1dBRUc7UUFFSCxlQUFVLEdBQUcsRUFBRSxDQUFDO1FBRWhCOztXQUVHO1FBRUgsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBRTNCOztXQUVHO1FBRUgsa0JBQWEsR0FBRyxJQUFJLFlBQVksQ0FBYyxJQUFJLENBQUMsQ0FBQztRQUVwRDs7V0FFRztRQUVILGlCQUFZLEdBQUcsSUFBSSxZQUFZLENBQWMsSUFBSSxDQUFDLENBQUM7UUFnS25EOzs7Ozs7V0FNRztRQUNILG1CQUFjLEdBQUcsQ0FBQyxJQUFZLEVBQUUsT0FBZSxFQUFFLFVBQWtCLEVBQUUsWUFBb0IsRUFBRSxFQUFFO1lBQzNGLE9BQU8sd0NBQXdDO2dCQUM3QywrSkFBK0o7Z0JBQy9KLGdCQUFnQjtnQkFDaEIsc0xBQXNMO2dCQUN0TCx3U0FBd1M7a0JBQ3RTLE9BQU87Z0JBQ1QsMEJBQTBCO2dCQUMxQixvRUFBb0U7Z0JBQ3BFLDhCQUE4QjtnQkFDOUIsb0dBQW9HO2dCQUNwRyxrREFBa0QsR0FBRyxVQUFVLEdBQUcsS0FBSztnQkFDdkUsMkNBQTJDO2dCQUMzQyxzQ0FBc0M7Z0JBQ3RDLCtGQUErRjtnQkFDL0YsdUNBQXVDO2dCQUN2QyxtREFBbUQsR0FBRyxZQUFZLEdBQUcsS0FBSztnQkFDMUUscURBQXFEO2dCQUNyRCxrQ0FBa0M7Z0JBQ2xDLCtCQUErQjtnQkFDL0IsbURBQW1EO2dCQUNuRCwyQkFBMkI7Z0JBQzNCLGdEQUFnRDtnQkFDaEQsMExBQTBMO2dCQUMxTCxpREFBaUQ7Z0JBQ2pELDRCQUE0QjtnQkFDNUIsMEJBQTBCO2dCQUMxQix1QkFBdUI7Z0JBQ3ZCLGlCQUFpQjtnQkFDakIsMkhBQTJIO2dCQUMzSCxJQUFJO2dCQUNKLGVBQWU7Z0JBQ2YsZUFBZSxDQUFDO1FBQ3BCLENBQUMsQ0FBQTtRQXZMQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBaEJEOzs7O09BSUc7SUFFSCxRQUFRLENBQUMsS0FBb0I7UUFDM0IsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3pDLFlBQVksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMzRTtJQUNILENBQUM7SUFNRDs7Ozs7T0FLRztJQUNJLGdCQUFnQjtRQUNyQixPQUFPLElBQUksQ0FBQyxVQUFVO2FBQ25CLElBQUksQ0FDSCxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDNUIsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDZixNQUFNLEVBQUMsTUFBTSxFQUFFLE9BQU8sRUFBQyxHQUFHLFFBQVEsQ0FBQztZQUNuQyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztZQUM1QixJQUFJLE1BQU0sS0FBSyxjQUFjLENBQUMsT0FBTyxFQUFFO2dCQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7aUJBQzFDO2dCQUNELE9BQU87YUFDUjtpQkFBTTtnQkFDTCxtQkFBbUI7Z0JBQ25CLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO29CQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztvQkFDekMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7aUJBQzdDO2dCQUNELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUMsTUFBTSxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7Z0JBQzFDLE9BQU87YUFDUjtRQUNILENBQUMsQ0FBQyxDQUNILENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsV0FBVztRQUNULElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7UUFFakQsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQzlDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUNuQixNQUFNLEVBQUUsY0FBYyxDQUFDLGNBQWM7Z0JBQ3JDLE9BQU8sRUFBRSw4REFBOEQ7YUFDeEUsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gscUJBQXFCLENBQUMsV0FBNkI7UUFDakQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFdBQVcsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxlQUFlO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDcEIsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakI7UUFDRCxNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUU7WUFDckIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDbEQsQ0FBQyxDQUFDO1FBQ0YsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFO1lBQ2xCLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDO1FBQ0YsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUNqQyxTQUFTLEVBQUUsRUFDWCxNQUFNLEVBQUUsQ0FDVCxDQUFDLElBQUksQ0FDSixHQUFHLENBQUMsQ0FBQyxZQUFtQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDOUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNqQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztZQUNuQyxDQUFDLENBQUMsRUFDRixVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztvQkFDbkIsTUFBTSxFQUFFLGNBQWMsQ0FBQyxjQUFjO29CQUNyQyxPQUFPLEVBQUUsOERBQThEO2lCQUN4RSxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUNKLENBQUMsQ0FBQztRQUNGLE9BQU8sTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssWUFBWSxDQUFDLElBQVksRUFBRSxRQUFRLEdBQUcsY0FBYztRQUMxRCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQztRQUVsRCxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pELEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXZDLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzRSxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUNyQixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU3QixHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJLFNBQVM7UUFDWCxPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25HLENBQUM7SUFFRDs7O09BR0c7SUFDSSxJQUFJO1FBQ1QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEtBQUssaUJBQWlCLENBQUMsVUFBVSxFQUFFO1lBQ3JHLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDbkMsRUFBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7Z0JBQ3JGO29CQUNFLE1BQU0sRUFBRSxjQUFjLENBQUMsY0FBYztvQkFDckMsT0FBTyxFQUFFLDhEQUE4RDtpQkFDeEUsQ0FBQztZQUNKLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9CLE9BQU87U0FDUjthQUFNO1lBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzVEO0lBQ0gsQ0FBQztJQTRDRDs7Ozs7T0FLRztJQUNLLE9BQU8sQ0FBQyxTQUFpQixFQUFFLElBQVk7UUFDN0MsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLENBQUM7UUFDckMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDOUIsTUFBTSxrQ0FBa0MsR0FBRyxDQUFDLENBQUM7UUFDN0MsTUFBTSw2QkFBNkIsR0FBRyxDQUFDLENBQUM7UUFDeEMsTUFBTSxrQ0FBa0MsR0FBRyxDQUFDLENBQUM7UUFDN0MsTUFBTSxxQ0FBcUMsR0FBRyxDQUFDLENBQUM7UUFDaEQsTUFBTSxvQ0FBb0MsR0FBRyxDQUFDLENBQUM7UUFDL0MsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUM7UUFFakMsTUFBTSxHQUFHLEdBQUcsR0FBRyxFQUFFO1lBQ2YsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLGFBQWE7WUFDYixXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUk7Z0JBQ3JDLGtEQUFrRDtnQkFDbEQsbUNBQW1DO2dCQUVuQyxJQUFJLEVBQUUsS0FBSyxTQUFTLEVBQUU7b0JBQ3BCLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO29CQUN2QyxPQUFPO2lCQUNSO2dCQUVELDhCQUE4QjtnQkFDOUIsYUFBYTtnQkFDYixNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNyRSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsZ0JBQWdCLEVBQzVELGtDQUFrQyxFQUFFLDZCQUE2QixDQUFDLENBQUM7Z0JBRXJFLE1BQU0sV0FBVyxHQUFHLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQztnQkFDOUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxXQUFXLENBQUMsSUFBSSxDQUMxQyxrQ0FBa0MsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDakQsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLENBQUMsS0FBSyxDQUFDO2dCQUM3QyxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztvQkFDdkYsZ0RBQWdEO29CQUNoRCxPQUFPO2lCQUNSO2dCQUNELE1BQU0sWUFBWSxHQUFHLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakQsTUFBTSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRXJCLE1BQU0sVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNsRCxNQUFNLFVBQVUsR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUM7Z0JBQzlDLE1BQU0sT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDLEtBQUssQ0FBQztnQkFDdkMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7Z0JBQ3RCLElBQUksT0FBTyxLQUFLLG1CQUFtQixFQUFFLEVBQUksc0RBQXNEO29CQUM3RixVQUFVLEdBQUcsNEVBQTRFLENBQUM7b0JBQzFGLFlBQVksR0FBRyw4REFBOEQsQ0FBQztpQkFDL0U7cUJBQU0sSUFBSSxPQUFPLEtBQUssbUJBQW1CLEVBQUUsRUFBSSxzREFBc0Q7b0JBQ3BHLFVBQVUsR0FBRyw0RUFBNEUsQ0FBQztvQkFDMUYsWUFBWSxHQUFHLDhEQUE4RCxDQUFDO2lCQUMvRTtxQkFBTSxJQUFJLE9BQU8sS0FBSyxnQkFBZ0IsRUFBRSxFQUFHLDZCQUE2QjtvQkFDdkUsVUFBVSxHQUFHLG9FQUFvRSxDQUFDO29CQUNsRixZQUFZLEdBQUcsc0RBQXNELENBQUM7aUJBQ3ZFO3FCQUFNO29CQUNMLE1BQU0sUUFBUSxHQUFHLG1HQUFtRyxDQUFDO29CQUNySCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO29CQUNoRixtQkFBbUI7aUJBQ3BCO2dCQUVELElBQUksT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNoRSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRXpDLDRFQUE0RTtnQkFDNUUsb0VBQW9FO2dCQUNwRSw2RUFBNkU7Z0JBQzdFLGdEQUFnRDtnQkFDaEQsbURBQW1EO2dCQUNuRCx5REFBeUQ7Z0JBQ3pELDZFQUE2RTtnQkFDN0Usc0ZBQXNGO2dCQUN0Riw2REFBNkQ7Z0JBQzdELHNHQUFzRztnQkFDdEcsdUdBQXVHO2dCQUN2RyxnR0FBZ0c7Z0JBQ2hHLHdFQUF3RTtnQkFDeEUsa0VBQWtFO2dCQUNsRSx5RkFBeUY7Z0JBQ3pGLDBHQUEwRztnQkFDMUcsK0VBQStFO2dCQUMvRSxpRkFBaUY7Z0JBQ2pGLDBFQUEwRTtnQkFDMUUsdURBQXVEO2dCQUN2RCx3REFBd0Q7Z0JBQ3hELHNFQUFzRTtnQkFDdEUsa0hBQWtIO2dCQUNsSCwwRkFBMEY7Z0JBQzFGLDRGQUE0RjtnQkFDNUYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFFOUUsbUNBQW1DO2dCQUNuQyxhQUFhO2dCQUNiLE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ3pFLE1BQU0sT0FBTyxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFN0Msb0NBQW9DO2dCQUNwQyxhQUFhO2dCQUNiLE1BQU0sVUFBVSxHQUFHLE1BQU0sV0FBVyxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQzdFLE1BQU0sVUFBVSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFM0MscURBQXFEO2dCQUNyRCxNQUFNLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO2dCQUU3RSxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7Z0JBQ3hCLElBQUk7b0JBQ0YsY0FBYyxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDaEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFDLENBQUMsQ0FBQztpQkFDakY7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ1osYUFBYTtvQkFDYixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUM7b0JBQ3pHLGdGQUFnRjtvQkFDaEYsT0FBTztpQkFDUjtnQkFDRCw4RUFBOEU7Z0JBQzlFLCtCQUErQjtnQkFHL0IsZUFBZTtnQkFFZixvQ0FBb0M7Z0JBQ3BDLGFBQWE7Z0JBQ2IsK0VBQStFO2dCQUUvRSxRQUFRO2dCQUNSLDhDQUE4QztnQkFDOUMsaUNBQWlDO2dCQUNqQyxrQkFBa0I7Z0JBQ2xCLGtCQUFrQjtnQkFDbEIsa0ZBQWtGO2dCQUNsRixrQkFBa0I7Z0JBQ2xCLElBQUk7WUFDTixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztRQUVGLEdBQUcsRUFBRSxDQUFDO0lBQ1IsQ0FBQzs7a0ZBcFpVLGlCQUFpQjtzREFBakIsaUJBQWlCO29HQUFqQixvQkFBZ0I7O3VGQUFoQixpQkFBaUI7Y0FKN0IsU0FBUztlQUFDO2dCQUNULFFBQVEsRUFBRSxjQUFjO2dCQUN4QixRQUFRLEVBQUUsVUFBVTthQUNyQjttRUFxQ0MsU0FBUztrQkFEUixLQUFLO1lBT04sVUFBVTtrQkFEVCxLQUFLO1lBT04sa0JBQWtCO2tCQURqQixLQUFLO1lBT04sYUFBYTtrQkFEWixNQUFNO1lBT1AsWUFBWTtrQkFEWCxNQUFNO1lBU1AsUUFBUTtrQkFEUCxZQUFZO21CQUFDLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBFdmVudEVtaXR0ZXIsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIE91dHB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0JlaGF2aW9yU3ViamVjdCwgaWlmLCBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvcn0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7Y2F0Y2hFcnJvciwgZmlsdGVyLCBtYXAsIHRhcH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgKiBhcyBKc29uVG9YTUwgZnJvbSBcImpzMnhtbHBhcnNlclwiO1xuaW1wb3J0IHtDcnlwdG9Qcm9TZXJ2aWNlfSBmcm9tIFwiLi9jcnlwdG8tcHJvLnNlcnZpY2VcIjtcbmltcG9ydCB7Q2VydGlmaWNhdGVzTWFwcGVyfSBmcm9tIFwiLi9tYXBwZXIvY2VydGlmaWNhdGVzLm1hcHBlclwiO1xuaW1wb3J0IHtFTVBUWV9DRVJUSUZJQ0FURX0gZnJvbSBcIi4vZGVmYXVsdC1kYXRhL2NlcnRpZmljYXRlc1wiO1xuaW1wb3J0IHtDZXJ0aWZpY2F0ZU1vZGVsLCBFcnJvckNyeXB0b1BybywgSVNpZ25SZXN1bHR9IGZyb20gXCIuL21vZGVsc1wiO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbeG1sLWUtc2lnbl0nLFxuICBleHBvcnRBczogJ3htbEVTaWduJ1xufSlcbmV4cG9ydCBjbGFzcyBYTUxFU2lnbkRpcmVjdGl2ZSB7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQodC/0LjRgdC+0Log0YHQtdGA0YLQuNGE0LjQutCw0YLQvtCyXG4gICAqL1xuICBjZXJ0aWZpY2F0ZXM6IENlcnRpZmljYXRlTW9kZWxbXTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCS0YvQsdGA0LDQvdC90YvQuSDRgdC10YDRgtC40YTQuNC60LDRglxuICAgKi9cbiAgc2VsZWN0ZWRDZXJ0aWZpY2F0ZTogQ2VydGlmaWNhdGVNb2RlbDtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCf0LvQsNCz0LjQvSDRgNCw0LHQvtGH0LjQuVxuICAgKi9cbiAgaXNQbHVnaW5WYWxpZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0J/QvtC00L/QuNGB0YLRjCDQsiDQv9GA0L7RhtC10YHRgdC1XG4gICAqL1xuICBzaWduSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0KHQvtCx0YvRgtC40Y8g0L/QvtC00L/QuNGB0LggKNC+0YjQuNCx0LrQuCDQuNC70Lgg0YPRgdC/0LXRhSlcbiAgICovXG4gIHNpZ25FdmVudCQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGFueT4obnVsbCk7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQpNC70LDQsyDRgtC10YHRgtC+0LLQvtCz0L4g0YDQtdC20LjQvNCwIChBbHQgKyBTKVxuICAgKi9cbiAgaXNUZXN0aW5nTW9kZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdTSUdOX1hNTF9URVNUSU5HX01PREUnKSA9PT0gJ3RydWUnO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JHQu9C+0Log0LIg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDQv9C+0LvQvtC20LXQvSDRgNCw0YHQv9Cw0YDRgdC10L3QvdGL0Lkg0L7QsdGK0LXQutGCIFhNTFxuICAgKi9cbiAgQElucHV0KClcbiAgcm9vdEZpZWxkID0gJ2h0bWwnO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JjRgdGF0L7QtNC90YvQuSDQvtCx0YrQtdC60YJcbiAgICovXG4gIEBJbnB1dCgpXG4gIGpzb25PYmplY3QgPSB7fTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCk0LvQsNCzINGB0LrQsNGH0LjQstCw0L3QuNGPINGE0LDQudC70LAg0L/RgNC4INC/0L7QtNC/0LjRgdC4XG4gICAqL1xuICBASW5wdXQoKVxuICBpc05lZWREb3dubG9hZEZpbGUgPSBmYWxzZTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCh0L7QsdGL0YLQuNGPINGD0YHQv9C10YXQsFxuICAgKi9cbiAgQE91dHB1dCgpXG4gIHN1Y2Nlc3NSZXN1bHQgPSBuZXcgRXZlbnRFbWl0dGVyPElTaWduUmVzdWx0PihudWxsKTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCh0L7QsdGL0YLQuNGPINC+0YjQuNCx0L7QulxuICAgKi9cbiAgQE91dHB1dCgpXG4gIGZhaWxlZFJlc3VsdCA9IG5ldyBFdmVudEVtaXR0ZXI8SVNpZ25SZXN1bHQ+KG51bGwpO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JLRhdC+0LQg0LIg0YDQtdC20LjQvCDRgtC10YHRgtC40YDQvtCy0YnQuNC60LBcbiAgICog0JXRgdC70Lgg0L3QtSDRg9GB0YLQsNC90L7QstC70LXQvSDQv9C70LDQs9C40L0g0YLQviBBbHQgKyBTXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgQEhvc3RMaXN0ZW5lcignd2luZG93OmtleXVwJywgWyckZXZlbnQnXSlcbiAga2V5RXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuYWx0S2V5ICYmIGV2ZW50LmNvZGUgPT09ICdLZXlTJykge1xuICAgICAgdGhpcy5pc1Rlc3RpbmdNb2RlID0gIXRoaXMuaXNUZXN0aW5nTW9kZTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdTSUdOX1hNTF9URVNUSU5HX01PREUnLCBTdHJpbmcodGhpcy5pc1Rlc3RpbmdNb2RlKSk7XG4gICAgICBjb25zb2xlLmxvZygnU0lHTl9YTUxfVEVTVElOR19NT0RFOiAnLCB0aGlzLmlzVGVzdGluZ01vZGUgPyAnb24nIDogJ29mZicpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY3J5cHRvU2VydmljZTogQ3J5cHRvUHJvU2VydmljZSkge1xuICAgIHRoaXMubGlzdGVuU2lnbkV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDRgdC70YPRiNCw0YLQtdC70Ywg0YHQvtCx0YvRgtC40Lkg0L/QvtC00L/QuNGB0LhcbiAgICog0JLQvdGD0YLRgNC4IG9ic2VydmFibGUgLSDQsiDQvdC10LPQviDQv9GD0YjQsNGC0YHRjyDRgdC+0LHRi9GC0LjRjyDRg9GB0L/QtdGF0LAg0LjQu9C4INC+0YjQuNCx0LrQuFxuICAgKiDQotGD0YIg0L7QvdC4INC+0LHRgNCw0LHQsNGC0YvQstCw0Y7RgtGB0Y9cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHB1YmxpYyBsaXN0ZW5TaWduRXZlbnRzKCkge1xuICAgIHJldHVybiB0aGlzLnNpZ25FdmVudCRcbiAgICAgIC5waXBlKFxuICAgICAgICBmaWx0ZXIocmVzcG9uc2UgPT4gcmVzcG9uc2UpLFxuICAgICAgICB0YXAoKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgY29uc3Qge3N0YXR1cywgcGF5bG9hZH0gPSByZXNwb25zZTtcbiAgICAgICAgICB0aGlzLnNpZ25JblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgICAgaWYgKHN0YXR1cyA9PT0gRXJyb3JDcnlwdG9Qcm8uU3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5zdWNjZXNzUmVzdWx0LmVtaXQoe3N0YXR1cywgcGF5bG9hZH0pO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENlcnRpZmljYXRlID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTmVlZERvd25sb2FkRmlsZSkge1xuICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkRmlsZShwYXlsb2FkLCAnc2lnbmVkLnhtbCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDQvtCx0YDQsNCx0L7RgtC60LAg0L7RiNC40LHQvtC6XG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENlcnRpZmljYXRlKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDZXJ0aWZpY2F0ZS5pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDZXJ0aWZpY2F0ZS5jbGFzcyA9ICdkaXNhYmxlZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZhaWxlZFJlc3VsdC5lbWl0KHtzdGF0dXMsIHBheWxvYWR9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKS5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0J/RgNC+0LLQtdGA0LjRgtGMINC90LDQu9C40YfQuNC1INC/0LvQsNCz0LjQvdCwXG4gICAqL1xuICBjaGVja1BsdWdpbigpIHtcbiAgICB0aGlzLmlzUGx1Z2luVmFsaWQgPSB0aGlzLmNyeXB0b1NlcnZpY2UuaXNQbHVnaW47XG5cbiAgICBpZiAoIXRoaXMuaXNQbHVnaW5WYWxpZCAmJiAhdGhpcy5pc1Rlc3RpbmdNb2RlKSB7XG4gICAgICB0aGlzLnNpZ25FdmVudCQubmV4dCh7XG4gICAgICAgIHN0YXR1czogRXJyb3JDcnlwdG9Qcm8uUGx1Z2luTm90RmluZWQsXG4gICAgICAgIHBheWxvYWQ6ICfQotGA0LXQsdGD0LXRgtGB0Y8gINCa0YDQuNC/0YLQvtCf0YDQviDQrdCm0J8gQnJvd3NlciBwbHVnLWluINC4INGD0YHRgtCw0L3QvtCy0LvQtdC90L3QsNGPINCt0KbQnydcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JXRgdC70Lgg0YHQtdGA0YLQuNGE0LjQutCw0YIg0LLRi9Cx0YDQsNC9XG4gICAqIEBwYXJhbSBjZXJ0aWZpY2F0ZVxuICAgKi9cbiAgb25DZXJ0aWZpY2F0ZVNlbGVjdGVkKGNlcnRpZmljYXRlOiBDZXJ0aWZpY2F0ZU1vZGVsKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZENlcnRpZmljYXRlID0gY2VydGlmaWNhdGU7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCf0L7Qu9GD0YfQuNGC0Ywg0YHQv9C40YHQvtC6INGB0LXRgNGC0LjRhNC40LrQsNGC0L7QslxuICAgKi9cbiAgZ2V0Q2VydGlmaWNhdGVzKCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgaWYgKCF0aGlzLmpzb25PYmplY3QpIHtcbiAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICB9XG4gICAgY29uc3Qgc3VjY2Vzc0ZuID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuY3J5cHRvU2VydmljZS5nZXRVc2VyQ2VydGlmaWNhdGVzKCk7XG4gICAgfTtcbiAgICBjb25zdCBmYWlsRm4gPSAoKSA9PiB7XG4gICAgICByZXR1cm4gb2YodGhpcy5pc1Rlc3RpbmdNb2RlID8gW0VNUFRZX0NFUlRJRklDQVRFXSA6IFtdKTtcbiAgICB9O1xuICAgIGNvbnN0IGFjdGlvbiA9ICgpID0+IHtcbiAgICAgIHRoaXMuY2hlY2tQbHVnaW4oKTtcbiAgICAgIHJldHVybiBpaWYoKCkgPT4gdGhpcy5pc1BsdWdpblZhbGlkLFxuICAgICAgICBzdWNjZXNzRm4oKSxcbiAgICAgICAgZmFpbEZuKClcbiAgICAgICkucGlwZShcbiAgICAgICAgbWFwKChjZXJ0aWZpY2F0ZXM6IGFueVtdKSA9PiBjZXJ0aWZpY2F0ZXMubWFwKGMgPT4gQ2VydGlmaWNhdGVzTWFwcGVyLm1hcChjKSkpLFxuICAgICAgICB0YXAoY2VydGlmaWNhdGVzID0+IHtcbiAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlcyA9IGNlcnRpZmljYXRlcztcbiAgICAgICAgfSksXG4gICAgICAgIGNhdGNoRXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGVzID0gW107XG4gICAgICAgICAgdGhpcy5zaWduRXZlbnQkLm5leHQoe1xuICAgICAgICAgICAgc3RhdHVzOiBFcnJvckNyeXB0b1Byby5QbHVnaW5Ob3RGaW5lZCxcbiAgICAgICAgICAgIHBheWxvYWQ6ICfQotGA0LXQsdGD0LXRgtGB0Y8gINCa0YDQuNC/0YLQvtCf0YDQviDQrdCm0J8gQnJvd3NlciBwbHVnLWluINC4INGD0YHRgtCw0L3QvtCy0LvQtdC90L3QsNGPINCt0KbQnydcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH07XG4gICAgcmV0dXJuIGFjdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB0ZXh0IC0g0YHQvtC00LXRgNC20LjQvNC+0LUg0YTQsNC50LvQsCAo0YHRgtGA0L7QutCwKVxuICAgKiBAcGFyYW0gZmlsZW5hbWUgLSDQuNC80Y8g0YTQsNC50LvQsFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBkb3dubG9hZEZpbGUodGV4dDogc3RyaW5nLCBmaWxlbmFtZSA9ICdmaWxlbmFtZS54bWwnKSB7XG4gICAgY29uc3QgcG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGNvbnN0IGJiID0gbmV3IEJsb2IoW3RleHRdLCB7dHlwZTogJ3RleHQvcGxhaW4nfSk7XG5cbiAgICBwb20uc2V0QXR0cmlidXRlKCdocmVmJywgd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmIpKTtcbiAgICBwb20uc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGZpbGVuYW1lKTtcblxuICAgIHBvbS5kYXRhc2V0LmRvd25sb2FkdXJsID0gWyd0ZXh0L3BsYWluJywgcG9tLmRvd25sb2FkLCBwb20uaHJlZl0uam9pbignOicpO1xuICAgIHBvbS5kcmFnZ2FibGUgPSB0cnVlO1xuICAgIHBvbS5jbGFzc0xpc3QuYWRkKCdkcmFnb3V0Jyk7XG5cbiAgICBwb20uY2xpY2soKTtcbiAgICBwb20ucmVtb3ZlKCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjNGB0LrQuNC5IEpTT04g0LIgWE1MICjQsdC10Lcg0LzQtdGC0LAg0LjQvdGE0Ysg0YfRgtC+INGN0YLQviB4bWwpXG4gICAqL1xuICBnZXQganNvblRvWG1sKCkge1xuICAgIHJldHVybiBKc29uVG9YTUwucGFyc2UodGhpcy5yb290RmllbGQsIHRoaXMuanNvbk9iamVjdCkucmVwbGFjZSgnPD94bWwgdmVyc2lvbj1cXCcxLjBcXCc/PlxcbicsICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JPQtdC90LXRgNC40LwgeG1sLCDQuCDQvtGC0LTQsNC10Lwg0L3QsCDQv9C+0LTQv9C40YHRjCAtINC10YHQu9C4INC80Ysg0LIg0YDQtdC20LjQvNC1INGC0LXRgdGC0LjRgNC+0LLQsNC90LjRj1xuICAgKiDRgdGA0LDQt9GDINC+0YLQtNCw0LXQvCB4bWwgKNCx0YPQtC3RgtC+INC+0L0g0L/QvtC00L/QuNGB0LDQvSlcbiAgICovXG4gIHB1YmxpYyBzaWduKCkge1xuICAgIGNvbnN0IHhtbERhdGEgPSB0aGlzLmpzb25Ub1htbDtcbiAgICB0aGlzLnNpZ25JblByb2dyZXNzID0gdHJ1ZTtcbiAgICBpZiAoIXRoaXMuc2VsZWN0ZWRDZXJ0aWZpY2F0ZSB8fCB0aGlzLnNlbGVjdGVkQ2VydGlmaWNhdGUudGh1bWJwcmludCA9PT0gRU1QVFlfQ0VSVElGSUNBVEUudGh1bWJwcmludCkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSB0aGlzLmlzVGVzdGluZ01vZGUgP1xuICAgICAgICB7c3RhdHVzOiBFcnJvckNyeXB0b1Byby5TdWNjZXNzLCBwYXlsb2FkOiB0aGlzLmdldFhNTFRlbXBsYXRlKHhtbERhdGEsICcnLCAnJywgJycpfSA6XG4gICAgICAgIHtcbiAgICAgICAgICBzdGF0dXM6IEVycm9yQ3J5cHRvUHJvLlBsdWdpbk5vdEZpbmVkLFxuICAgICAgICAgIHBheWxvYWQ6ICfQotGA0LXQsdGD0LXRgtGB0Y8gINCa0YDQuNC/0YLQvtCf0YDQviDQrdCm0J8gQnJvd3NlciBwbHVnLWluINC4INGD0YHRgtCw0L3QvtCy0LvQtdC90L3QsNGPINCt0KbQnydcbiAgICAgICAgfTtcbiAgICAgIHRoaXMuc2lnbkV2ZW50JC5uZXh0KHJlc3BvbnNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaWduWE1MKHRoaXMuc2VsZWN0ZWRDZXJ0aWZpY2F0ZS50aHVtYnByaW50LCB4bWxEYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIGJvZHkgLSDRgtC10LvQviB4bWwg0YEg0LTQsNC90L3Ri9C80Lgg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPICjRgdGC0YDQvtC60LApXG4gICAqIEBwYXJhbSBiNjRjZXJ0IC0g0YHQtdGA0YLQuNGE0LjQutCw0YIgKNGB0YLRgNC+0LrQsClcbiAgICogQHBhcmFtIHNpZ25NZXRob2QgLSDQvNC10YLQvtC0INC/0L7QtNC/0LjRgdC4ICjRgdGC0YDQvtC60LApXG4gICAqIEBwYXJhbSBkaWdlc3RNZXRob2QgLSDRh9GC0L4t0YLQviDQtNC70Y8g0LrQsNC90L7QvdC40LfQsNGG0LjQuCBYTUwgKNGB0YLRgNC+0LrQsClcbiAgICovXG4gIGdldFhNTFRlbXBsYXRlID0gKGJvZHk6IHN0cmluZywgYjY0Y2VydDogc3RyaW5nLCBzaWduTWV0aG9kOiBzdHJpbmcsIGRpZ2VzdE1ldGhvZDogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuICc8P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJVVEYtOFwiPz4nICtcbiAgICAgICc8czpFbnZlbG9wZSB4bWxuczpzPVwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvc29hcC9lbnZlbG9wZS9cIiB4bWxuczp1PVwiaHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvd3NzLzIwMDQvMDEvb2FzaXMtMjAwNDAxLXdzcy13c3NlY3VyaXR5LXV0aWxpdHktMS4wLnhzZFwiPicgK1xuICAgICAgJyAgICA8czpIZWFkZXI+JyArXG4gICAgICAnICAgICAgICA8bzpTZWN1cml0eSBzOm11c3RVbmRlcnN0YW5kPVwiMVwiIHhtbG5zOm89XCJodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy93c3MvMjAwNC8wMS9vYXNpcy0yMDA0MDEtd3NzLXdzc2VjdXJpdHktc2VjZXh0LTEuMC54c2RcIiBzOmFjdG9yPVwiaHR0cDovL3NtZXYuZ29zdXNsdWdpLnJ1L2FjdG9ycy9zbWV2XCI+JyArXG4gICAgICAnICAgICAgICAgICAgPG86QmluYXJ5U2VjdXJpdHlUb2tlbiB1OklkPVwidXVpZC1lZTgyZDQ0NS03NThiLTQyY2ItOTk2Yy02NjZiNzRiNjAwMjItMlwiIFZhbHVlVHlwZT1cImh0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL3dzcy8yMDA0LzAxL29hc2lzLTIwMDQwMS13c3MteDUwOS10b2tlbi1wcm9maWxlLTEuMCNYNTA5djNcIiBFbmNvZGluZ1R5cGU9XCJodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy93c3MvMjAwNC8wMS9vYXNpcy0yMDA0MDEtd3NzLXNvYXAtbWVzc2FnZS1zZWN1cml0eS0xLjAjQmFzZTY0QmluYXJ5XCI+J1xuICAgICAgKyBiNjRjZXJ0ICtcbiAgICAgICc8L286QmluYXJ5U2VjdXJpdHlUb2tlbj4nICtcbiAgICAgICcgICAgICAgICAgICA8U2lnbmF0dXJlIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnI1wiPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICA8U2lnbmVkSW5mbz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDxDYW5vbmljYWxpemF0aW9uTWV0aG9kIEFsZ29yaXRobT1cImh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuI1wiIC8+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICA8U2lnbmF0dXJlTWV0aG9kIEFsZ29yaXRobT1cIicgKyBzaWduTWV0aG9kICsgJ1wiLz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDxSZWZlcmVuY2UgVVJJPVwiI18xXCI+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICAgICAgPFRyYW5zZm9ybXM+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUcmFuc2Zvcm0gQWxnb3JpdGhtPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jXCIgLz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgICAgICA8L1RyYW5zZm9ybXM+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICAgICAgPERpZ2VzdE1ldGhvZCBBbGdvcml0aG09XCInICsgZGlnZXN0TWV0aG9kICsgJ1wiLz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgICAgICA8RGlnZXN0VmFsdWU+PC9EaWdlc3RWYWx1ZT4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDwvUmVmZXJlbmNlPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICA8L1NpZ25lZEluZm8+JyArXG4gICAgICAnICAgICAgICAgICAgICAgIDxTaWduYXR1cmVWYWx1ZT48L1NpZ25hdHVyZVZhbHVlPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICA8S2V5SW5mbz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDxvOlNlY3VyaXR5VG9rZW5SZWZlcmVuY2U+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICA8bzpSZWZlcmVuY2UgVmFsdWVUeXBlPVwiaHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvd3NzLzIwMDQvMDEvb2FzaXMtMjAwNDAxLXdzcy14NTA5LXRva2VuLXByb2ZpbGUtMS4wI1g1MDl2M1wiIFVSST1cIiN1dWlkLWVlODJkNDQ1LTc1OGItNDJjYi05OTZjLTY2NmI3NGI2MDAyMi0yXCIgLz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDwvbzpTZWN1cml0eVRva2VuUmVmZXJlbmNlPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICA8L0tleUluZm8+JyArXG4gICAgICAnICAgICAgICAgICAgPC9TaWduYXR1cmU+JyArXG4gICAgICAnICAgICAgICA8L286U2VjdXJpdHk+JyArXG4gICAgICAnICAgIDwvczpIZWFkZXI+JyArXG4gICAgICAnICAgIDxzOkJvZHkgdTpJZD1cIl8xXCIgeG1sbnM6eHNpPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2VcIiB4bWxuczp4c2Q9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYVwiPicgK1xuICAgICAgYm9keSArXG4gICAgICAnICAgIDwvczpCb2R5PicgK1xuICAgICAgJzwvczpFbnZlbG9wZT4nO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBzQ2VydE5hbWUgLSDQuNC80Y8g0YHQtdGA0YLQuNGE0LjQutCw0YLQsCAgKNGB0YLRgNC+0LrQsClcbiAgICogQHBhcmFtIGJvZHkgLSDRgdGC0YDQvtC60LAsINC60L7RgtC+0YDQsNGPINC00L7Qv9C40YjQtdGC0YHRjyDQsiB4bWwgICjRgdGC0YDQvtC60LApXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIHNpZ25YTUwoc0NlcnROYW1lOiBzdHJpbmcsIGJvZHk6IHN0cmluZykge1xuICAgIGNvbnN0IENBUElDT01fQ1VSUkVOVF9VU0VSX1NUT1JFID0gMjtcbiAgICBjb25zdCBDQVBJQ09NX01ZX1NUT1JFID0gJ015JztcbiAgICBjb25zdCBDQVBJQ09NX1NUT1JFX09QRU5fTUFYSU1VTV9BTExPV0VEID0gMjtcbiAgICBjb25zdCBDQVBJQ09NX1NNQVJUX0NBUkRfVVNFUl9TVE9SRSA9IDQ7XG4gICAgY29uc3QgQ0FQSUNPTV9DRVJUSUZJQ0FURV9GSU5EX1NIQTFfSEFTSCA9IDA7XG4gICAgY29uc3QgQ0FQSUNPTV9DRVJUSUZJQ0FURV9GSU5EX1NVQkpFQ1RfTkFNRSA9IDE7XG4gICAgY29uc3QgQ0FERVNDT01fWE1MX1NJR05BVFVSRV9UWVBFX1RFTVBMQVRFID0gMjtcbiAgICBjb25zdCBDQURFU0NPTV9FTkNPREVfQkFTRTY0ID0gMDtcblxuICAgIGNvbnN0IHJ1biA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY2FkZXNwbHVnaW4uYXN5bmNfc3Bhd24oZnVuY3Rpb24qIChhcmdzKSB7XG4gICAgICAgIC8vINCX0LTQtdGB0Ywg0YHQu9C10LTRg9C10YIg0LfQsNC/0L7Qu9C90LjRgtGMIFN1YmplY3ROYW1lINGB0LXRgNGC0LjRhNC40LrQsNGC0LBcbiAgICAgICAgLy8gbGV0IHNDZXJ0TmFtZSA9IG9DZXJ0TmFtZS52YWx1ZTtcblxuICAgICAgICBpZiAoJycgPT09IHNDZXJ0TmFtZSkge1xuICAgICAgICAgIGFsZXJ0KCfQktCy0LXQtNC40YLQtSDQuNC80Y8g0YHQtdGA0YLQuNGE0LjQutCw0YLQsCAoQ04pLicpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vINCY0YnQtdC8INGB0LXRgNGC0LjRhNC40LrQsNGCINC00LvRjyDQv9C+0LTQv9C40YHQuFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnN0IG9TdG9yZSA9IHlpZWxkIGNhZGVzcGx1Z2luLkNyZWF0ZU9iamVjdEFzeW5jKCdDQWRFU0NPTS5TdG9yZScpO1xuICAgICAgICB5aWVsZCBvU3RvcmUuT3BlbihDQVBJQ09NX0NVUlJFTlRfVVNFUl9TVE9SRSwgQ0FQSUNPTV9NWV9TVE9SRSxcbiAgICAgICAgICBDQVBJQ09NX1NUT1JFX09QRU5fTUFYSU1VTV9BTExPV0VELCBDQVBJQ09NX1NNQVJUX0NBUkRfVVNFUl9TVE9SRSk7XG5cbiAgICAgICAgY29uc3Qgb1N0b3JlQ2VydHMgPSB5aWVsZCBvU3RvcmUuQ2VydGlmaWNhdGVzO1xuICAgICAgICBjb25zdCBvQ2VydGlmaWNhdGVzID0geWllbGQgb1N0b3JlQ2VydHMuRmluZChcbiAgICAgICAgICBDQVBJQ09NX0NFUlRJRklDQVRFX0ZJTkRfU0hBMV9IQVNILCBzQ2VydE5hbWUpO1xuICAgICAgICBjb25zdCBjZXJ0c0NvdW50ID0geWllbGQgb0NlcnRpZmljYXRlcy5Db3VudDtcbiAgICAgICAgaWYgKGNlcnRzQ291bnQgPT09IDApIHtcbiAgICAgICAgICB0aGF0LnNpZ25FdmVudCQubmV4dCh7c3RhdHVzOiBFcnJvckNyeXB0b1Byby5DZXJ0aWZpY2F0ZU5vdEZvdW5kLCBwYXlsb2FkOiBzQ2VydE5hbWV9KTtcbiAgICAgICAgICAvLyBhbGVydChcIkNlcnRpZmljYXRlIG5vdCBmb3VuZDogXCIgKyBzQ2VydE5hbWUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvQ2VydGlmaWNhdGUgPSB5aWVsZCBvQ2VydGlmaWNhdGVzLkl0ZW0oMSk7XG4gICAgICAgIHlpZWxkIG9TdG9yZS5DbG9zZSgpO1xuXG4gICAgICAgIGNvbnN0IG9QdWJsaWNLZXkgPSB5aWVsZCBvQ2VydGlmaWNhdGUuUHVibGljS2V5KCk7XG4gICAgICAgIGNvbnN0IG9BbGdvcml0aG0gPSB5aWVsZCBvUHVibGljS2V5LkFsZ29yaXRobTtcbiAgICAgICAgY29uc3QgYWxnb09pZCA9IHlpZWxkIG9BbGdvcml0aG0uVmFsdWU7XG4gICAgICAgIGxldCBzaWduTWV0aG9kID0gJyc7XG4gICAgICAgIGxldCBkaWdlc3RNZXRob2QgPSAnJztcbiAgICAgICAgaWYgKGFsZ29PaWQgPT09ICcxLjIuNjQzLjcuMS4xLjEuMScpIHsgICAvLyDQsNC70LPQvtGA0LjRgtC8INC/0L7QtNC/0LjRgdC4INCT0J7QodCiINCgIDM0LjEwLTIwMTIg0YEg0LrQu9GO0YfQvtC8IDI1NiDQsdC40YJcbiAgICAgICAgICBzaWduTWV0aG9kID0gJ3VybjppZXRmOnBhcmFtczp4bWw6bnM6Y3B4bWxzZWM6YWxnb3JpdGhtczpnb3N0cjM0MTAyMDEyLWdvc3RyMzQxMTIwMTItMjU2JztcbiAgICAgICAgICBkaWdlc3RNZXRob2QgPSAndXJuOmlldGY6cGFyYW1zOnhtbDpuczpjcHhtbHNlYzphbGdvcml0aG1zOmdvc3RyMzQxMTIwMTItMjU2JztcbiAgICAgICAgfSBlbHNlIGlmIChhbGdvT2lkID09PSAnMS4yLjY0My43LjEuMS4xLjInKSB7ICAgLy8g0LDQu9Cz0L7RgNC40YLQvCDQv9C+0LTQv9C40YHQuCDQk9Ce0KHQoiDQoCAzNC4xMC0yMDEyINGBINC60LvRjtGH0L7QvCA1MTIg0LHQuNGCXG4gICAgICAgICAgc2lnbk1ldGhvZCA9ICd1cm46aWV0ZjpwYXJhbXM6eG1sOm5zOmNweG1sc2VjOmFsZ29yaXRobXM6Z29zdHIzNDEwMjAxMi1nb3N0cjM0MTEyMDEyLTUxMic7XG4gICAgICAgICAgZGlnZXN0TWV0aG9kID0gJ3VybjppZXRmOnBhcmFtczp4bWw6bnM6Y3B4bWxzZWM6YWxnb3JpdGhtczpnb3N0cjM0MTEyMDEyLTUxMic7XG4gICAgICAgIH0gZWxzZSBpZiAoYWxnb09pZCA9PT0gJzEuMi42NDMuMi4yLjE5JykgeyAgLy8g0LDQu9Cz0L7RgNC40YLQvCDQk9Ce0KHQoiDQoCAzNC4xMC0yMDAxXG4gICAgICAgICAgc2lnbk1ldGhvZCA9ICd1cm46aWV0ZjpwYXJhbXM6eG1sOm5zOmNweG1sc2VjOmFsZ29yaXRobXM6Z29zdHIzNDEwMjAwMS1nb3N0cjM0MTEnO1xuICAgICAgICAgIGRpZ2VzdE1ldGhvZCA9ICd1cm46aWV0ZjpwYXJhbXM6eG1sOm5zOmNweG1sc2VjOmFsZ29yaXRobXM6Z29zdHIzNDExJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnJvcm1lcyA9ICfQn9C+0LTQtNC10YDQttC40LLQsNC10YLRgdGPIFhNTCDQv9C+0LTQv9C40YHRjCDRgdC10YDRgtC40YTQuNC60LDRgtCw0LzQuCDRgtC+0LvRjNC60L4g0YEg0LDQu9Cz0L7RgNC40YLQvNC+0Lwg0JPQntCh0KIg0KAgMzQuMTAtMjAxMiwg0JPQntCh0KIg0KAgMzQuMTAtMjAwMSc7XG4gICAgICAgICAgdGhhdC5zaWduRXZlbnQkLm5leHQoe3N0YXR1czogRXJyb3JDcnlwdG9Qcm8uU2lnbk5vdEluR09TVCwgcGF5bG9hZDogZXJyb3JtZXN9KTtcbiAgICAgICAgICAvLyBhbGVydChlcnJvcm1lcyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYjY0Y2VydCA9IHlpZWxkIG9DZXJ0aWZpY2F0ZS5FeHBvcnQoQ0FERVNDT01fRU5DT0RFX0JBU0U2NCk7XG4gICAgICAgIGI2NGNlcnQgPSBiNjRjZXJ0LnJlcGxhY2UoL1tcXHJcXG5dL2csICcnKTtcblxuICAgICAgICAvLyDQkiDRiNCw0LHQu9C+0L3QtSDQtNC+0LrRg9C80LXQvdGC0LAg0L7QsdGP0LfQsNGC0LXQu9GM0L3QviDQtNC+0LvQttC90Ysg0L/RgNC40YHRg9GC0YHRgtCy0L7QstCw0YLRjCDRgdC70LXQtNGD0Y7RidC40LUg0Y3Qu9C10LzQtdC90YLRizpcbiAgICAgICAgLy8gQmluYXJ5U2VjdXJpdHlUb2tlbiAtINGB0LXRgNGC0LjRhNC40LrQsNGCINC60LvRjtGH0LAg0L/QvtC00L/QuNGB0Lgg0LIg0LrQvtC00LjRgNC+0LLQutC1IEJBU0U2NFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAg0LDRgtGA0LjQsdGD0YIgSWQg0LTQvtC70LbQtdC9INGB0L7QtNC10YDQttCw0YLRjCDRg9C90LjQutCw0LvRjNC90YvQuSDQuNC00LXQvdGC0LjRhNC40LrQsNGC0L7RgFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAg0YHQtdGA0YLQuNGE0LjQutCw0YLQsCDQsiDQtNC+0LrRg9C80LXQvdGC0LVcbiAgICAgICAgLy8gU2lnbmF0dXJlIC0g0Y3Qu9C10LzQtdC90YIg0YEg0L7Qv9C40YHQsNC90LjQtdC8INGB0LLQvtC50YHRgtCyINC/0L7QtNC/0LjRgdC4OlxuICAgICAgICAvLyAgICAgU2lnbmVkSW5mbyAtINC40L3RhNC+0YDQvNCw0YbQuNGPINC+INC/0L7QtNC/0LjRgdGL0LLQsNC10LzRi9GFINGN0LvQtdC80LXQvdGC0LDRhTpcbiAgICAgICAgLy8gICAgICAgICBDYW5vbmljYWxpemF0aW9uTWV0aG9kIC0g0LDQu9Cz0L7RgNC40YLQvCDQv9GA0LjQstC10LTQtdC90LjRjyDQuiDQutCw0L3QvtC90LjRh9C10YHQutC+0LzRgyDQstC40LTRgy5cbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg0JTQu9GPINCh0JzQrdCSIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jXCJcbiAgICAgICAgLy8gICAgICAgICBTaWduYXR1cmVNZXRob2QgLSDQuNC00LXQvdGC0LjRhNC40LrQsNGC0L7RgCDQsNC70LPQvtGA0LjRgtC80LAg0L/QvtC00L/QuNGB0LguXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAg0JTQu9GPINCh0JzQrdCSIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxkc2lnLW1vcmUjZ29zdHIzNDEwMjAwMS1nb3N0cjM0MTFcIlxuICAgICAgICAvLyAgICAgICAgIFJlZmVyZW5jZSAtINCw0YLRgNC40LHRg9GCIFVSSSDQtNC+0LvQttC10L0g0YHQvtC00LXRgNC20LDRgtGMINGB0YHRi9C70LrRgyDQvdCwINC/0L7QtNC/0LjRgdGL0LLQsNC10LzRi9C1INGN0LvQtdC80LXQvdGC0Ysg0LIg0LLQsNGI0LXQvCDQtNC+0LrRg9C80LXQvdGC0LU6XG4gICAgICAgIC8vICAgICAgICAgICAgIFRyYW5zZm9ybXMgLSDQv9GA0LXQvtCx0YDQsNC30L7QstCw0L3QuNGPLCDQutC+0YLQvtGA0YvQtSDRgdC70LXQtNGD0LXRgiDQv9GA0LjQvNC10L3QuNGC0Ywg0Log0L/QvtC00L/QuNGB0YvQstCw0LXQvNGL0Lwg0Y3Qu9C10LzQtdC90YLQsNC8LlxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAg0JIg0L/RgNC40LzQtdGA0LUgLSDQv9GA0LjQstC10LTQtdC90LjQtSDQuiDQutCw0L3QvtC90LjRh9C10YHQutC+0LzRgyDQstC40LTRgy5cbiAgICAgICAgLy8gICAgICAgICAgICAgRGlnZXN0TWV0aG9kIC0g0LjQtNC10L3RgtC40YTQuNC60LDRgtC+0YAg0LDQu9Cz0L7RgNC40YLQvNCwINGF0Y3RiNC40YDQvtCy0LDQvdC40Y8uXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgINCU0LvRjyDQodCc0K3QkiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI2dvc3RyMzQxMVwiXG4gICAgICAgIC8vICAgICAgICAgICAgIERpZ2VzdFZhbHVlIC0g0KXRjdGILdC30L3QsNGH0LXQvdC40LUg0L/QvtC00L/QuNGB0YvQstCw0LXQvNGL0YUg0Y3Qu9C10LzQtdC90YLQvtCyLiDQlNCw0L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YIg0YHQu9C10LTRg9C10YIg0L7RgdGC0LDQstC40YLRjCDQv9GD0YHRgtGL0LwuXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAg0JXQs9C+INC30L3QsNGH0LXQvdC40LUg0LHRg9C00LXRgiDQt9Cw0L/QvtC70L3QtdC90L4g0L/RgNC4INGB0L7Qt9C00LDQvdC40Lgg0L/QvtC00L/QuNGB0LguXG4gICAgICAgIC8vICAgICBTaWduYXR1cmVWYWx1ZSAtINC30L3QsNGH0LXQvdC40LUg0L/QvtC00L/QuNGB0LguINCU0LDQvdC90YvQuSDRjdC70LXQvNC10L3RgiDRgdC70LXQtNGD0LXRgiDQvtGB0YLQsNCy0LjRgtGMINC/0YPRgdGC0YvQvC5cbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAg0JXQs9C+INC30L3QsNGH0LXQvdC40LUg0LHRg9C00LXRgiDQt9Cw0L/QvtC70L3QtdC90L4g0L/RgNC4INGB0L7Qt9C00LDQvdC40Lgg0L/QvtC00L/QuNGB0LguXG4gICAgICAgIC8vICAgICBLZXlJbmZvIC0g0LjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0YHQtdGA0YLQuNGE0LjQutCw0YLQtSDQutC70Y7Rh9CwINC/0L7QtNC/0LjRgdC4XG4gICAgICAgIC8vICAgICAgICAgU2VjdXJpdHlUb2tlblJlZmVyZW5jZSAtINGB0YHRi9C70LrQsCDQvdCwINGB0LXRgNGC0LjRhNC40LrQsNGCXG4gICAgICAgIC8vICAgICAgICAgICAgIFJlZmVyZW5jZSAtINCw0YLRgNC40LHRg9GCIFZhbHVlVHlwZSDQtNC+0LvQttC10L0g0YHQvtC00LXRgNC20LDRgtGMINC30L3QsNGH0LXQvdC40LVcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgXCJodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy93c3MvMjAwNC8wMS9vYXNpcy0yMDA0MDEtd3NzLXg1MDktdG9rZW4tcHJvZmlsZS0xLjAjWDUwOXYzXCJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAg0JDRgtGA0LjQsdGD0YIgVVJJINC00L7Qu9C20LXQvSDRgdC+0LTQtdGA0LbQsNGC0Ywg0YHRgdGL0LvQutGDINC90LAg0YPQvdC40LrQsNC70YzQvdGL0Lkg0LjQtNC10L3RgtC40YTQuNC60LDRgtC+0YBcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAg0YHQtdGA0YLQuNGE0LjQutCw0YLQsCAo0YLQsNC60L7QuSDQttC1LCDQutCw0Log0YPQutCw0LfQsNC9INCyINGN0LvQtdC80LXQvdGC0LUgQmluYXJ5U2VjdXJpdHlUb2tlbilcbiAgICAgICAgY29uc3Qgc0NvbnRlbnQgPSB0aGF0LmdldFhNTFRlbXBsYXRlKGJvZHksIGI2NGNlcnQsIHNpZ25NZXRob2QsIGRpZ2VzdE1ldGhvZCk7XG5cbiAgICAgICAgLy8g0KHQvtC30LTQsNC10Lwg0L7QsdGK0LXQutGCIENBZEVTQ09NLkNQU2lnbmVyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3Qgb1NpZ25lciA9IHlpZWxkIGNhZGVzcGx1Z2luLkNyZWF0ZU9iamVjdEFzeW5jKCdDQWRFU0NPTS5DUFNpZ25lcicpO1xuICAgICAgICB5aWVsZCBvU2lnbmVyLnByb3BzZXRfQ2VydGlmaWNhdGUob0NlcnRpZmljYXRlKTtcbiAgICAgICAgeWllbGQgb1NpZ25lci5wcm9wc2V0X0NoZWNrQ2VydGlmaWNhdGUodHJ1ZSk7XG5cbiAgICAgICAgLy8g0KHQvtC30LTQsNC10Lwg0L7QsdGK0LXQutGCIENBZEVTQ09NLlNpZ25lZFhNTFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnN0IG9TaWduZWRYTUwgPSB5aWVsZCBjYWRlc3BsdWdpbi5DcmVhdGVPYmplY3RBc3luYygnQ0FkRVNDT00uU2lnbmVkWE1MJyk7XG4gICAgICAgIHlpZWxkIG9TaWduZWRYTUwucHJvcHNldF9Db250ZW50KHNDb250ZW50KTtcblxuICAgICAgICAvLyDQo9C60LDQt9GL0LLQsNC10Lwg0YLQuNC/INC/0L7QtNC/0LjRgdC4IC0g0LIg0LTQsNC90L3QvtC8INGB0LvRg9GH0LDQtSDQv9C+INGI0LDQsdC70L7QvdGDXG4gICAgICAgIHlpZWxkIG9TaWduZWRYTUwucHJvcHNldF9TaWduYXR1cmVUeXBlKENBREVTQ09NX1hNTF9TSUdOQVRVUkVfVFlQRV9URU1QTEFURSk7XG5cbiAgICAgICAgbGV0IHNTaWduZWRNZXNzYWdlID0gJyc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc1NpZ25lZE1lc3NhZ2UgPSB5aWVsZCBvU2lnbmVkWE1MLlNpZ24ob1NpZ25lcik7XG4gICAgICAgICAgdGhhdC5zaWduRXZlbnQkLm5leHQoe3N0YXR1czogRXJyb3JDcnlwdG9Qcm8uU3VjY2VzcywgcGF5bG9hZDogc1NpZ25lZE1lc3NhZ2V9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIHRoYXQuc2lnbkV2ZW50JC5uZXh0KHtzdGF0dXM6IEVycm9yQ3J5cHRvUHJvLlNpZ25FcnJvciwgcGF5bG9hZDogY2FkZXNwbHVnaW4uZ2V0TGFzdEVycm9yKGVyci5tZXNzYWdlKX0pO1xuICAgICAgICAgIC8vIGFsZXJ0KFwiRmFpbGVkIHRvIGNyZWF0ZSBzaWduYXR1cmUuIEVycm9yOiBcIiArIGNhZGVzcGx1Z2luLmdldExhc3RFcnJvcihlcnIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8g0J/QvtC70YPRh9C10L3QvdGL0Lkg0L/QvtC00L/QuNGB0LDQvdC90YvQuSBYTUwt0LTQvtC60YPQvNC10L3RgiDQtNC+0LvQttC10L0g0L/RgNC+0YXQvtC00LjRgtGMINC/0YDQvtCy0LXRgNC60YMg0L3QsCDRgdCw0LnRgtC1INCh0JzQrdCSXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHNTaWduZWRNZXNzYWdlKTtcblxuXG4gICAgICAgIC8vIFZlcmlmaWNhdGlvblxuXG4gICAgICAgIC8vINCh0L7Qt9C00LDQtdC8INC+0LHRitC10LrRgiBDQWRFU0NPTS5TaWduZWRYTUxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAvLyBsZXQgb1NpZ25lZFhNTDIgPSB5aWVsZCBjYWRlc3BsdWdpbi5DcmVhdGVPYmplY3RBc3luYyhcIkNBZEVTQ09NLlNpZ25lZFhNTFwiKTtcblxuICAgICAgICAvLyB0cnkge1xuICAgICAgICAvLyAgIHlpZWxkIG9TaWduZWRYTUwyLlZlcmlmeShzU2lnbmVkTWVzc2FnZSk7XG4gICAgICAgIC8vICAgYWxlcnQoXCJTaWduYXR1cmUgdmVyaWZpZWRcIik7XG4gICAgICAgIC8vIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgLy8gICBhbGVydChcIkZhaWxlZCB0byB2ZXJpZnkgc2lnbmF0dXJlLiBFcnJvcjogXCIgKyBjYWRlc3BsdWdpbi5nZXRMYXN0RXJyb3IoZXJyKSk7XG4gICAgICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcnVuKCk7XG4gIH1cbn1cbiJdfQ==