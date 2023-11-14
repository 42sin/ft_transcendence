import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { QrCodeComponent } from "./components/qr-code.component";

const routes: Routes = [
    {path: 'QR', component: QrCodeComponent}
]

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        RouterModule
    ],
    exports: [
        RouterModule
    ]
})
export class QrCodeRoutingModule {}