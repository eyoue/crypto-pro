import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CryptoProService } from "./crypto-pro.service";
import { XMLESignDirective } from "./xml-e-sign.directive";
import * as i0 from "@angular/core";
import * as i1 from "./crypto-pro.service";
export class ESignerModule {
    constructor(cryptoService) {
        this.cryptoService = cryptoService;
        this.cryptoService.isPluginValid().subscribe();
    }
}
ESignerModule.ɵfac = function ESignerModule_Factory(t) { return new (t || ESignerModule)(i0.ɵɵinject(i1.CryptoProService)); };
ESignerModule.ɵmod = i0.ɵɵdefineNgModule({ type: ESignerModule });
ESignerModule.ɵinj = i0.ɵɵdefineInjector({ providers: [CryptoProService], imports: [[
            CommonModule,
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(ESignerModule, { declarations: [XMLESignDirective], imports: [CommonModule], exports: [XMLESignDirective] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ESignerModule, [{
        type: NgModule,
        args: [{
                imports: [
                    CommonModule,
                ],
                providers: [CryptoProService],
                declarations: [XMLESignDirective],
                exports: [XMLESignDirective]
            }]
    }], function () { return [{ type: i1.CryptoProService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZS1zaWduZXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvZS1zaWduLWxpYi9zcmMvbGliL2Utc2lnbmVyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQzs7O0FBVXpELE1BQU0sT0FBTyxhQUFhO0lBQ3hCLFlBQW9CLGFBQStCO1FBQS9CLGtCQUFhLEdBQWIsYUFBYSxDQUFrQjtRQUNqRCxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFBO0lBQ2hELENBQUM7OzBFQUhVLGFBQWE7aURBQWIsYUFBYTtzREFKYixDQUFDLGdCQUFnQixDQUFDLFlBSHBCO1lBQ1AsWUFBWTtTQUNiO3dGQUtVLGFBQWEsbUJBSFQsaUJBQWlCLGFBSDlCLFlBQVksYUFJSixpQkFBaUI7dUZBRWhCLGFBQWE7Y0FSekIsUUFBUTtlQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxZQUFZO2lCQUNiO2dCQUNELFNBQVMsRUFBRSxDQUFDLGdCQUFnQixDQUFDO2dCQUM3QixZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDakMsT0FBTyxFQUFFLENBQUMsaUJBQWlCLENBQUM7YUFDN0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDcnlwdG9Qcm9TZXJ2aWNlfSBmcm9tIFwiLi9jcnlwdG8tcHJvLnNlcnZpY2VcIjtcbmltcG9ydCB7WE1MRVNpZ25EaXJlY3RpdmV9IGZyb20gXCIuL3htbC1lLXNpZ24uZGlyZWN0aXZlXCI7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb21tb25Nb2R1bGUsXG4gIF0sXG4gIHByb3ZpZGVyczogW0NyeXB0b1Byb1NlcnZpY2VdLFxuICBkZWNsYXJhdGlvbnM6IFtYTUxFU2lnbkRpcmVjdGl2ZV0sXG4gIGV4cG9ydHM6IFtYTUxFU2lnbkRpcmVjdGl2ZV1cbn0pXG5leHBvcnQgY2xhc3MgRVNpZ25lck1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY3J5cHRvU2VydmljZTogQ3J5cHRvUHJvU2VydmljZSApIHtcbiAgICB0aGlzLmNyeXB0b1NlcnZpY2UuaXNQbHVnaW5WYWxpZCgpLnN1YnNjcmliZSgpXG4gIH1cbn1cbiJdfQ==