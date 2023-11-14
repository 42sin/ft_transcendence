import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BackgroundComponent } from './components/background/background.component';
import { SocketModule } from './socket/socket.module';

@NgModule({
    declarations: [
        NavbarComponent,
        BackgroundComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
		SocketModule
    ],
    exports: [
        NavbarComponent,
        BackgroundComponent
    ]
})

export class CoreModule {}
