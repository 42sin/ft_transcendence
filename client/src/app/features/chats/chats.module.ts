import { NgModule } from '@angular/core';
import { ChatsComponent } from './chats.component';
import { AlertBoxModule } from './alert-box/alert-box.module';
import { AlertBoxComponent } from './alert-box/alert-box.component';
import { ConfirmBoxComponent } from './confirm-box/confirm-box/confirm-box.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from '../profile/components/profile.component';

const	routes: Routes = [
	// {path: 'user-profile/id', component: ProfileComponent/*, component: UserProfileComponent */}
	{path: 'profile', component: ProfileComponent}
]
@NgModule({
	imports: [
		CommonModule,
		RouterModule.forRoot(routes)
	],
	exports: [
		RouterModule
	],
	declarations: [ ChatsComponent, AlertBoxComponent, ConfirmBoxComponent ]
})
export class ChatsModule { }
