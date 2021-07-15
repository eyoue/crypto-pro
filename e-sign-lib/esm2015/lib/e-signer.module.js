import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CryptoProService } from "./crypto-pro.service";
import { XMLESignDirective } from "./xml-e-sign.directive";
export class ESignerModule {
    constructor(cryptoService) {
        this.cryptoService = cryptoService;
        this.cryptoService.isPluginValid().subscribe();
    }
}
ESignerModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                ],
                providers: [CryptoProService],
                declarations: [XMLESignDirective],
                exports: [XMLESignDirective]
            },] }
];
ESignerModule.ctorParameters = () => [
    { type: CryptoProService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZS1zaWduZXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvZS1zaWduLWxpYi9zcmMvbGliL2Utc2lnbmVyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQVV6RCxNQUFNLE9BQU8sYUFBYTtJQUN4QixZQUFvQixhQUErQjtRQUEvQixrQkFBYSxHQUFiLGFBQWEsQ0FBa0I7UUFDakQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtJQUNoRCxDQUFDOzs7WUFYRixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLFlBQVk7aUJBQ2I7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzdCLFlBQVksRUFBRSxDQUFDLGlCQUFpQixDQUFDO2dCQUNqQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQzthQUM3Qjs7O1lBVk8sZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q3J5cHRvUHJvU2VydmljZX0gZnJvbSBcIi4vY3J5cHRvLXByby5zZXJ2aWNlXCI7XG5pbXBvcnQge1hNTEVTaWduRGlyZWN0aXZlfSBmcm9tIFwiLi94bWwtZS1zaWduLmRpcmVjdGl2ZVwiO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICBdLFxuICBwcm92aWRlcnM6IFtDcnlwdG9Qcm9TZXJ2aWNlXSxcbiAgZGVjbGFyYXRpb25zOiBbWE1MRVNpZ25EaXJlY3RpdmVdLFxuICBleHBvcnRzOiBbWE1MRVNpZ25EaXJlY3RpdmVdXG59KVxuZXhwb3J0IGNsYXNzIEVTaWduZXJNb2R1bGUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNyeXB0b1NlcnZpY2U6IENyeXB0b1Byb1NlcnZpY2UgKSB7XG4gICAgdGhpcy5jcnlwdG9TZXJ2aWNlLmlzUGx1Z2luVmFsaWQoKS5zdWJzY3JpYmUoKVxuICB9XG59XG4iXX0=