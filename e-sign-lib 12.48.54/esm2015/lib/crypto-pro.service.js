import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { createDetachedSignature, createHash, createXMLSignature, getSystemInfo, getUserCertificates, isValidSystemSetup } from "@epsr/crypto-pro";
import { catchError, map, tap } from 'rxjs/operators';
import { CryptoProPluginInfo } from "./models";
import * as i0 from "@angular/core";
export class CryptoProService {
    constructor() {
        this.isPlugin = false;
        // Отключить модальное окно с просьбой скачать плагин (встроенное в cadesplugin)
        if ('cadesplugin_skip_extension_install' in window) {
            //@ts-ignore
            window.cadesplugin_skip_extension_install = true;
        }
    }
    isPluginValid() {
        return from(isValidSystemSetup()).pipe(tap((value) => this.isPlugin = value, catchError(err => {
            this.isPlugin = false;
            return err;
        })));
    }
    getPluginInfo() {
        return from(getSystemInfo()).pipe(map(info => new CryptoProPluginInfo(info)));
    }
    getUserCertificates() {
        return new Observable(observer => from(getUserCertificates(true))
            .subscribe(observer));
    }
    createFileSignature(thumbprint, fileBlob) {
        return new Observable(observer => from(this.createFileDetachedSignature(thumbprint, fileBlob))
            .subscribe(observer));
    }
    createXMLSignature(thumbprint, unencryptedMessage) {
        return new Observable(observer => from(this.createXMLSignaturePromise(thumbprint, unencryptedMessage))
            .subscribe(observer));
    }
    createXMLSignaturePromise(thumbprint, unencryptedMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield createXMLSignature(thumbprint, unencryptedMessage);
        });
    }
    createFileDetachedSignature(thumbprint, fileBlob) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fileBlob.arrayBuffer();
            const hash = yield createHash(data);
            return yield createDetachedSignature(thumbprint, hash);
        });
    }
}
CryptoProService.ɵfac = function CryptoProService_Factory(t) { return new (t || CryptoProService)(); };
CryptoProService.ɵprov = i0.ɵɵdefineInjectable({ token: CryptoProService, factory: CryptoProService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CryptoProService, [{
        type: Injectable
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLXByby5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvZS1zaWduLWxpYi9zcmMvbGliL2NyeXB0by1wcm8uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN0QyxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLFVBQVUsRUFDVixrQkFBa0IsRUFDbEIsYUFBYSxFQUNiLG1CQUFtQixFQUNuQixrQkFBa0IsRUFDbkIsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxVQUFVLENBQUM7O0FBSTdDLE1BQU0sT0FBTyxnQkFBZ0I7SUFJM0I7UUFGQSxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBR2YsZ0ZBQWdGO1FBQ2hGLElBQUksb0NBQW9DLElBQUksTUFBTSxFQUFFO1lBQ2xELFlBQVk7WUFDWixNQUFNLENBQUMsa0NBQWtDLEdBQUcsSUFBSSxDQUFDO1NBQ2xEO0lBQ0gsQ0FBQztJQUVELGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDeEMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxFQUNoQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDZixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUN0QixPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUNILENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQy9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDM0MsQ0FBQztJQUNKLENBQUM7SUFFRCxtQkFBbUI7UUFDakIsT0FBTyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM5RCxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsbUJBQW1CLENBQUMsVUFBa0IsRUFBRSxRQUFjO1FBQ3BELE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUMzRixTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsa0JBQWtCLENBQUMsVUFBa0IsRUFBRSxrQkFBMEI7UUFDL0QsT0FBTyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxFQUFFLGtCQUFrQixDQUFDLENBQUM7YUFDbkcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVhLHlCQUF5QixDQUFDLFVBQWtCLEVBQUUsa0JBQTBCOztZQUNwRixPQUFPLE1BQU0sa0JBQWtCLENBQUMsVUFBVSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDbEUsQ0FBQztLQUFBO0lBRWEsMkJBQTJCLENBQUMsVUFBa0IsRUFBRSxRQUFjOztZQUMxRSxNQUFNLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMxQyxNQUFNLElBQUksR0FBRyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxPQUFPLE1BQU0sdUJBQXVCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pELENBQUM7S0FBQTs7Z0ZBbkRVLGdCQUFnQjt3REFBaEIsZ0JBQWdCLFdBQWhCLGdCQUFnQjt1RkFBaEIsZ0JBQWdCO2NBRDVCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tLCBPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGNyZWF0ZURldGFjaGVkU2lnbmF0dXJlLFxuICBjcmVhdGVIYXNoLFxuICBjcmVhdGVYTUxTaWduYXR1cmUsXG4gIGdldFN5c3RlbUluZm8sXG4gIGdldFVzZXJDZXJ0aWZpY2F0ZXMsXG4gIGlzVmFsaWRTeXN0ZW1TZXR1cFxufSBmcm9tIFwiQGVwc3IvY3J5cHRvLXByb1wiO1xuaW1wb3J0IHtjYXRjaEVycm9yLCBtYXAsIHRhcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDcnlwdG9Qcm9QbHVnaW5JbmZvfSBmcm9tIFwiLi9tb2RlbHNcIjtcblxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ3J5cHRvUHJvU2VydmljZSB7XG5cbiAgaXNQbHVnaW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvLyDQntGC0LrQu9GO0YfQuNGC0Ywg0LzQvtC00LDQu9GM0L3QvtC1INC+0LrQvdC+INGBINC/0YDQvtGB0YzQsdC+0Lkg0YHQutCw0YfQsNGC0Ywg0L/Qu9Cw0LPQuNC9ICjQstGB0YLRgNC+0LXQvdC90L7QtSDQsiBjYWRlc3BsdWdpbilcbiAgICBpZiAoJ2NhZGVzcGx1Z2luX3NraXBfZXh0ZW5zaW9uX2luc3RhbGwnIGluIHdpbmRvdykge1xuICAgICAgLy9AdHMtaWdub3JlXG4gICAgICB3aW5kb3cuY2FkZXNwbHVnaW5fc2tpcF9leHRlbnNpb25faW5zdGFsbCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaXNQbHVnaW5WYWxpZCgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gZnJvbShpc1ZhbGlkU3lzdGVtU2V0dXAoKSkucGlwZSh0YXAoXG4gICAgICAodmFsdWUpID0+IHRoaXMuaXNQbHVnaW4gPSB2YWx1ZSxcbiAgICAgIGNhdGNoRXJyb3IoZXJyID0+IHtcbiAgICAgICAgdGhpcy5pc1BsdWdpbiA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZXJyO1xuICAgICAgfSlcbiAgICApKTtcbiAgfVxuXG4gIGdldFBsdWdpbkluZm8oKTogT2JzZXJ2YWJsZTxDcnlwdG9Qcm9QbHVnaW5JbmZvPiB7XG4gICAgcmV0dXJuIGZyb20oZ2V0U3lzdGVtSW5mbygpKS5waXBlKFxuICAgICAgbWFwKGluZm8gPT4gbmV3IENyeXB0b1Byb1BsdWdpbkluZm8oaW5mbykpXG4gICAgKTtcbiAgfVxuXG4gIGdldFVzZXJDZXJ0aWZpY2F0ZXMoKTogT2JzZXJ2YWJsZTxhbnlbXT4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiBmcm9tKGdldFVzZXJDZXJ0aWZpY2F0ZXModHJ1ZSkpXG4gICAgICAuc3Vic2NyaWJlKG9ic2VydmVyKSk7XG4gIH1cblxuICBjcmVhdGVGaWxlU2lnbmF0dXJlKHRodW1icHJpbnQ6IHN0cmluZywgZmlsZUJsb2I6IEJsb2IpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiBmcm9tKHRoaXMuY3JlYXRlRmlsZURldGFjaGVkU2lnbmF0dXJlKHRodW1icHJpbnQsIGZpbGVCbG9iKSlcbiAgICAgIC5zdWJzY3JpYmUob2JzZXJ2ZXIpKTtcbiAgfVxuXG4gIGNyZWF0ZVhNTFNpZ25hdHVyZSh0aHVtYnByaW50OiBzdHJpbmcsIHVuZW5jcnlwdGVkTWVzc2FnZTogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4gZnJvbSh0aGlzLmNyZWF0ZVhNTFNpZ25hdHVyZVByb21pc2UodGh1bWJwcmludCwgdW5lbmNyeXB0ZWRNZXNzYWdlKSlcbiAgICAgIC5zdWJzY3JpYmUob2JzZXJ2ZXIpKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlWE1MU2lnbmF0dXJlUHJvbWlzZSh0aHVtYnByaW50OiBzdHJpbmcsIHVuZW5jcnlwdGVkTWVzc2FnZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGF3YWl0IGNyZWF0ZVhNTFNpZ25hdHVyZSh0aHVtYnByaW50LCB1bmVuY3J5cHRlZE1lc3NhZ2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVGaWxlRGV0YWNoZWRTaWduYXR1cmUodGh1bWJwcmludDogc3RyaW5nLCBmaWxlQmxvYjogQmxvYikge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBmaWxlQmxvYi5hcnJheUJ1ZmZlcigpO1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBjcmVhdGVIYXNoKGRhdGEpO1xuICAgIHJldHVybiBhd2FpdCBjcmVhdGVEZXRhY2hlZFNpZ25hdHVyZSh0aHVtYnByaW50LCBoYXNoKTtcbiAgfVxufVxuIl19