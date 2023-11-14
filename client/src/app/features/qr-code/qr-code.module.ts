import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrCodeComponent } from './components/qr-code.component';
import { FormsModule } from '@angular/forms';
import { QrCodeRoutingModule } from './qr-code.routing.module';



@NgModule({
  declarations: [
    QrCodeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    QrCodeRoutingModule
  ],
  exports:  [
    QrCodeComponent
  ]
})
export class QrCodeModule { }
