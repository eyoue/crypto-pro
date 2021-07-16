import { Observable } from 'rxjs';
import { CryptoProPluginInfo } from "./models";
import * as i0 from "@angular/core";
export declare class CryptoProService {
    isPlugin: boolean;
    constructor();
    isPluginValid(): Observable<boolean>;
    getPluginInfo(): Observable<CryptoProPluginInfo>;
    getUserCertificates(): Observable<any[]>;
    createFileSignature(thumbprint: string, fileBlob: Blob): Observable<any>;
    createXMLSignature(thumbprint: string, unencryptedMessage: string): Observable<any>;
    private createXMLSignaturePromise;
    private createFileDetachedSignature;
    static ɵfac: i0.ɵɵFactoryDef<CryptoProService, never>;
    static ɵprov: i0.ɵɵInjectableDef<CryptoProService>;
}
