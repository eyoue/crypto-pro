import { Observable } from 'rxjs';
import { CryptoProPluginInfo } from "./models";
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
}
