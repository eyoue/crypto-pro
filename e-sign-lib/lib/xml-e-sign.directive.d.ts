import { EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { CryptoProService } from "./crypto-pro.service";
import { CertificateModel, ISignResult } from "./models";
import * as i0 from "@angular/core";
export declare class XMLESignDirective {
    private cryptoService;
    /**
     * @description Список сертификатов
     */
    certificates: CertificateModel[];
    /**
     * @description Выбранный сертификат
     */
    selectedCertificate: CertificateModel;
    /**
     * @description Плагин рабочий
     */
    isPluginValid: boolean;
    /**
     * @description Подписть в процессе
     */
    signInProgress: boolean;
    /**
     * @description События подписи (ошибки или успех)
     */
    signEvent$: BehaviorSubject<any>;
    /**
     * @description Флаг тестового режима (Alt + S)
     */
    isTestingMode: boolean;
    /**
     * @description Блок в который будет положен распарсенный объект XML
     */
    rootField: string;
    /**
     * @description Исходный объект
     */
    jsonObject: {};
    /**
     * @description Флаг скачивания файла при подписи
     */
    isNeedDownloadFile: boolean;
    /**
     * @description События успеха
     */
    successResult: EventEmitter<ISignResult>;
    /**
     * @description События ошибок
     */
    failedResult: EventEmitter<ISignResult>;
    /**
     * @description Вход в режим тестировщика
     * Если не установлен плагин то Alt + S
     * @param event
     */
    keyEvent(event: KeyboardEvent): void;
    constructor(cryptoService: CryptoProService);
    /**
     * @description слушатель событий подписи
     * Внутри observable - в него пушатся события успеха или ошибки
     * Тут они обрабатываются
     * @private
     */
    listenSignEvents(): import("rxjs").Subscription;
    /**
     * @description Проверить наличие плагина
     */
    checkPlugin(): void;
    /**
     * @description Если сертификат выбран
     * @param certificate
     */
    onCertificateSelected(certificate: CertificateModel): void;
    /**
     * @description Получить список сертификатов
     */
    getCertificates(): Observable<any>;
    /**
     *
     * @param text - содержимое файла (строка)
     * @param filename - имя файла
     * @private
     */
    private downloadFile;
    /**
     * @description пользовательский JSON в XML (без мета инфы что это xml)
     */
    get jsonToXml(): string;
    /**
     * @description Генерим xml, и отдаем на подпись - если мы в режиме тестирования
     * сразу отдаем xml (буд-то он подписан)
     */
    sign(): void;
    /**
     *
     * @param body - тело xml с данными пользователя (строка)
     * @param b64cert - сертификат (строка)
     * @param signMethod - метод подписи (строка)
     * @param digestMethod - что-то для канонизации XML (строка)
     */
    getXMLTemplate: (body: string, b64cert: string, signMethod: string, digestMethod: string) => string;
    /**
     *
     * @param sCertName - имя сертификата  (строка)
     * @param body - строка, которая допишется в xml  (строка)
     * @private
     */
    private signXML;
    static ɵfac: i0.ɵɵFactoryDef<XMLESignDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<XMLESignDirective, "[xml-e-sign]", ["xmlESign"], { "rootField": "rootField"; "jsonObject": "jsonObject"; "isNeedDownloadFile": "isNeedDownloadFile"; }, { "successResult": "successResult"; "failedResult": "failedResult"; }, never>;
}
