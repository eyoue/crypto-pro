import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { BehaviorSubject, iif, of, throwError } from "rxjs";
import { catchError, filter, map, tap } from "rxjs/operators";
import * as JsonToXML from "js2xmlparser";
import { CryptoProService } from "./crypto-pro.service";
import { CertificatesMapper } from "./mapper/certificates.mapper";
import { EMPTY_CERTIFICATE } from "./default-data/certificates";
import { ErrorCryptoPro } from "./models";
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
XMLESignDirective.decorators = [
    { type: Directive, args: [{
                selector: '[xml-e-sign]',
                exportAs: 'xmlESign'
            },] }
];
XMLESignDirective.ctorParameters = () => [
    { type: CryptoProService }
];
XMLESignDirective.propDecorators = {
    rootField: [{ type: Input }],
    jsonObject: [{ type: Input }],
    isNeedDownloadFile: [{ type: Input }],
    successResult: [{ type: Output }],
    failedResult: [{ type: Output }],
    keyEvent: [{ type: HostListener, args: ['window:keyup', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sLWUtc2lnbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9lLXNpZ24tbGliL3NyYy9saWIveG1sLWUtc2lnbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFDLGVBQWUsRUFBRSxHQUFHLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN0RSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUQsT0FBTyxLQUFLLFNBQVMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDOUQsT0FBTyxFQUFtQixjQUFjLEVBQWMsTUFBTSxVQUFVLENBQUM7QUFNdkUsTUFBTSxPQUFPLGlCQUFpQjtJQTRFNUIsWUFBb0IsYUFBK0I7UUFBL0Isa0JBQWEsR0FBYixhQUFhLENBQWtCO1FBaEVuRDs7V0FFRztRQUNILGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBRXRCOztXQUVHO1FBQ0gsbUJBQWMsR0FBRyxLQUFLLENBQUM7UUFFdkI7O1dBRUc7UUFDSCxlQUFVLEdBQUcsSUFBSSxlQUFlLENBQU0sSUFBSSxDQUFDLENBQUM7UUFFNUM7O1dBRUc7UUFDSCxrQkFBYSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsS0FBSyxNQUFNLENBQUM7UUFFekU7O1dBRUc7UUFFSCxjQUFT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QkE0Q3JCLEtBQUs7eUJBTUwsS0FBSztpQ0FNTCxLQUFLOzRCQU1MLE1BQU07MkJBTU4sTUFBTTt1QkFRTixZQUFZLFNBQUMsY0FBYyxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIEV2ZW50RW1pdHRlciwgSG9zdExpc3RlbmVyLCBJbnB1dCwgT3V0cHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBpaWYsIE9ic2VydmFibGUsIG9mLCB0aHJvd0Vycm9yfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHtjYXRjaEVycm9yLCBmaWx0ZXIsIG1hcCwgdGFwfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCAqIGFzIEpzb25Ub1hNTCBmcm9tIFwianMyeG1scGFyc2VyXCI7XG5pbXBvcnQge0NyeXB0b1Byb1NlcnZpY2V9IGZyb20gXCIuL2NyeXB0by1wcm8uc2VydmljZVwiO1xuaW1wb3J0IHtDZXJ0aWZpY2F0ZXNNYXBwZXJ9IGZyb20gXCIuL21hcHBlci9jZXJ0aWZpY2F0ZXMubWFwcGVyXCI7XG5pbXBvcnQge0VNUFRZX0NFUlRJRklDQVRFfSBmcm9tIFwiLi9kZWZhdWx0LWRhdGEvY2VydGlmaWNhdGVzXCI7XG5pbXBvcnQge0NlcnRpZmljYXRlTW9kZWwsIEVycm9yQ3J5cHRvUHJvLCBJU2lnblJlc3VsdH0gZnJvbSBcIi4vbW9kZWxzXCI7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1t4bWwtZS1zaWduXScsXG4gIGV4cG9ydEFzOiAneG1sRVNpZ24nXG59KVxuZXhwb3J0IGNsYXNzIFhNTEVTaWduRGlyZWN0aXZlIHtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCh0L/QuNGB0L7QuiDRgdC10YDRgtC40YTQuNC60LDRgtC+0LJcbiAgICovXG4gIGNlcnRpZmljYXRlczogQ2VydGlmaWNhdGVNb2RlbFtdO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0JLRi9Cx0YDQsNC90L3Ri9C5INGB0LXRgNGC0LjRhNC40LrQsNGCXG4gICAqL1xuICBzZWxlY3RlZENlcnRpZmljYXRlOiBDZXJ0aWZpY2F0ZU1vZGVsO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0J/Qu9Cw0LPQuNC9INGA0LDQsdC+0YfQuNC5XG4gICAqL1xuICBpc1BsdWdpblZhbGlkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQn9C+0LTQv9C40YHRgtGMINCyINC/0YDQvtGG0LXRgdGB0LVcbiAgICovXG4gIHNpZ25JblByb2dyZXNzID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQodC+0LHRi9GC0LjRjyDQv9C+0LTQv9C40YHQuCAo0L7RiNC40LHQutC4INC40LvQuCDRg9GB0L/QtdGFKVxuICAgKi9cbiAgc2lnbkV2ZW50JCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8YW55PihudWxsKTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINCk0LvQsNCzINGC0LXRgdGC0L7QstC+0LPQviDRgNC10LbQuNC80LAgKEFsdCArIFMpXG4gICAqL1xuICBpc1Rlc3RpbmdNb2RlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NJR05fWE1MX1RFU1RJTkdfTU9ERScpID09PSAndHJ1ZSc7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQkdC70L7QuiDQsiDQutC+0YLQvtGA0YvQuSDQsdGD0LTQtdGCINC/0L7Qu9C+0LbQtdC9INGA0LDRgdC/0LDRgNGB0LXQvdC90YvQuSDQvtCx0YrQtdC60YIgWE1MXG4gICAqL1xuICBASW5wdXQoKVxuICByb290RmllbGQgPSAnaHRtbCc7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQmNGB0YXQvtC00L3Ri9C5INC+0LHRitC10LrRglxuICAgKi9cbiAgQElucHV0KClcbiAganNvbk9iamVjdCA9IHt9O1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0KTQu9Cw0LMg0YHQutCw0YfQuNCy0LDQvdC40Y8g0YTQsNC50LvQsCDQv9GA0Lgg0L/QvtC00L/QuNGB0LhcbiAgICovXG4gIEBJbnB1dCgpXG4gIGlzTmVlZERvd25sb2FkRmlsZSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0KHQvtCx0YvRgtC40Y8g0YPRgdC/0LXRhdCwXG4gICAqL1xuICBAT3V0cHV0KClcbiAgc3VjY2Vzc1Jlc3VsdCA9IG5ldyBFdmVudEVtaXR0ZXI8SVNpZ25SZXN1bHQ+KG51bGwpO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0KHQvtCx0YvRgtC40Y8g0L7RiNC40LHQvtC6XG4gICAqL1xuICBAT3V0cHV0KClcbiAgZmFpbGVkUmVzdWx0ID0gbmV3IEV2ZW50RW1pdHRlcjxJU2lnblJlc3VsdD4obnVsbCk7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQktGF0L7QtCDQsiDRgNC10LbQuNC8INGC0LXRgdGC0LjRgNC+0LLRidC40LrQsFxuICAgKiDQldGB0LvQuCDQvdC1INGD0YHRgtCw0L3QvtCy0LvQtdC9INC/0LvQsNCz0LjQvSDRgtC+IEFsdCArIFNcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6a2V5dXAnLCBbJyRldmVudCddKVxuICBrZXlFdmVudChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmIChldmVudC5hbHRLZXkgJiYgZXZlbnQuY29kZSA9PT0gJ0tleVMnKSB7XG4gICAgICB0aGlzLmlzVGVzdGluZ01vZGUgPSAhdGhpcy5pc1Rlc3RpbmdNb2RlO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ1NJR05fWE1MX1RFU1RJTkdfTU9ERScsIFN0cmluZyh0aGlzLmlzVGVzdGluZ01vZGUpKTtcbiAgICAgIGNvbnNvbGUubG9nKCdTSUdOX1hNTF9URVNUSU5HX01PREU6ICcsIHRoaXMuaXNUZXN0aW5nTW9kZSA/ICdvbicgOiAnb2ZmJyk7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjcnlwdG9TZXJ2aWNlOiBDcnlwdG9Qcm9TZXJ2aWNlKSB7XG4gICAgdGhpcy5saXN0ZW5TaWduRXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uINGB0LvRg9GI0LDRgtC10LvRjCDRgdC+0LHRi9GC0LjQuSDQv9C+0LTQv9C40YHQuFxuICAgKiDQktC90YPRgtGA0Lggb2JzZXJ2YWJsZSAtINCyINC90LXQs9C+INC/0YPRiNCw0YLRgdGPINGB0L7QsdGL0YLQuNGPINGD0YHQv9C10YXQsCDQuNC70Lgg0L7RiNC40LHQutC4XG4gICAqINCi0YPRgiDQvtC90Lgg0L7QsdGA0LDQsdCw0YLRi9Cy0LDRjtGC0YHRj1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHVibGljIGxpc3RlblNpZ25FdmVudHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2lnbkV2ZW50JFxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbHRlcihyZXNwb25zZSA9PiByZXNwb25zZSksXG4gICAgICAgIHRhcCgocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBjb25zdCB7c3RhdHVzLCBwYXlsb2FkfSA9IHJlc3BvbnNlO1xuICAgICAgICAgIHRoaXMuc2lnbkluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICBpZiAoc3RhdHVzID09PSBFcnJvckNyeXB0b1Byby5TdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLnN1Y2Nlc3NSZXN1bHQuZW1pdCh7c3RhdHVzLCBwYXlsb2FkfSk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ2VydGlmaWNhdGUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNOZWVkRG93bmxvYWRGaWxlKSB7XG4gICAgICAgICAgICAgIHRoaXMuZG93bmxvYWRGaWxlKHBheWxvYWQsICdzaWduZWQueG1sJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vINC+0LHRgNCw0LHQvtGC0LrQsCDQvtGI0LjQsdC+0LpcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ2VydGlmaWNhdGUpIHtcbiAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENlcnRpZmljYXRlLmlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENlcnRpZmljYXRlLmNsYXNzID0gJ2Rpc2FibGVkJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZmFpbGVkUmVzdWx0LmVtaXQoe3N0YXR1cywgcGF5bG9hZH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApLnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQn9GA0L7QstC10YDQuNGC0Ywg0L3QsNC70LjRh9C40LUg0L/Qu9Cw0LPQuNC90LBcbiAgICovXG4gIGNoZWNrUGx1Z2luKCkge1xuICAgIHRoaXMuaXNQbHVnaW5WYWxpZCA9IHRoaXMuY3J5cHRvU2VydmljZS5pc1BsdWdpbjtcblxuICAgIGlmICghdGhpcy5pc1BsdWdpblZhbGlkICYmICF0aGlzLmlzVGVzdGluZ01vZGUpIHtcbiAgICAgIHRoaXMuc2lnbkV2ZW50JC5uZXh0KHtcbiAgICAgICAgc3RhdHVzOiBFcnJvckNyeXB0b1Byby5QbHVnaW5Ob3RGaW5lZCxcbiAgICAgICAgcGF5bG9hZDogJ9Ci0YDQtdCx0YPQtdGC0YHRjyAg0JrRgNC40L/RgtC+0J/RgNC+INCt0KbQnyBCcm93c2VyIHBsdWctaW4g0Lgg0YPRgdGC0LDQvdC+0LLQu9C10L3QvdCw0Y8g0K3QptCfJ1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQldGB0LvQuCDRgdC10YDRgtC40YTQuNC60LDRgiDQstGL0LHRgNCw0L1cbiAgICogQHBhcmFtIGNlcnRpZmljYXRlXG4gICAqL1xuICBvbkNlcnRpZmljYXRlU2VsZWN0ZWQoY2VydGlmaWNhdGU6IENlcnRpZmljYXRlTW9kZWwpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkQ2VydGlmaWNhdGUgPSBjZXJ0aWZpY2F0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0J/QvtC70YPRh9C40YLRjCDRgdC/0LjRgdC+0Log0YHQtdGA0YLQuNGE0LjQutCw0YLQvtCyXG4gICAqL1xuICBnZXRDZXJ0aWZpY2F0ZXMoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBpZiAoIXRoaXMuanNvbk9iamVjdCkge1xuICAgICAgcmV0dXJuIG9mKG51bGwpO1xuICAgIH1cbiAgICBjb25zdCBzdWNjZXNzRm4gPSAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5jcnlwdG9TZXJ2aWNlLmdldFVzZXJDZXJ0aWZpY2F0ZXMoKTtcbiAgICB9O1xuICAgIGNvbnN0IGZhaWxGbiA9ICgpID0+IHtcbiAgICAgIHJldHVybiBvZih0aGlzLmlzVGVzdGluZ01vZGUgPyBbRU1QVFlfQ0VSVElGSUNBVEVdIDogW10pO1xuICAgIH07XG4gICAgY29uc3QgYWN0aW9uID0gKCkgPT4ge1xuICAgICAgdGhpcy5jaGVja1BsdWdpbigpO1xuICAgICAgcmV0dXJuIGlpZigoKSA9PiB0aGlzLmlzUGx1Z2luVmFsaWQsXG4gICAgICAgIHN1Y2Nlc3NGbigpLFxuICAgICAgICBmYWlsRm4oKVxuICAgICAgKS5waXBlKFxuICAgICAgICBtYXAoKGNlcnRpZmljYXRlczogYW55W10pID0+IGNlcnRpZmljYXRlcy5tYXAoYyA9PiBDZXJ0aWZpY2F0ZXNNYXBwZXIubWFwKGMpKSksXG4gICAgICAgIHRhcChjZXJ0aWZpY2F0ZXMgPT4ge1xuICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGVzID0gY2VydGlmaWNhdGVzO1xuICAgICAgICB9KSxcbiAgICAgICAgY2F0Y2hFcnJvcihlcnJvciA9PiB7XG4gICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZXMgPSBbXTtcbiAgICAgICAgICB0aGlzLnNpZ25FdmVudCQubmV4dCh7XG4gICAgICAgICAgICBzdGF0dXM6IEVycm9yQ3J5cHRvUHJvLlBsdWdpbk5vdEZpbmVkLFxuICAgICAgICAgICAgcGF5bG9hZDogJ9Ci0YDQtdCx0YPQtdGC0YHRjyAg0JrRgNC40L/RgtC+0J/RgNC+INCt0KbQnyBCcm93c2VyIHBsdWctaW4g0Lgg0YPRgdGC0LDQvdC+0LLQu9C10L3QvdCw0Y8g0K3QptCfJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfTtcbiAgICByZXR1cm4gYWN0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHRleHQgLSDRgdC+0LTQtdGA0LbQuNC80L7QtSDRhNCw0LnQu9CwICjRgdGC0YDQvtC60LApXG4gICAqIEBwYXJhbSBmaWxlbmFtZSAtINC40LzRjyDRhNCw0LnQu9CwXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIGRvd25sb2FkRmlsZSh0ZXh0OiBzdHJpbmcsIGZpbGVuYW1lID0gJ2ZpbGVuYW1lLnhtbCcpIHtcbiAgICBjb25zdCBwb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgY29uc3QgYmIgPSBuZXcgQmxvYihbdGV4dF0sIHt0eXBlOiAndGV4dC9wbGFpbid9KTtcblxuICAgIHBvbS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChiYikpO1xuICAgIHBvbS5zZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJywgZmlsZW5hbWUpO1xuXG4gICAgcG9tLmRhdGFzZXQuZG93bmxvYWR1cmwgPSBbJ3RleHQvcGxhaW4nLCBwb20uZG93bmxvYWQsIHBvbS5ocmVmXS5qb2luKCc6Jyk7XG4gICAgcG9tLmRyYWdnYWJsZSA9IHRydWU7XG4gICAgcG9tLmNsYXNzTGlzdC5hZGQoJ2RyYWdvdXQnKTtcblxuICAgIHBvbS5jbGljaygpO1xuICAgIHBvbS5yZW1vdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24g0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GM0YHQutC40LkgSlNPTiDQsiBYTUwgKNCx0LXQtyDQvNC10YLQsCDQuNC90YTRiyDRh9GC0L4g0Y3RgtC+IHhtbClcbiAgICovXG4gIGdldCBqc29uVG9YbWwoKSB7XG4gICAgcmV0dXJuIEpzb25Ub1hNTC5wYXJzZSh0aGlzLnJvb3RGaWVsZCwgdGhpcy5qc29uT2JqZWN0KS5yZXBsYWNlKCc8P3htbCB2ZXJzaW9uPVxcJzEuMFxcJz8+XFxuJywgJycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiDQk9C10L3QtdGA0LjQvCB4bWwsINC4INC+0YLQtNCw0LXQvCDQvdCwINC/0L7QtNC/0LjRgdGMIC0g0LXRgdC70Lgg0LzRiyDQsiDRgNC10LbQuNC80LUg0YLQtdGB0YLQuNGA0L7QstCw0L3QuNGPXG4gICAqINGB0YDQsNC30YMg0L7RgtC00LDQtdC8IHhtbCAo0LHRg9C0LdGC0L4g0L7QvSDQv9C+0LTQv9C40YHQsNC9KVxuICAgKi9cbiAgcHVibGljIHNpZ24oKSB7XG4gICAgY29uc3QgeG1sRGF0YSA9IHRoaXMuanNvblRvWG1sO1xuICAgIHRoaXMuc2lnbkluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIGlmICghdGhpcy5zZWxlY3RlZENlcnRpZmljYXRlIHx8IHRoaXMuc2VsZWN0ZWRDZXJ0aWZpY2F0ZS50aHVtYnByaW50ID09PSBFTVBUWV9DRVJUSUZJQ0FURS50aHVtYnByaW50KSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IHRoaXMuaXNUZXN0aW5nTW9kZSA/XG4gICAgICAgIHtzdGF0dXM6IEVycm9yQ3J5cHRvUHJvLlN1Y2Nlc3MsIHBheWxvYWQ6IHRoaXMuZ2V0WE1MVGVtcGxhdGUoeG1sRGF0YSwgJycsICcnLCAnJyl9IDpcbiAgICAgICAge1xuICAgICAgICAgIHN0YXR1czogRXJyb3JDcnlwdG9Qcm8uUGx1Z2luTm90RmluZWQsXG4gICAgICAgICAgcGF5bG9hZDogJ9Ci0YDQtdCx0YPQtdGC0YHRjyAg0JrRgNC40L/RgtC+0J/RgNC+INCt0KbQnyBCcm93c2VyIHBsdWctaW4g0Lgg0YPRgdGC0LDQvdC+0LLQu9C10L3QvdCw0Y8g0K3QptCfJ1xuICAgICAgICB9O1xuICAgICAgdGhpcy5zaWduRXZlbnQkLm5leHQocmVzcG9uc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNpZ25YTUwodGhpcy5zZWxlY3RlZENlcnRpZmljYXRlLnRodW1icHJpbnQsIHhtbERhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gYm9keSAtINGC0LXQu9C+IHhtbCDRgSDQtNCw0L3QvdGL0LzQuCDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8gKNGB0YLRgNC+0LrQsClcbiAgICogQHBhcmFtIGI2NGNlcnQgLSDRgdC10YDRgtC40YTQuNC60LDRgiAo0YHRgtGA0L7QutCwKVxuICAgKiBAcGFyYW0gc2lnbk1ldGhvZCAtINC80LXRgtC+0LQg0L/QvtC00L/QuNGB0LggKNGB0YLRgNC+0LrQsClcbiAgICogQHBhcmFtIGRpZ2VzdE1ldGhvZCAtINGH0YLQvi3RgtC+INC00LvRjyDQutCw0L3QvtC90LjQt9Cw0YbQuNC4IFhNTCAo0YHRgtGA0L7QutCwKVxuICAgKi9cbiAgZ2V0WE1MVGVtcGxhdGUgPSAoYm9keTogc3RyaW5nLCBiNjRjZXJ0OiBzdHJpbmcsIHNpZ25NZXRob2Q6IHN0cmluZywgZGlnZXN0TWV0aG9kOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cIlVURi04XCI/PicgK1xuICAgICAgJzxzOkVudmVsb3BlIHhtbG5zOnM9XCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy9zb2FwL2VudmVsb3BlL1wiIHhtbG5zOnU9XCJodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy93c3MvMjAwNC8wMS9vYXNpcy0yMDA0MDEtd3NzLXdzc2VjdXJpdHktdXRpbGl0eS0xLjAueHNkXCI+JyArXG4gICAgICAnICAgIDxzOkhlYWRlcj4nICtcbiAgICAgICcgICAgICAgIDxvOlNlY3VyaXR5IHM6bXVzdFVuZGVyc3RhbmQ9XCIxXCIgeG1sbnM6bz1cImh0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL3dzcy8yMDA0LzAxL29hc2lzLTIwMDQwMS13c3Mtd3NzZWN1cml0eS1zZWNleHQtMS4wLnhzZFwiIHM6YWN0b3I9XCJodHRwOi8vc21ldi5nb3N1c2x1Z2kucnUvYWN0b3JzL3NtZXZcIj4nICtcbiAgICAgICcgICAgICAgICAgICA8bzpCaW5hcnlTZWN1cml0eVRva2VuIHU6SWQ9XCJ1dWlkLWVlODJkNDQ1LTc1OGItNDJjYi05OTZjLTY2NmI3NGI2MDAyMi0yXCIgVmFsdWVUeXBlPVwiaHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvd3NzLzIwMDQvMDEvb2FzaXMtMjAwNDAxLXdzcy14NTA5LXRva2VuLXByb2ZpbGUtMS4wI1g1MDl2M1wiIEVuY29kaW5nVHlwZT1cImh0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL3dzcy8yMDA0LzAxL29hc2lzLTIwMDQwMS13c3Mtc29hcC1tZXNzYWdlLXNlY3VyaXR5LTEuMCNCYXNlNjRCaW5hcnlcIj4nXG4gICAgICArIGI2NGNlcnQgK1xuICAgICAgJzwvbzpCaW5hcnlTZWN1cml0eVRva2VuPicgK1xuICAgICAgJyAgICAgICAgICAgIDxTaWduYXR1cmUgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjXCI+JyArXG4gICAgICAnICAgICAgICAgICAgICAgIDxTaWduZWRJbmZvPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICAgICAgPENhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jXCIgLz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDxTaWduYXR1cmVNZXRob2QgQWxnb3JpdGhtPVwiJyArIHNpZ25NZXRob2QgKyAnXCIvPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICAgICAgPFJlZmVyZW5jZSBVUkk9XCIjXzFcIj4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgICAgICA8VHJhbnNmb3Jtcz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRyYW5zZm9ybSBBbGdvcml0aG09XCJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biNcIiAvPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgIDwvVHJhbnNmb3Jtcz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgICAgICA8RGlnZXN0TWV0aG9kIEFsZ29yaXRobT1cIicgKyBkaWdlc3RNZXRob2QgKyAnXCIvPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgIDxEaWdlc3RWYWx1ZT48L0RpZ2VzdFZhbHVlPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICAgICAgPC9SZWZlcmVuY2U+JyArXG4gICAgICAnICAgICAgICAgICAgICAgIDwvU2lnbmVkSW5mbz4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgPFNpZ25hdHVyZVZhbHVlPjwvU2lnbmF0dXJlVmFsdWU+JyArXG4gICAgICAnICAgICAgICAgICAgICAgIDxLZXlJbmZvPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICAgICAgPG86U2VjdXJpdHlUb2tlblJlZmVyZW5jZT4nICtcbiAgICAgICcgICAgICAgICAgICAgICAgICAgIDxvOlJlZmVyZW5jZSBWYWx1ZVR5cGU9XCJodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy93c3MvMjAwNC8wMS9vYXNpcy0yMDA0MDEtd3NzLXg1MDktdG9rZW4tcHJvZmlsZS0xLjAjWDUwOXYzXCIgVVJJPVwiI3V1aWQtZWU4MmQ0NDUtNzU4Yi00MmNiLTk5NmMtNjY2Yjc0YjYwMDIyLTJcIiAvPicgK1xuICAgICAgJyAgICAgICAgICAgICAgICAgICAgPC9vOlNlY3VyaXR5VG9rZW5SZWZlcmVuY2U+JyArXG4gICAgICAnICAgICAgICAgICAgICAgIDwvS2V5SW5mbz4nICtcbiAgICAgICcgICAgICAgICAgICA8L1NpZ25hdHVyZT4nICtcbiAgICAgICcgICAgICAgIDwvbzpTZWN1cml0eT4nICtcbiAgICAgICcgICAgPC9zOkhlYWRlcj4nICtcbiAgICAgICcgICAgPHM6Qm9keSB1OklkPVwiXzFcIiB4bWxuczp4c2k9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZVwiIHhtbG5zOnhzZD1cImh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hXCI+JyArXG4gICAgICBib2R5ICtcbiAgICAgICcgICAgPC9zOkJvZHk+JyArXG4gICAgICAnPC9zOkVudmVsb3BlPic7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHNDZXJ0TmFtZSAtINC40LzRjyDRgdC10YDRgtC40YTQuNC60LDRgtCwICAo0YHRgtGA0L7QutCwKVxuICAgKiBAcGFyYW0gYm9keSAtINGB0YLRgNC+0LrQsCwg0LrQvtGC0L7RgNCw0Y8g0LTQvtC/0LjRiNC10YLRgdGPINCyIHhtbCAgKNGB0YLRgNC+0LrQsClcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgc2lnblhNTChzQ2VydE5hbWU6IHN0cmluZywgYm9keTogc3RyaW5nKSB7XG4gICAgLy8gY29uc3QgQ0FQSUNPTV9DVVJSRU5UX1VTRVJfU1RPUkUgPSAyO1xuICAgIC8vIGNvbnN0IENBUElDT01fTVlfU1RPUkUgPSAnTXknO1xuICAgIC8vIGNvbnN0IENBUElDT01fU1RPUkVfT1BFTl9NQVhJTVVNX0FMTE9XRUQgPSAyO1xuICAgIGNvbnN0IENBREVTQ09NX0NPTlRBSU5FUl9TVE9SRSA9IDEwMDtcbiAgICBjb25zdCBDQVBJQ09NX0NFUlRJRklDQVRFX0ZJTkRfU0hBMV9IQVNIID0gMDtcbiAgICAvLyBjb25zdCBDQVBJQ09NX0NFUlRJRklDQVRFX0ZJTkRfU1VCSkVDVF9OQU1FID0gMTtcbiAgICBjb25zdCBDQURFU0NPTV9YTUxfU0lHTkFUVVJFX1RZUEVfVEVNUExBVEUgPSAyO1xuICAgIGNvbnN0IENBREVTQ09NX0VOQ09ERV9CQVNFNjQgPSAwO1xuXG4gICAgY29uc3QgcnVuID0gKCkgPT4ge1xuICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjYWRlc3BsdWdpbi5hc3luY19zcGF3bihmdW5jdGlvbiogKGFyZ3MpIHtcbiAgICAgICAgLy8g0JfQtNC10YHRjCDRgdC70LXQtNGD0LXRgiDQt9Cw0L/QvtC70L3QuNGC0YwgU3ViamVjdE5hbWUg0YHQtdGA0YLQuNGE0LjQutCw0YLQsFxuICAgICAgICAvLyBsZXQgc0NlcnROYW1lID0gb0NlcnROYW1lLnZhbHVlO1xuXG4gICAgICAgIGlmICgnJyA9PT0gc0NlcnROYW1lKSB7XG4gICAgICAgICAgYWxlcnQoJ9CS0LLQtdC00LjRgtC1INC40LzRjyDRgdC10YDRgtC40YTQuNC60LDRgtCwIChDTikuJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g0JjRidC10Lwg0YHQtdGA0YLQuNGE0LjQutCw0YIg0LTQu9GPINC/0L7QtNC/0LjRgdC4XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3Qgb1N0b3JlID0geWllbGQgY2FkZXNwbHVnaW4uQ3JlYXRlT2JqZWN0QXN5bmMoJ0NBZEVTQ09NLlN0b3JlJyk7XG4gICAgICAgIHlpZWxkIG9TdG9yZS5PcGVuKENBREVTQ09NX0NPTlRBSU5FUl9TVE9SRSk7XG5cbiAgICAgICAgY29uc3Qgb1N0b3JlQ2VydHMgPSB5aWVsZCBvU3RvcmUuQ2VydGlmaWNhdGVzO1xuICAgICAgICBjb25zdCBvQ2VydGlmaWNhdGVzID0geWllbGQgb1N0b3JlQ2VydHMuRmluZChcbiAgICAgICAgICBDQVBJQ09NX0NFUlRJRklDQVRFX0ZJTkRfU0hBMV9IQVNILCBzQ2VydE5hbWUpO1xuICAgICAgICBjb25zdCBjZXJ0c0NvdW50ID0geWllbGQgb0NlcnRpZmljYXRlcy5Db3VudDtcbiAgICAgICAgaWYgKGNlcnRzQ291bnQgPT09IDApIHtcbiAgICAgICAgICB0aGF0LnNpZ25FdmVudCQubmV4dCh7c3RhdHVzOiBFcnJvckNyeXB0b1Byby5DZXJ0aWZpY2F0ZU5vdEZvdW5kLCBwYXlsb2FkOiBzQ2VydE5hbWV9KTtcbiAgICAgICAgICAvLyBhbGVydChcIkNlcnRpZmljYXRlIG5vdCBmb3VuZDogXCIgKyBzQ2VydE5hbWUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvQ2VydGlmaWNhdGUgPSB5aWVsZCBvQ2VydGlmaWNhdGVzLkl0ZW0oMSk7XG4gICAgICAgIHlpZWxkIG9TdG9yZS5DbG9zZSgpO1xuXG4gICAgICAgIGNvbnN0IG9QdWJsaWNLZXkgPSB5aWVsZCBvQ2VydGlmaWNhdGUuUHVibGljS2V5KCk7XG4gICAgICAgIGNvbnN0IG9BbGdvcml0aG0gPSB5aWVsZCBvUHVibGljS2V5LkFsZ29yaXRobTtcbiAgICAgICAgY29uc3QgYWxnb09pZCA9IHlpZWxkIG9BbGdvcml0aG0uVmFsdWU7XG4gICAgICAgIGxldCBzaWduTWV0aG9kID0gJyc7XG4gICAgICAgIGxldCBkaWdlc3RNZXRob2QgPSAnJztcbiAgICAgICAgaWYgKGFsZ29PaWQgPT09ICcxLjIuNjQzLjcuMS4xLjEuMScpIHsgICAvLyDQsNC70LPQvtGA0LjRgtC8INC/0L7QtNC/0LjRgdC4INCT0J7QodCiINCgIDM0LjEwLTIwMTIg0YEg0LrQu9GO0YfQvtC8IDI1NiDQsdC40YJcbiAgICAgICAgICBzaWduTWV0aG9kID0gJ3VybjppZXRmOnBhcmFtczp4bWw6bnM6Y3B4bWxzZWM6YWxnb3JpdGhtczpnb3N0cjM0MTAyMDEyLWdvc3RyMzQxMTIwMTItMjU2JztcbiAgICAgICAgICBkaWdlc3RNZXRob2QgPSAndXJuOmlldGY6cGFyYW1zOnhtbDpuczpjcHhtbHNlYzphbGdvcml0aG1zOmdvc3RyMzQxMTIwMTItMjU2JztcbiAgICAgICAgfSBlbHNlIGlmIChhbGdvT2lkID09PSAnMS4yLjY0My43LjEuMS4xLjInKSB7ICAgLy8g0LDQu9Cz0L7RgNC40YLQvCDQv9C+0LTQv9C40YHQuCDQk9Ce0KHQoiDQoCAzNC4xMC0yMDEyINGBINC60LvRjtGH0L7QvCA1MTIg0LHQuNGCXG4gICAgICAgICAgc2lnbk1ldGhvZCA9ICd1cm46aWV0ZjpwYXJhbXM6eG1sOm5zOmNweG1sc2VjOmFsZ29yaXRobXM6Z29zdHIzNDEwMjAxMi1nb3N0cjM0MTEyMDEyLTUxMic7XG4gICAgICAgICAgZGlnZXN0TWV0aG9kID0gJ3VybjppZXRmOnBhcmFtczp4bWw6bnM6Y3B4bWxzZWM6YWxnb3JpdGhtczpnb3N0cjM0MTEyMDEyLTUxMic7XG4gICAgICAgIH0gZWxzZSBpZiAoYWxnb09pZCA9PT0gJzEuMi42NDMuMi4yLjE5JykgeyAgLy8g0LDQu9Cz0L7RgNC40YLQvCDQk9Ce0KHQoiDQoCAzNC4xMC0yMDAxXG4gICAgICAgICAgc2lnbk1ldGhvZCA9ICd1cm46aWV0ZjpwYXJhbXM6eG1sOm5zOmNweG1sc2VjOmFsZ29yaXRobXM6Z29zdHIzNDEwMjAwMS1nb3N0cjM0MTEnO1xuICAgICAgICAgIGRpZ2VzdE1ldGhvZCA9ICd1cm46aWV0ZjpwYXJhbXM6eG1sOm5zOmNweG1sc2VjOmFsZ29yaXRobXM6Z29zdHIzNDExJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnJvcm1lcyA9ICfQn9C+0LTQtNC10YDQttC40LLQsNC10YLRgdGPIFhNTCDQv9C+0LTQv9C40YHRjCDRgdC10YDRgtC40YTQuNC60LDRgtCw0LzQuCDRgtC+0LvRjNC60L4g0YEg0LDQu9Cz0L7RgNC40YLQvNC+0Lwg0JPQntCh0KIg0KAgMzQuMTAtMjAxMiwg0JPQntCh0KIg0KAgMzQuMTAtMjAwMSc7XG4gICAgICAgICAgdGhhdC5zaWduRXZlbnQkLm5leHQoe3N0YXR1czogRXJyb3JDcnlwdG9Qcm8uU2lnbk5vdEluR09TVCwgcGF5bG9hZDogZXJyb3JtZXN9KTtcbiAgICAgICAgICAvLyBhbGVydChlcnJvcm1lcyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYjY0Y2VydCA9IHlpZWxkIG9DZXJ0aWZpY2F0ZS5FeHBvcnQoQ0FERVNDT01fRU5DT0RFX0JBU0U2NCk7XG4gICAgICAgIGI2NGNlcnQgPSBiNjRjZXJ0LnJlcGxhY2UoL1tcXHJcXG5dL2csICcnKTtcblxuICAgICAgICAvLyDQkiDRiNCw0LHQu9C+0L3QtSDQtNC+0LrRg9C80LXQvdGC0LAg0L7QsdGP0LfQsNGC0LXQu9GM0L3QviDQtNC+0LvQttC90Ysg0L/RgNC40YHRg9GC0YHRgtCy0L7QstCw0YLRjCDRgdC70LXQtNGD0Y7RidC40LUg0Y3Qu9C10LzQtdC90YLRizpcbiAgICAgICAgLy8gQmluYXJ5U2VjdXJpdHlUb2tlbiAtINGB0LXRgNGC0LjRhNC40LrQsNGCINC60LvRjtGH0LAg0L/QvtC00L/QuNGB0Lgg0LIg0LrQvtC00LjRgNC+0LLQutC1IEJBU0U2NFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAg0LDRgtGA0LjQsdGD0YIgSWQg0LTQvtC70LbQtdC9INGB0L7QtNC10YDQttCw0YLRjCDRg9C90LjQutCw0LvRjNC90YvQuSDQuNC00LXQvdGC0LjRhNC40LrQsNGC0L7RgFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAg0YHQtdGA0YLQuNGE0LjQutCw0YLQsCDQsiDQtNC+0LrRg9C80LXQvdGC0LVcbiAgICAgICAgLy8gU2lnbmF0dXJlIC0g0Y3Qu9C10LzQtdC90YIg0YEg0L7Qv9C40YHQsNC90LjQtdC8INGB0LLQvtC50YHRgtCyINC/0L7QtNC/0LjRgdC4OlxuICAgICAgICAvLyAgICAgU2lnbmVkSW5mbyAtINC40L3RhNC+0YDQvNCw0YbQuNGPINC+INC/0L7QtNC/0LjRgdGL0LLQsNC10LzRi9GFINGN0LvQtdC80LXQvdGC0LDRhTpcbiAgICAgICAgLy8gICAgICAgICBDYW5vbmljYWxpemF0aW9uTWV0aG9kIC0g0LDQu9Cz0L7RgNC40YLQvCDQv9GA0LjQstC10LTQtdC90LjRjyDQuiDQutCw0L3QvtC90LjRh9C10YHQutC+0LzRgyDQstC40LTRgy5cbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg0JTQu9GPINCh0JzQrdCSIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jXCJcbiAgICAgICAgLy8gICAgICAgICBTaWduYXR1cmVNZXRob2QgLSDQuNC00LXQvdGC0LjRhNC40LrQsNGC0L7RgCDQsNC70LPQvtGA0LjRgtC80LAg0L/QvtC00L/QuNGB0LguXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAg0JTQu9GPINCh0JzQrdCSIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxkc2lnLW1vcmUjZ29zdHIzNDEwMjAwMS1nb3N0cjM0MTFcIlxuICAgICAgICAvLyAgICAgICAgIFJlZmVyZW5jZSAtINCw0YLRgNC40LHRg9GCIFVSSSDQtNC+0LvQttC10L0g0YHQvtC00LXRgNC20LDRgtGMINGB0YHRi9C70LrRgyDQvdCwINC/0L7QtNC/0LjRgdGL0LLQsNC10LzRi9C1INGN0LvQtdC80LXQvdGC0Ysg0LIg0LLQsNGI0LXQvCDQtNC+0LrRg9C80LXQvdGC0LU6XG4gICAgICAgIC8vICAgICAgICAgICAgIFRyYW5zZm9ybXMgLSDQv9GA0LXQvtCx0YDQsNC30L7QstCw0L3QuNGPLCDQutC+0YLQvtGA0YvQtSDRgdC70LXQtNGD0LXRgiDQv9GA0LjQvNC10L3QuNGC0Ywg0Log0L/QvtC00L/QuNGB0YvQstCw0LXQvNGL0Lwg0Y3Qu9C10LzQtdC90YLQsNC8LlxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAg0JIg0L/RgNC40LzQtdGA0LUgLSDQv9GA0LjQstC10LTQtdC90LjQtSDQuiDQutCw0L3QvtC90LjRh9C10YHQutC+0LzRgyDQstC40LTRgy5cbiAgICAgICAgLy8gICAgICAgICAgICAgRGlnZXN0TWV0aG9kIC0g0LjQtNC10L3RgtC40YTQuNC60LDRgtC+0YAg0LDQu9Cz0L7RgNC40YLQvNCwINGF0Y3RiNC40YDQvtCy0LDQvdC40Y8uXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgINCU0LvRjyDQodCc0K3QkiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI2dvc3RyMzQxMVwiXG4gICAgICAgIC8vICAgICAgICAgICAgIERpZ2VzdFZhbHVlIC0g0KXRjdGILdC30L3QsNGH0LXQvdC40LUg0L/QvtC00L/QuNGB0YvQstCw0LXQvNGL0YUg0Y3Qu9C10LzQtdC90YLQvtCyLiDQlNCw0L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YIg0YHQu9C10LTRg9C10YIg0L7RgdGC0LDQstC40YLRjCDQv9GD0YHRgtGL0LwuXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAg0JXQs9C+INC30L3QsNGH0LXQvdC40LUg0LHRg9C00LXRgiDQt9Cw0L/QvtC70L3QtdC90L4g0L/RgNC4INGB0L7Qt9C00LDQvdC40Lgg0L/QvtC00L/QuNGB0LguXG4gICAgICAgIC8vICAgICBTaWduYXR1cmVWYWx1ZSAtINC30L3QsNGH0LXQvdC40LUg0L/QvtC00L/QuNGB0LguINCU0LDQvdC90YvQuSDRjdC70LXQvNC10L3RgiDRgdC70LXQtNGD0LXRgiDQvtGB0YLQsNCy0LjRgtGMINC/0YPRgdGC0YvQvC5cbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAg0JXQs9C+INC30L3QsNGH0LXQvdC40LUg0LHRg9C00LXRgiDQt9Cw0L/QvtC70L3QtdC90L4g0L/RgNC4INGB0L7Qt9C00LDQvdC40Lgg0L/QvtC00L/QuNGB0LguXG4gICAgICAgIC8vICAgICBLZXlJbmZvIC0g0LjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0YHQtdGA0YLQuNGE0LjQutCw0YLQtSDQutC70Y7Rh9CwINC/0L7QtNC/0LjRgdC4XG4gICAgICAgIC8vICAgICAgICAgU2VjdXJpdHlUb2tlblJlZmVyZW5jZSAtINGB0YHRi9C70LrQsCDQvdCwINGB0LXRgNGC0LjRhNC40LrQsNGCXG4gICAgICAgIC8vICAgICAgICAgICAgIFJlZmVyZW5jZSAtINCw0YLRgNC40LHRg9GCIFZhbHVlVHlwZSDQtNC+0LvQttC10L0g0YHQvtC00LXRgNC20LDRgtGMINC30L3QsNGH0LXQvdC40LVcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgXCJodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy93c3MvMjAwNC8wMS9vYXNpcy0yMDA0MDEtd3NzLXg1MDktdG9rZW4tcHJvZmlsZS0xLjAjWDUwOXYzXCJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAg0JDRgtGA0LjQsdGD0YIgVVJJINC00L7Qu9C20LXQvSDRgdC+0LTQtdGA0LbQsNGC0Ywg0YHRgdGL0LvQutGDINC90LAg0YPQvdC40LrQsNC70YzQvdGL0Lkg0LjQtNC10L3RgtC40YTQuNC60LDRgtC+0YBcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAg0YHQtdGA0YLQuNGE0LjQutCw0YLQsCAo0YLQsNC60L7QuSDQttC1LCDQutCw0Log0YPQutCw0LfQsNC9INCyINGN0LvQtdC80LXQvdGC0LUgQmluYXJ5U2VjdXJpdHlUb2tlbilcbiAgICAgICAgY29uc3Qgc0NvbnRlbnQgPSB0aGF0LmdldFhNTFRlbXBsYXRlKGJvZHksIGI2NGNlcnQsIHNpZ25NZXRob2QsIGRpZ2VzdE1ldGhvZCk7XG5cbiAgICAgICAgLy8g0KHQvtC30LTQsNC10Lwg0L7QsdGK0LXQutGCIENBZEVTQ09NLkNQU2lnbmVyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3Qgb1NpZ25lciA9IHlpZWxkIGNhZGVzcGx1Z2luLkNyZWF0ZU9iamVjdEFzeW5jKCdDQWRFU0NPTS5DUFNpZ25lcicpO1xuICAgICAgICB5aWVsZCBvU2lnbmVyLnByb3BzZXRfQ2VydGlmaWNhdGUob0NlcnRpZmljYXRlKTtcbiAgICAgICAgeWllbGQgb1NpZ25lci5wcm9wc2V0X0NoZWNrQ2VydGlmaWNhdGUodHJ1ZSk7XG5cbiAgICAgICAgLy8g0KHQvtC30LTQsNC10Lwg0L7QsdGK0LXQutGCIENBZEVTQ09NLlNpZ25lZFhNTFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnN0IG9TaWduZWRYTUwgPSB5aWVsZCBjYWRlc3BsdWdpbi5DcmVhdGVPYmplY3RBc3luYygnQ0FkRVNDT00uU2lnbmVkWE1MJyk7XG4gICAgICAgIHlpZWxkIG9TaWduZWRYTUwucHJvcHNldF9Db250ZW50KHNDb250ZW50KTtcblxuICAgICAgICAvLyDQo9C60LDQt9GL0LLQsNC10Lwg0YLQuNC/INC/0L7QtNC/0LjRgdC4IC0g0LIg0LTQsNC90L3QvtC8INGB0LvRg9GH0LDQtSDQv9C+INGI0LDQsdC70L7QvdGDXG4gICAgICAgIHlpZWxkIG9TaWduZWRYTUwucHJvcHNldF9TaWduYXR1cmVUeXBlKENBREVTQ09NX1hNTF9TSUdOQVRVUkVfVFlQRV9URU1QTEFURSk7XG5cbiAgICAgICAgbGV0IHNTaWduZWRNZXNzYWdlID0gJyc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc1NpZ25lZE1lc3NhZ2UgPSB5aWVsZCBvU2lnbmVkWE1MLlNpZ24ob1NpZ25lcik7XG4gICAgICAgICAgdGhhdC5zaWduRXZlbnQkLm5leHQoe3N0YXR1czogRXJyb3JDcnlwdG9Qcm8uU3VjY2VzcywgcGF5bG9hZDogc1NpZ25lZE1lc3NhZ2V9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIHRoYXQuc2lnbkV2ZW50JC5uZXh0KHtzdGF0dXM6IEVycm9yQ3J5cHRvUHJvLlNpZ25FcnJvciwgcGF5bG9hZDogY2FkZXNwbHVnaW4uZ2V0TGFzdEVycm9yKGVyci5tZXNzYWdlKX0pO1xuICAgICAgICAgIC8vIGFsZXJ0KFwiRmFpbGVkIHRvIGNyZWF0ZSBzaWduYXR1cmUuIEVycm9yOiBcIiArIGNhZGVzcGx1Z2luLmdldExhc3RFcnJvcihlcnIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8g0J/QvtC70YPRh9C10L3QvdGL0Lkg0L/QvtC00L/QuNGB0LDQvdC90YvQuSBYTUwt0LTQvtC60YPQvNC10L3RgiDQtNC+0LvQttC10L0g0L/RgNC+0YXQvtC00LjRgtGMINC/0YDQvtCy0LXRgNC60YMg0L3QsCDRgdCw0LnRgtC1INCh0JzQrdCSXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHNTaWduZWRNZXNzYWdlKTtcblxuXG4gICAgICAgIC8vIFZlcmlmaWNhdGlvblxuXG4gICAgICAgIC8vINCh0L7Qt9C00LDQtdC8INC+0LHRitC10LrRgiBDQWRFU0NPTS5TaWduZWRYTUxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAvLyBsZXQgb1NpZ25lZFhNTDIgPSB5aWVsZCBjYWRlc3BsdWdpbi5DcmVhdGVPYmplY3RBc3luYyhcIkNBZEVTQ09NLlNpZ25lZFhNTFwiKTtcblxuICAgICAgICAvLyB0cnkge1xuICAgICAgICAvLyAgIHlpZWxkIG9TaWduZWRYTUwyLlZlcmlmeShzU2lnbmVkTWVzc2FnZSk7XG4gICAgICAgIC8vICAgYWxlcnQoXCJTaWduYXR1cmUgdmVyaWZpZWRcIik7XG4gICAgICAgIC8vIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgLy8gICBhbGVydChcIkZhaWxlZCB0byB2ZXJpZnkgc2lnbmF0dXJlLiBFcnJvcjogXCIgKyBjYWRlc3BsdWdpbi5nZXRMYXN0RXJyb3IoZXJyKSk7XG4gICAgICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcnVuKCk7XG4gIH1cbn1cbiJdfQ==