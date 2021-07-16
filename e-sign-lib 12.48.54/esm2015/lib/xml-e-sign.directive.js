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
        const CADESCOM_CONTAINER_STORE = 100;
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
                yield oStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE, CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED, CADESCOM_CONTAINER_STORE);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sLWUtc2lnbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9lLXNpZ24tbGliL3NyYy9saWIveG1sLWUtc2lnbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFDLGVBQWUsRUFBRSxHQUFHLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN0RSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUQsT0FBTyxLQUFLLFNBQVMsTUFBTSxjQUFjLENBQUM7QUFFMUMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDOUQsT0FBTyxFQUFtQixjQUFjLEVBQWMsTUFBTSxVQUFVLENBQUM7OztBQU12RSxNQUFNLE9BQU8saUJBQWlCO0lBNEU1QixZQUFvQixhQUErQjtRQUEvQixrQkFBYSxHQUFiLGFBQWEsQ0FBa0I7UUFoRW5EOztXQUVHO1FBQ0gsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFFdEI7O1dBRUc7UUFDSCxtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUV2Qjs7V0FFRztRQUNILGVBQVUsR0FBRyxJQUFJLGVBQWUsQ0FBTSxJQUFJLENBQUMsQ0FBQztRQUU1Qzs7V0FFRztRQUNILGtCQUFhLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLE1BQU0sQ0FBQztRQUV6RTs7V0FFRztRQUVILGNBQVMsR0FBRyxNQUFNLENBQUM7UUFFbkI7O1dBRUc7UUFFSCxlQUFVLEdBQUcs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QUFpQjtzREFBakIsaUJBQWlCO29HQUFqQixvQkFBZ0I7O3VGQUFoQixpQkFBaUI7Y0FKN0IsU0FBUztlQUFDO2dCQUNULFFBQVEsRUFBRSxjQUFjO2dCQUN4QixRQUFRLEVBQUUsVUFBVTthQUNyQjttRUFxQ0MsU0FBUztrQkFEUixLQUFLO1lBT04sVUFBVTtrQkFEVCxLQUFLO1lBT04sa0JBQWtCO2tCQURqQixLQUFLO1lBT04sYUFBYTtrQkFEWixNQUFNO1lBT1AsWUFBWTtrQkFEWCxNQUFNO1lBU1AsUUFBUTtrQkFEUCxZQUFZO21CQUFDLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBFdmVudEVtaXR0ZXIsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIE91dHB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0JlaGF2aW9yU3ViamVjdCwgaWlmLCBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvcn0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7Y2F0Y2hFcnJvciwgZmlsdGVyLCBtYXAsIHRhcH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgKiBhcyBKc29uVG9YTUwgZnJvbSBcImpzMnhtbHBhcnNlclwiO1xuaW1wb3J0IHtDcnlwdG9Qcm9TZXJ2aWNlfSBmcm9tIFwiLi9jcnlwdG8tcHJvLnNlcnZpY2VcIjtcbmltcG9ydCB7Q2VydGlmaWNhdGVzTWFwcGVyfSBmcm9tIFwiLi9tYXBwZXIvY2VydGlmaWNhdGVzLm1hcHBlclwiO1xuaW1wb3J0IHtFTVBUWV9DRVJUSUZJQ0FURX0gZnJvbSBcIi4vZGVmYXVsdC1kYXRhL2NlcnRpZmljYXRlc1wiO1xuaW1wb3J0IHtDZXJ0aWZpY2F0ZU1vZGVsLCBFcnJvckNyeXB0b1BybywgSVNpZ25SZXN1bHR9IGZyb20gXCIuL21vZGVsc1wiO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbeG1sLWUtc2lnbl0nLFxuICBleHBvcnRBczogJ3htbEVTaWduJ1xufSlcbmV4cG9ydCBjbGFzcyBYTUxFU2lnbkRpcmVjdGl2ZSB7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQodC/0LjRgdC+0Log0YHQtdGA0YLQuNGE0LjQutCw0YLQvtCyXG4gICAqL1xuICBjZXJ0aWZpY2F0ZXM6IENlcnRpZmljYXRlTW9kZWxbXTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCS0YvQsdGA0LDQvdC90YvQuSDRgdC10YDRgtC40YTQuNC60LDRglxuICAgKi9cbiAgc2VsZWN0ZWRDZXJ0aWZpY2F0ZTogQ2VydGlmaWNhdGVNb2RlbDtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCf0LvQsNCz0LjQvSDRgNCw0LHQvtGH0LjQuVxuICAgKi9cbiAgaXNQbHVnaW5WYWxpZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0J/QvtC00L/QuNGB0YLRjCDQsiDQv9GA0L7RhtC10YHRgdC1XG4gICAqL1xuICBzaWduSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0KHQvtCx0YvRgtC40Y8g0L/QvtC00L/QuNGB0LggKNC+0YjQuNCx0LrQuCDQuNC70Lgg0YPRgdC/0LXRhSlcbiAgICovXG4gIHNpZ25FdmVudCQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGFueT4obnVsbCk7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQpNC70LDQsyDRgtC10YHRgtC+0LLQvtCz0L4g0YDQtdC20LjQvNCwIChBbHQgKyBTKVxuICAgKi9cbiAgaXNUZXN0aW5nTW9kZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdTSUdOX1hNTF9URVNUSU5HX01PREUnKSA9PT0gJ3RydWUnO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JHQu9C+0Log0LIg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDQv9C+0LvQvtC20LXQvSDRgNCw0YHQv9Cw0YDRgdC10L3QvdGL0Lkg0L7QsdGK0LXQutGCIFhNTFxuICAgKi9cbiAgQElucHV0KClcbiAgcm9vdEZpZWxkID0gJ2h0bWwnO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JjRgdGF0L7QtNC90YvQuSDQvtCx0YrQtdC60YJcbiAgICovXG4gIEBJbnB1dCgpXG4gIGpzb25PYmplY3QgPSB7fTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCk0LvQsNCzINGB0LrQsNGH0LjQstCw0L3QuNGPINGE0LDQudC70LAg0L/RgNC4INC/0L7QtNC/0LjRgdC4XG4gICAqL1xuICBASW5wdXQoKVxuICBpc05lZWREb3dubG9hZEZpbGUgPSBmYWxzZTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCh0L7QsdGL0YLQuNGPINGD0YHQv9C10YXQsFxuICAgKi9cbiAgQE91dHB1dCgpXG4gIHN1Y2Nlc3NSZXN1bHQgPSBuZXcgRXZlbnRFbWl0dGVyPElTaWduUmVzdWx0PihudWxsKTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCh0L7QsdGL0YLQuNGPINC+0YjQuNCx0L7QulxuICAgKi9cbiAgQE91dHB1dCgpXG4gIGZhaWxlZFJlc3VsdCA9IG5ldyBFdmVudEVtaXR0ZXI8SVNpZ25SZXN1bHQ+KG51bGwpO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JLRhdC+0LQg0LIg0YDQtdC20LjQvCDRgtC10YHRgtC40YDQvtCy0YnQuNC60LBcbiAgICog0JXRgdC70Lgg0L3QtSDRg9GB0YLQsNC90L7QstC70LXQvSDQv9C70LDQs9C40L0g0YLQviBBbHQgKyBTXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgQEhvc3RMaXN0ZW5lcignd2luZG93OmtleXVwJywgWyckZXZlbnQnXSlcbiAga2V5RXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuYWx0S2V5ICYmIGV2ZW50LmNvZGUgPT09ICdLZXlTJykge1xuICAgICAgdGhpcy5pc1Rlc3RpbmdNb2RlID0gIXRoaXMuaXNUZXN0aW5nTW9kZTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdTSUdOX1hNTF9URVNUSU5HX01PREUnLCBTdHJpbmcodGhpcy5pc1Rlc3RpbmdNb2RlKSk7XG4gICAgICBjb25zb2xlLmxvZygnU0lHTl9YTUxfVEVTVElOR19NT0RFOiAnLCB0aGlzLmlzVGVzdGluZ01vZGUgPyAnb24nIDogJ29mZicpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY3J5cHRvU2VydmljZTogQ3J5cHRvUHJvU2VydmljZSkge1xuICAgIHRoaXMubGlzdGVuU2lnbkV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDRgdC70YPRiNCw0YLQtdC70Ywg0YHQvtCx0YvRgtC40Lkg0L/QvtC00L/QuNGB0LhcbiAgICog0JLQvdGD0YLRgNC4IG9ic2VydmFibGUgLSDQsiDQvdC10LPQviDQv9GD0YjQsNGC0YHRjyDRgdC+0LHRi9GC0LjRjyDRg9GB0L/QtdGF0LAg0LjQu9C4INC+0YjQuNCx0LrQuFxuICAgKiDQotGD0YIg0L7QvdC4INC+0LHRgNCw0LHQsNGC0YvQstCw0Y7RgtGB0Y9cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHB1YmxpYyBsaXN0ZW5TaWduRXZlbnRzKCkge1xuICAgIHJldHVybiB0aGlzLnNpZ25FdmVudCRcbiAgICAgIC5waXBlKFxuICAgICAgICBmaWx0ZXIocmVzcG9uc2UgPT4gcmVzcG9uc2UpLFxuICAgICAgICB0YXAoKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgY29uc3Qge3N0YXR1cywgcGF5bG9hZH0gPSByZXNwb25zZTtcbiAgICAgICAgICB0aGlzLnNpZ25JblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgICAgaWYgKHN0YXR1cyA9PT0gRXJyb3JDcnlwdG9Qcm8uU3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5zdWNjZXNzUmVzdWx0LmVtaXQoe3N0YXR1cywgcGF5bG9hZH0pO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENlcnRpZmljYXRlID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTmVlZERvd25sb2FkRmlsZSkge1xuICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkRmlsZShwYXlsb2FkLCAnc2lnbmVkLnhtbCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDQvtCx0YDQsNCx0L7RgtC60LAg0L7RiNC40LHQvtC6XG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENlcnRpZmljYXRlKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDZXJ0aWZpY2F0ZS5pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDZXJ0aWZpY2F0ZS5jbGFzcyA9ICdkaXNhYmxlZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZhaWxlZFJlc3VsdC5lbWl0KHtzdGF0dXMsIHBheWxvYWR9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKS5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0J/RgNC+0LLQtdGA0LjRgtGMINC90LDQu9C40YfQuNC1INC/0LvQsNCz0LjQvdCwXG4gICAqL1xuICBjaGVja1BsdWdpbigpIHtcbiAgICB0aGlzLmlzUGx1Z2luVmFsaWQgPSB0aGlzLmNyeXB0b1NlcnZpY2UuaXNQbHVnaW47XG5cbiAgICBpZiAoIXRoaXMuaXNQbHVnaW5WYWxpZCAmJiAhdGhpcy5pc1Rlc3RpbmdNb2RlKSB7XG4gICAgICB0aGlzLnNpZ25FdmVudCQubmV4dCh7XG4gICAgICAgIHN0YXR1czogRXJyb3JDcnlwdG9Qcm8uUGx1Z2luTm90RmluZWQsXG4gICAgICAgIHBheWxvYWQ6ICfQotGA0LXQsdGD0LXRgtGB0Y8gINCa0YDQuNC/0YLQvtCf0YDQviDQrdCm0J8gQnJvd3NlciBwbHVnLWluINC4INGD0YHRgtCw0L3QvtCy0LvQtdC90L3QsNGPINCt0KbQnydcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JXRgdC70Lgg0YHQtdGA0YLQuNGE0LjQutCw0YIg0LLRi9Cx0YDQsNC9XG4gICAqIEBwYXJhbSBjZXJ0aWZpY2F0ZVxuICAgKi9cbiAgb25DZXJ0aWZpY2F0ZVNlbGVjdGVkKGNlcnRpZmljYXRlOiBDZXJ0aWZpY2F0ZU1vZGVsKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZENlcnRpZmljYXRlID0gY2VydGlmaWNhdGU7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCf0L7Qu9GD0YfQuNGC0Ywg0YHQv9C40YHQvtC6INGB0LXRgNGC0LjRhNC40LrQsNGC0L7QslxuICAgKi9cbiAgZ2V0Q2VydGlmaWNhdGVzKCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgaWYgKCF0aGlzLmpzb25PYmplY3QpIHtcbiAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICB9XG4gICAgY29uc3Qgc3VjY2Vzc0ZuID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuY3J5cHRvU2VydmljZS5nZXRVc2VyQ2VydGlmaWNhdGVzKCk7XG4gICAgfTtcbiAgICBjb25zdCBmYWlsRm4gPSAoKSA9PiB7XG4gICAgICByZXR1cm4gb2YodGhpcy5pc1Rlc3RpbmdNb2RlID8gW0VNUFRZX0NFUlRJRklDQVRFXSA6IFtdKTtcbiAgICB9O1xuICAgIGNvbnN0IGFjdGlvbiA9ICgpID0+IHtcbiAgICAgIHRoaXMuY2hlY2tQbHVnaW4oKTtcbiAgICAgIHJldHVybiBpaWYoKCkgPT4gdGhpcy5pc1BsdWdpblZhbGlkLFxuICAgICAgICBzdWNjZXNzRm4oKSxcbiAgICAgICAgZmFpbEZuKClcbiAgICAgICkucGlwZShcbiAgICAgICAgbWFwKChjZXJ0aWZpY2F0ZXM6IGFueVtdKSA9PiBjZXJ0aWZpY2F0ZXMubWFwKGMgPT4gQ2VydGlmaWNhdGVzTWFwcGVyLm1hcChjKSkpLFxuICAgICAgICB0YXAoY2VydGlmaWNhdGVzID0+IHtcbiAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlcyA9IGNlcnRpZmljYXRlcztcbiAgICAgICAgfSksXG4gICAgICAgIGNhdGNoRXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGVzID0gW107XG4gICAgICAgICAgdGhpcy5zaWduRXZlbnQkLm5leHQoe1xuICAgICAgICAgICAgc3RhdHVzOiBFcnJvckNyeXB0b1Byby5QbHVnaW5Ob3RGaW5lZCxcbiAgICAgICAgICAgIHBheWxvYWQ6ICfQotGA0LXQsdGD0LXRgtGB0Y8gINCa0YDQuNC/0YLQvtCf0YDQviDQrdCm0J8gQnJvd3NlciBwbHVnLWluINC4INGD0YHRgtCw0L3QvtCy0LvQtdC90L3QsNGPINCt0KbQnydcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH07XG4gICAgcmV0dXJuIGFjdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB0ZXh0IC0g0YHQvtC00LXRgNC20LjQvNC+0LUg0YTQsNC50LvQsCAo0YHRgtGA0L7QutCwKVxuICAgKiBAcGFyYW0gZmlsZW5hbWUgLSDQuNC80Y8g0YTQsNC50LvQsFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBkb3dubG9hZEZpbGUodGV4dDogc3RyaW5nLCBmaWxlbmFtZSA9ICdmaWxlbmFtZS54bWwnKSB7XG4gICAgY29uc3QgcG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGNvbnN0IGJiID0gbmV3IEJsb2IoW3RleHRdLCB7dHlwZTogJ3RleHQvcGxhaW4nfSk7XG5cbiAgICBwb20uc2V0QXR0cmlidXRlKCdocmVmJywgd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmIpKTtcbiAgICBwb20uc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGZpbGVuYW1lKTtcblxuICAgIHBvbS5kYXRhc2V0LmRvd25sb2FkdXJsID0gWyd0ZXh0L3BsYWluJywgcG9tLmRvd25sb2FkLCBwb20uaHJlZl0uam9pbignOicpO1xuICAgIHBvbS5kcmFnZ2FibGUgPSB0cnVlO1xuICAgIHBvbS5jbGFzc0xpc3QuYWRkKCdkcmFnb3V0Jyk7XG5cbiAgICBwb20uY2xpY2soKTtcbiAgICBwb20ucmVtb3ZlKCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjNGB0LrQuNC5IEpTT04g0LIgWE1MICjQsdC10Lcg0LzQtdGC0LAg0LjQvdGE0Ysg0YfRgtC+INGN0YLQviB4bWwpXG4gICAqL1xuICBnZXQganNvblRvWG1sKCkge1xuICAgIHJldHVybiBKc29uVG9YTUwucGFyc2UodGhpcy5yb290RmllbGQsIHRoaXMuanNvbk9iamVjdCkucmVwbGFjZSgnPD94bWwgdmVyc2lvbj1cXCcxLjBcXCc/PlxcbicsICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JPQtdC90LXRgNC40LwgeG1sLCDQuCDQvtGC0LTQsNC10Lwg0L3QsCDQv9C+0LTQv9C40YHRjCAtINC10YHQu9C4INC80Ysg0LIg0YDQtdC20LjQvNC1INGC0LXRgdGC0LjRgNC+0LLQsNC90LjRj1xuICAgKiDRgdGA0LDQt9GDINC+0YLQtNCw0LXQvCB4bWwgKNCx0YPQtC3RgtC+INC+0L0g0L/QvtC00L/QuNGB0LDQvSlcbiAgICovXG4gIHB1YmxpYyBzaWduKCkge1xuICAgIGNvbnN0IHhtbERhdGEgPSB0aGlzLmpzb25Ub1htbDtcbiAgICB0aGlzLnNpZ25JblByb2dyZXNzID0gdHJ1ZTtcbiAgICBpZiAoIXRoaXMuc2VsZWN0ZWRDZXJ0aWZpY2F0ZSB8fCB0aGlzLnNlbGVjdGVkQ2VydGlmaWNhdGUudGh1bWJwcmludCA9PT0gRU1QVFlfQ0VSVElGSUNBVEUudGh1bWJwcmludCkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSB0aGlzLmlzVGVzdGluZ01vZGUgP1xuICAgICAgICB7c3RhdHVzOiBFcnJvckNyeXB0b1Byby5TdWNjZXNzLCBwYXlsb2FkOiB0aGlzLmdldFhNTFRlbXBsYXRlKHhtbERhdGEsICcnLCAnJywgJycpfSA6XG4gICAgICAgIHtcbiAgICAgICAgICBzdGF0dXM6IEVycm9yQ3J5cHRvUHJvLlBsdWdpbk5vdEZpbmVkLFxuICAgICAgICAgIHBheWxvYWQ6ICfQotGA0LXQsdGD0LXRgtGB0Y8gINCa0YDQuNC/0YLQvtCf0YDQviDQrdCm0J8gQnJvd3NlciBwbHVnLWluINC4INGD0YHRgtCw0L3QvtCy0LvQtdC90L3QsNGPINCt0KbQnydcbiAgICAgICAgfTtcbiAgICAgIHRoaXMuc2lnbkV2ZW50JC5uZXh0KHJlc3BvbnNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaWduWE1MKHRoaXMuc2VsZWN0ZWRDZXJ0aWZpY2F0ZS50aHVtYnByaW50LCB4bWxEYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIGJvZHkgLSDRgtC10LvQviB4bWwg0YEg0LTQsNC90L3Ri9C80Lgg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPICjRgdGC0YDQvtC60LApXG4gICAqIEBwYXJhbSBiNjRjZXJ0IC0g0YHQtdGA0YLQuNGE0LjQutCw0YIgKNGB0YLRgNC+0LrQsClcbiAgICogQHBhcmFtIHNpZ25NZXRob2QgLSDQvNC10YLQvtC0INC/0L7QtNC/0LjRgdC4ICjRgdGC0YDQvtC60LApXG4gICAqIEBwYXJhbSBkaWdlc3RNZXRob2QgLSDRh9GC0L4t0YLQviDQtNC70Y8g0LrQsNC90L7QvdC40LfQsNGG0LjQuCBYTUwgKNGB0YLRgNC+0LrQsClcbiAgICovXG4gIGdldFhNTFRlbXBsYXRlID0gKGJvZHk6IHN0cmluZywgYjY0Y2VydDogc3RyaW5nLCBzaWduTWV0aG9kOiBzdHJpbmcsIGRpZ2VzdE1ldGhvZDogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuICc8P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJVVEYtOFwiPz4nICtcbiAgICAgICc8czpFbnZlbG9wZSB4bWxuczpzPVwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvc29hcC9lbnZlbG9wZS9cIiB4bWxuczp1PVwiaHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvd3NzLzIwMDQvMDEvb2FzaXMtMjAwNDAxLXdzcy13c3NlY3VyaXR5LXV0aWxpdHktMS4wLnhzZFwiPicgK1xuICAgICAgJyAgICA8czpIZWFkZXI+JyArXG4gICAgICAnICAgICAgICA8bzpTZWN1cml0eSBzOm11c3RVbmRlcnN0YW5kPVwiMVwiIHhtbG5zOm89XCJodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy93c3MvMjAwNC8wMS9vYXNpcy0yMDA0MDEtd3NzLXdzc2VjdXJpdHktc2VjZXh0LTEuMC54c2RcIiBzOmFjdG9yPVwiaHR0cDovL3NtZXYuZ29zdXNsdWdpLnJ1L2FjdG9ycy9zbWV2XCI+JyArXG4gICAgICAnICAgICAgICAgICAgPG86QmluYXJ5U2VjdXJpdHlUb2tlbiB1OklkPVwidXVpZC1lZTgyZDQ0NS03NThiLTQyY2ItOTk2Yy02NjZiNzRiNjAwMjItMlwiIFZhbHVlVHlwZT1cImh0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL3dzcy8yMDA0LzAxL29hc2lzLTIwMDQwMS13c3MteDUwOS10b2tlbi1wcm9maWxlLTEuMCNYNTA5djNcIiBFbmNvZGluZ1R5cGU9XCJodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy93c3MvMjAwNC8wMS9vYXNpcy0yMDA0MDEtd3NzLXNvYXAtbWVzc2FnZS1zZWN1cml0eS0xLjAjQmFzZTY0QmluYXJ5XCI+J1xuICAgICAgKyBiNjRjZXJ0ICtcbiAgICAgICc8L286QmluYXJ5U2VjdXJpdHlUb2tlbj4nICtcbiAgICAgICcgICAgICAgICAgICA8U2lnbmF0dXJlIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnI1wiPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICA8U2lnbmVkSW5mbz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDxDYW5vbmljYWxpemF0aW9uTWV0aG9kIEFsZ29yaXRobT1cImh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuI1wiIC8+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICA8U2lnbmF0dXJlTWV0aG9kIEFsZ29yaXRobT1cIicgKyBzaWduTWV0aG9kICsgJ1wiLz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDxSZWZlcmVuY2UgVVJJPVwiI18xXCI+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICAgICAgPFRyYW5zZm9ybXM+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUcmFuc2Zvcm0gQWxnb3JpdGhtPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jXCIgLz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgICAgICA8L1RyYW5zZm9ybXM+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICAgICAgPERpZ2VzdE1ldGhvZCBBbGdvcml0aG09XCInICsgZGlnZXN0TWV0aG9kICsgJ1wiLz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgICAgICA8RGlnZXN0VmFsdWU+PC9EaWdlc3RWYWx1ZT4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDwvUmVmZXJlbmNlPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICA8L1NpZ25lZEluZm8+JyArXG4gICAgICAnICAgICAgICAgICAgICAgIDxTaWduYXR1cmVWYWx1ZT48L1NpZ25hdHVyZVZhbHVlPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICA8S2V5SW5mbz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDxvOlNlY3VyaXR5VG9rZW5SZWZlcmVuY2U+JyArXG4gICAgICAnICAgICAgICAgICAgICAgICAgICA8bzpSZWZlcmVuY2UgVmFsdWVUeXBlPVwiaHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvd3NzLzIwMDQvMDEvb2FzaXMtMjAwNDAxLXdzcy14NTA5LXRva2VuLXByb2ZpbGUtMS4wI1g1MDl2M1wiIFVSST1cIiN1dWlkLWVlODJkNDQ1LTc1OGItNDJjYi05OTZjLTY2NmI3NGI2MDAyMi0yXCIgLz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDwvbzpTZWN1cml0eVRva2VuUmVmZXJlbmNlPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICA8L0tleUluZm8+JyArXG4gICAgICAnICAgICAgICAgICAgPC9TaWduYXR1cmU+JyArXG4gICAgICAnICAgICAgICA8L286U2VjdXJpdHk+JyArXG4gICAgICAnICAgIDwvczpIZWFkZXI+JyArXG4gICAgICAnICAgIDxzOkJvZHkgdTpJZD1cIl8xXCIgeG1sbnM6eHNpPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2VcIiB4bWxuczp4c2Q9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYVwiPicgK1xuICAgICAgYm9keSArXG4gICAgICAnICAgIDwvczpCb2R5PicgK1xuICAgICAgJzwvczpFbnZlbG9wZT4nO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBzQ2VydE5hbWUgLSDQuNC80Y8g0YHQtdGA0YLQuNGE0LjQutCw0YLQsCAgKNGB0YLRgNC+0LrQsClcbiAgICogQHBhcmFtIGJvZHkgLSDRgdGC0YDQvtC60LAsINC60L7RgtC+0YDQsNGPINC00L7Qv9C40YjQtdGC0YHRjyDQsiB4bWwgICjRgdGC0YDQvtC60LApXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIHNpZ25YTUwoc0NlcnROYW1lOiBzdHJpbmcsIGJvZHk6IHN0cmluZykge1xuICAgIGNvbnN0IENBUElDT01fQ1VSUkVOVF9VU0VSX1NUT1JFID0gMjtcbiAgICBjb25zdCBDQVBJQ09NX01ZX1NUT1JFID0gJ015JztcbiAgICBjb25zdCBDQVBJQ09NX1NUT1JFX09QRU5fTUFYSU1VTV9BTExPV0VEID0gMjtcbiAgICBjb25zdCBDQURFU0NPTV9DT05UQUlORVJfU1RPUkUgPSAxMDA7XG4gICAgY29uc3QgQ0FQSUNPTV9DRVJUSUZJQ0FURV9GSU5EX1NIQTFfSEFTSCA9IDA7XG4gICAgY29uc3QgQ0FQSUNPTV9DRVJUSUZJQ0FURV9GSU5EX1NVQkpFQ1RfTkFNRSA9IDE7XG4gICAgY29uc3QgQ0FERVNDT01fWE1MX1NJR05BVFVSRV9UWVBFX1RFTVBMQVRFID0gMjtcbiAgICBjb25zdCBDQURFU0NPTV9FTkNPREVfQkFTRTY0ID0gMDtcblxuICAgIGNvbnN0IHJ1biA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY2FkZXNwbHVnaW4uYXN5bmNfc3Bhd24oZnVuY3Rpb24qIChhcmdzKSB7XG4gICAgICAgIC8vINCX0LTQtdGB0Ywg0YHQu9C10LTRg9C10YIg0LfQsNC/0L7Qu9C90LjRgtGMIFN1YmplY3ROYW1lINGB0LXRgNGC0LjRhNC40LrQsNGC0LBcbiAgICAgICAgLy8gbGV0IHNDZXJ0TmFtZSA9IG9DZXJ0TmFtZS52YWx1ZTtcblxuICAgICAgICBpZiAoJycgPT09IHNDZXJ0TmFtZSkge1xuICAgICAgICAgIGFsZXJ0KCfQktCy0LXQtNC40YLQtSDQuNC80Y8g0YHQtdGA0YLQuNGE0LjQutCw0YLQsCAoQ04pLicpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vINCY0YnQtdC8INGB0LXRgNGC0LjRhNC40LrQsNGCINC00LvRjyDQv9C+0LTQv9C40YHQuFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnN0IG9TdG9yZSA9IHlpZWxkIGNhZGVzcGx1Z2luLkNyZWF0ZU9iamVjdEFzeW5jKCdDQWRFU0NPTS5TdG9yZScpO1xuICAgICAgICB5aWVsZCBvU3RvcmUuT3BlbihDQVBJQ09NX0NVUlJFTlRfVVNFUl9TVE9SRSwgQ0FQSUNPTV9NWV9TVE9SRSxcbiAgICAgICAgICBDQVBJQ09NX1NUT1JFX09QRU5fTUFYSU1VTV9BTExPV0VELCBDQURFU0NPTV9DT05UQUlORVJfU1RPUkUpO1xuXG4gICAgICAgIGNvbnN0IG9TdG9yZUNlcnRzID0geWllbGQgb1N0b3JlLkNlcnRpZmljYXRlcztcbiAgICAgICAgY29uc3Qgb0NlcnRpZmljYXRlcyA9IHlpZWxkIG9TdG9yZUNlcnRzLkZpbmQoXG4gICAgICAgICAgQ0FQSUNPTV9DRVJUSUZJQ0FURV9GSU5EX1NIQTFfSEFTSCwgc0NlcnROYW1lKTtcbiAgICAgICAgY29uc3QgY2VydHNDb3VudCA9IHlpZWxkIG9DZXJ0aWZpY2F0ZXMuQ291bnQ7XG4gICAgICAgIGlmIChjZXJ0c0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgdGhhdC5zaWduRXZlbnQkLm5leHQoe3N0YXR1czogRXJyb3JDcnlwdG9Qcm8uQ2VydGlmaWNhdGVOb3RGb3VuZCwgcGF5bG9hZDogc0NlcnROYW1lfSk7XG4gICAgICAgICAgLy8gYWxlcnQoXCJDZXJ0aWZpY2F0ZSBub3QgZm91bmQ6IFwiICsgc0NlcnROYW1lKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb0NlcnRpZmljYXRlID0geWllbGQgb0NlcnRpZmljYXRlcy5JdGVtKDEpO1xuICAgICAgICB5aWVsZCBvU3RvcmUuQ2xvc2UoKTtcblxuICAgICAgICBjb25zdCBvUHVibGljS2V5ID0geWllbGQgb0NlcnRpZmljYXRlLlB1YmxpY0tleSgpO1xuICAgICAgICBjb25zdCBvQWxnb3JpdGhtID0geWllbGQgb1B1YmxpY0tleS5BbGdvcml0aG07XG4gICAgICAgIGNvbnN0IGFsZ29PaWQgPSB5aWVsZCBvQWxnb3JpdGhtLlZhbHVlO1xuICAgICAgICBsZXQgc2lnbk1ldGhvZCA9ICcnO1xuICAgICAgICBsZXQgZGlnZXN0TWV0aG9kID0gJyc7XG4gICAgICAgIGlmIChhbGdvT2lkID09PSAnMS4yLjY0My43LjEuMS4xLjEnKSB7ICAgLy8g0LDQu9Cz0L7RgNC40YLQvCDQv9C+0LTQv9C40YHQuCDQk9Ce0KHQoiDQoCAzNC4xMC0yMDEyINGBINC60LvRjtGH0L7QvCAyNTYg0LHQuNGCXG4gICAgICAgICAgc2lnbk1ldGhvZCA9ICd1cm46aWV0ZjpwYXJhbXM6eG1sOm5zOmNweG1sc2VjOmFsZ29yaXRobXM6Z29zdHIzNDEwMjAxMi1nb3N0cjM0MTEyMDEyLTI1Nic7XG4gICAgICAgICAgZGlnZXN0TWV0aG9kID0gJ3VybjppZXRmOnBhcmFtczp4bWw6bnM6Y3B4bWxzZWM6YWxnb3JpdGhtczpnb3N0cjM0MTEyMDEyLTI1Nic7XG4gICAgICAgIH0gZWxzZSBpZiAoYWxnb09pZCA9PT0gJzEuMi42NDMuNy4xLjEuMS4yJykgeyAgIC8vINCw0LvQs9C+0YDQuNGC0Lwg0L/QvtC00L/QuNGB0Lgg0JPQntCh0KIg0KAgMzQuMTAtMjAxMiDRgSDQutC70Y7Rh9C+0LwgNTEyINCx0LjRglxuICAgICAgICAgIHNpZ25NZXRob2QgPSAndXJuOmlldGY6cGFyYW1zOnhtbDpuczpjcHhtbHNlYzphbGdvcml0aG1zOmdvc3RyMzQxMDIwMTItZ29zdHIzNDExMjAxMi01MTInO1xuICAgICAgICAgIGRpZ2VzdE1ldGhvZCA9ICd1cm46aWV0ZjpwYXJhbXM6eG1sOm5zOmNweG1sc2VjOmFsZ29yaXRobXM6Z29zdHIzNDExMjAxMi01MTInO1xuICAgICAgICB9IGVsc2UgaWYgKGFsZ29PaWQgPT09ICcxLjIuNjQzLjIuMi4xOScpIHsgIC8vINCw0LvQs9C+0YDQuNGC0Lwg0JPQntCh0KIg0KAgMzQuMTAtMjAwMVxuICAgICAgICAgIHNpZ25NZXRob2QgPSAndXJuOmlldGY6cGFyYW1zOnhtbDpuczpjcHhtbHNlYzphbGdvcml0aG1zOmdvc3RyMzQxMDIwMDEtZ29zdHIzNDExJztcbiAgICAgICAgICBkaWdlc3RNZXRob2QgPSAndXJuOmlldGY6cGFyYW1zOnhtbDpuczpjcHhtbHNlYzphbGdvcml0aG1zOmdvc3RyMzQxMSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyb3JtZXMgPSAn0J/QvtC00LTQtdGA0LbQuNCy0LDQtdGC0YHRjyBYTUwg0L/QvtC00L/QuNGB0Ywg0YHQtdGA0YLQuNGE0LjQutCw0YLQsNC80Lgg0YLQvtC70YzQutC+INGBINCw0LvQs9C+0YDQuNGC0LzQvtC8INCT0J7QodCiINCgIDM0LjEwLTIwMTIsINCT0J7QodCiINCgIDM0LjEwLTIwMDEnO1xuICAgICAgICAgIHRoYXQuc2lnbkV2ZW50JC5uZXh0KHtzdGF0dXM6IEVycm9yQ3J5cHRvUHJvLlNpZ25Ob3RJbkdPU1QsIHBheWxvYWQ6IGVycm9ybWVzfSk7XG4gICAgICAgICAgLy8gYWxlcnQoZXJyb3JtZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGI2NGNlcnQgPSB5aWVsZCBvQ2VydGlmaWNhdGUuRXhwb3J0KENBREVTQ09NX0VOQ09ERV9CQVNFNjQpO1xuICAgICAgICBiNjRjZXJ0ID0gYjY0Y2VydC5yZXBsYWNlKC9bXFxyXFxuXS9nLCAnJyk7XG5cbiAgICAgICAgLy8g0JIg0YjQsNCx0LvQvtC90LUg0LTQvtC60YPQvNC10L3RgtCwINC+0LHRj9C30LDRgtC10LvRjNC90L4g0LTQvtC70LbQvdGLINC/0YDQuNGB0YPRgtGB0YLQstC+0LLQsNGC0Ywg0YHQu9C10LTRg9GO0YnQuNC1INGN0LvQtdC80LXQvdGC0Ys6XG4gICAgICAgIC8vIEJpbmFyeVNlY3VyaXR5VG9rZW4gLSDRgdC10YDRgtC40YTQuNC60LDRgiDQutC70Y7Rh9CwINC/0L7QtNC/0LjRgdC4INCyINC60L7QtNC40YDQvtCy0LrQtSBCQVNFNjRcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgINCw0YLRgNC40LHRg9GCIElkINC00L7Qu9C20LXQvSDRgdC+0LTQtdGA0LbQsNGC0Ywg0YPQvdC40LrQsNC70YzQvdGL0Lkg0LjQtNC10L3RgtC40YTQuNC60LDRgtC+0YBcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgINGB0LXRgNGC0LjRhNC40LrQsNGC0LAg0LIg0LTQvtC60YPQvNC10L3RgtC1XG4gICAgICAgIC8vIFNpZ25hdHVyZSAtINGN0LvQtdC80LXQvdGCINGBINC+0L/QuNGB0LDQvdC40LXQvCDRgdCy0L7QudGB0YLQsiDQv9C+0LTQv9C40YHQuDpcbiAgICAgICAgLy8gICAgIFNpZ25lZEluZm8gLSDQuNC90YTQvtGA0LzQsNGG0LjRjyDQviDQv9C+0LTQv9C40YHRi9Cy0LDQtdC80YvRhSDRjdC70LXQvNC10L3RgtCw0YU6XG4gICAgICAgIC8vICAgICAgICAgQ2Fub25pY2FsaXphdGlvbk1ldGhvZCAtINCw0LvQs9C+0YDQuNGC0Lwg0L/RgNC40LLQtdC00LXQvdC40Y8g0Log0LrQsNC90L7QvdC40YfQtdGB0LrQvtC80YMg0LLQuNC00YMuXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgINCU0LvRjyDQodCc0K3QkiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuI1wiXG4gICAgICAgIC8vICAgICAgICAgU2lnbmF0dXJlTWV0aG9kIC0g0LjQtNC10L3RgtC40YTQuNC60LDRgtC+0YAg0LDQu9Cz0L7RgNC40YLQvNCwINC/0L7QtNC/0LjRgdC4LlxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgINCU0LvRjyDQodCc0K3QkiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI2dvc3RyMzQxMDIwMDEtZ29zdHIzNDExXCJcbiAgICAgICAgLy8gICAgICAgICBSZWZlcmVuY2UgLSDQsNGC0YDQuNCx0YPRgiBVUkkg0LTQvtC70LbQtdC9INGB0L7QtNC10YDQttCw0YLRjCDRgdGB0YvQu9C60YMg0L3QsCDQv9C+0LTQv9C40YHRi9Cy0LDQtdC80YvQtSDRjdC70LXQvNC10L3RgtGLINCyINCy0LDRiNC10Lwg0LTQvtC60YPQvNC10L3RgtC1OlxuICAgICAgICAvLyAgICAgICAgICAgICBUcmFuc2Zvcm1zIC0g0L/RgNC10L7QsdGA0LDQt9C+0LLQsNC90LjRjywg0LrQvtGC0L7RgNGL0LUg0YHQu9C10LTRg9C10YIg0L/RgNC40LzQtdC90LjRgtGMINC6INC/0L7QtNC/0LjRgdGL0LLQsNC10LzRi9C8INGN0LvQtdC80LXQvdGC0LDQvC5cbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgINCSINC/0YDQuNC80LXRgNC1IC0g0L/RgNC40LLQtdC00LXQvdC40LUg0Log0LrQsNC90L7QvdC40YfQtdGB0LrQvtC80YMg0LLQuNC00YMuXG4gICAgICAgIC8vICAgICAgICAgICAgIERpZ2VzdE1ldGhvZCAtINC40LTQtdC90YLQuNGE0LjQutCw0YLQvtGAINCw0LvQs9C+0YDQuNGC0LzQsCDRhdGN0YjQuNGA0L7QstCw0L3QuNGPLlxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICDQlNC70Y8g0KHQnNCt0JIgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNnb3N0cjM0MTFcIlxuICAgICAgICAvLyAgICAgICAgICAgICBEaWdlc3RWYWx1ZSAtINCl0Y3RiC3Qt9C90LDRh9C10L3QuNC1INC/0L7QtNC/0LjRgdGL0LLQsNC10LzRi9GFINGN0LvQtdC80LXQvdGC0L7Qsi4g0JTQsNC90L3Ri9C5INGN0LvQtdC80LXQvdGCINGB0LvQtdC00YPQtdGCINC+0YHRgtCw0LLQuNGC0Ywg0L/Rg9GB0YLRi9C8LlxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgINCV0LPQviDQt9C90LDRh9C10L3QuNC1INCx0YPQtNC10YIg0LfQsNC/0L7Qu9C90LXQvdC+INC/0YDQuCDRgdC+0LfQtNCw0L3QuNC4INC/0L7QtNC/0LjRgdC4LlxuICAgICAgICAvLyAgICAgU2lnbmF0dXJlVmFsdWUgLSDQt9C90LDRh9C10L3QuNC1INC/0L7QtNC/0LjRgdC4LiDQlNCw0L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YIg0YHQu9C10LTRg9C10YIg0L7RgdGC0LDQstC40YLRjCDQv9GD0YHRgtGL0LwuXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgINCV0LPQviDQt9C90LDRh9C10L3QuNC1INCx0YPQtNC10YIg0LfQsNC/0L7Qu9C90LXQvdC+INC/0YDQuCDRgdC+0LfQtNCw0L3QuNC4INC/0L7QtNC/0LjRgdC4LlxuICAgICAgICAvLyAgICAgS2V5SW5mbyAtINC40L3RhNC+0YDQvNCw0YbQuNGPINC+INGB0LXRgNGC0LjRhNC40LrQsNGC0LUg0LrQu9GO0YfQsCDQv9C+0LTQv9C40YHQuFxuICAgICAgICAvLyAgICAgICAgIFNlY3VyaXR5VG9rZW5SZWZlcmVuY2UgLSDRgdGB0YvQu9C60LAg0L3QsCDRgdC10YDRgtC40YTQuNC60LDRglxuICAgICAgICAvLyAgICAgICAgICAgICBSZWZlcmVuY2UgLSDQsNGC0YDQuNCx0YPRgiBWYWx1ZVR5cGUg0LTQvtC70LbQtdC9INGB0L7QtNC10YDQttCw0YLRjCDQt9C90LDRh9C10L3QuNC1XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIFwiaHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvd3NzLzIwMDQvMDEvb2FzaXMtMjAwNDAxLXdzcy14NTA5LXRva2VuLXByb2ZpbGUtMS4wI1g1MDl2M1wiXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgINCQ0YLRgNC40LHRg9GCIFVSSSDQtNC+0LvQttC10L0g0YHQvtC00LXRgNC20LDRgtGMINGB0YHRi9C70LrRgyDQvdCwINGD0L3QuNC60LDQu9GM0L3Ri9C5INC40LTQtdC90YLQuNGE0LjQutCw0YLQvtGAXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgINGB0LXRgNGC0LjRhNC40LrQsNGC0LAgKNGC0LDQutC+0Lkg0LbQtSwg0LrQsNC6INGD0LrQsNC30LDQvSDQsiDRjdC70LXQvNC10L3RgtC1IEJpbmFyeVNlY3VyaXR5VG9rZW4pXG4gICAgICAgIGNvbnN0IHNDb250ZW50ID0gdGhhdC5nZXRYTUxUZW1wbGF0ZShib2R5LCBiNjRjZXJ0LCBzaWduTWV0aG9kLCBkaWdlc3RNZXRob2QpO1xuXG4gICAgICAgIC8vINCh0L7Qt9C00LDQtdC8INC+0LHRitC10LrRgiBDQWRFU0NPTS5DUFNpZ25lclxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnN0IG9TaWduZXIgPSB5aWVsZCBjYWRlc3BsdWdpbi5DcmVhdGVPYmplY3RBc3luYygnQ0FkRVNDT00uQ1BTaWduZXInKTtcbiAgICAgICAgeWllbGQgb1NpZ25lci5wcm9wc2V0X0NlcnRpZmljYXRlKG9DZXJ0aWZpY2F0ZSk7XG4gICAgICAgIHlpZWxkIG9TaWduZXIucHJvcHNldF9DaGVja0NlcnRpZmljYXRlKHRydWUpO1xuXG4gICAgICAgIC8vINCh0L7Qt9C00LDQtdC8INC+0LHRitC10LrRgiBDQWRFU0NPTS5TaWduZWRYTUxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBjb25zdCBvU2lnbmVkWE1MID0geWllbGQgY2FkZXNwbHVnaW4uQ3JlYXRlT2JqZWN0QXN5bmMoJ0NBZEVTQ09NLlNpZ25lZFhNTCcpO1xuICAgICAgICB5aWVsZCBvU2lnbmVkWE1MLnByb3BzZXRfQ29udGVudChzQ29udGVudCk7XG5cbiAgICAgICAgLy8g0KPQutCw0LfRi9Cy0LDQtdC8INGC0LjQvyDQv9C+0LTQv9C40YHQuCAtINCyINC00LDQvdC90L7QvCDRgdC70YPRh9Cw0LUg0L/QviDRiNCw0LHQu9C+0L3Rg1xuICAgICAgICB5aWVsZCBvU2lnbmVkWE1MLnByb3BzZXRfU2lnbmF0dXJlVHlwZShDQURFU0NPTV9YTUxfU0lHTkFUVVJFX1RZUEVfVEVNUExBVEUpO1xuXG4gICAgICAgIGxldCBzU2lnbmVkTWVzc2FnZSA9ICcnO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHNTaWduZWRNZXNzYWdlID0geWllbGQgb1NpZ25lZFhNTC5TaWduKG9TaWduZXIpO1xuICAgICAgICAgIHRoYXQuc2lnbkV2ZW50JC5uZXh0KHtzdGF0dXM6IEVycm9yQ3J5cHRvUHJvLlN1Y2Nlc3MsIHBheWxvYWQ6IHNTaWduZWRNZXNzYWdlfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICB0aGF0LnNpZ25FdmVudCQubmV4dCh7c3RhdHVzOiBFcnJvckNyeXB0b1Byby5TaWduRXJyb3IsIHBheWxvYWQ6IGNhZGVzcGx1Z2luLmdldExhc3RFcnJvcihlcnIubWVzc2FnZSl9KTtcbiAgICAgICAgICAvLyBhbGVydChcIkZhaWxlZCB0byBjcmVhdGUgc2lnbmF0dXJlLiBFcnJvcjogXCIgKyBjYWRlc3BsdWdpbi5nZXRMYXN0RXJyb3IoZXJyKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vINCf0L7Qu9GD0YfQtdC90L3Ri9C5INC/0L7QtNC/0LjRgdCw0L3QvdGL0LkgWE1MLdC00L7QutGD0LzQtdC90YIg0LTQvtC70LbQtdC9INC/0YDQvtGF0L7QtNC40YLRjCDQv9GA0L7QstC10YDQutGDINC90LAg0YHQsNC50YLQtSDQodCc0K3QklxuICAgICAgICAvLyBjb25zb2xlLmxvZyhzU2lnbmVkTWVzc2FnZSk7XG5cblxuICAgICAgICAvLyBWZXJpZmljYXRpb25cblxuICAgICAgICAvLyDQodC+0LfQtNCw0LXQvCDQvtCx0YrQtdC60YIgQ0FkRVNDT00uU2lnbmVkWE1MXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgLy8gbGV0IG9TaWduZWRYTUwyID0geWllbGQgY2FkZXNwbHVnaW4uQ3JlYXRlT2JqZWN0QXN5bmMoXCJDQWRFU0NPTS5TaWduZWRYTUxcIik7XG5cbiAgICAgICAgLy8gdHJ5IHtcbiAgICAgICAgLy8gICB5aWVsZCBvU2lnbmVkWE1MMi5WZXJpZnkoc1NpZ25lZE1lc3NhZ2UpO1xuICAgICAgICAvLyAgIGFsZXJ0KFwiU2lnbmF0dXJlIHZlcmlmaWVkXCIpO1xuICAgICAgICAvLyB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gICAvLyBAdHMtaWdub3JlXG4gICAgICAgIC8vICAgYWxlcnQoXCJGYWlsZWQgdG8gdmVyaWZ5IHNpZ25hdHVyZS4gRXJyb3I6IFwiICsgY2FkZXNwbHVnaW4uZ2V0TGFzdEVycm9yKGVycikpO1xuICAgICAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJ1bigpO1xuICB9XG59XG4iXX0=