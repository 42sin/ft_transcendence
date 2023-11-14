import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { GameComponent } from './features/game/game.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ChatsComponent } from './features/chats/chats.component';

import { CommonModule } from '@angular/common';
import { CoreModule } from './core/core.module';
import { ProfileModule } from './features/profile/profile.module';
import { MenuModule } from './features/menu/menu.module';
import { HighscoreModule } from './features/highscore/highscore.module';
import { UsersModule } from './features/users/users.module';
import { LobbyModule } from './features/lobby/lobby.module';
import { LandingModule } from './features/landing/landing.module';
import { AlertBoxComponent } from './features/chats/alert-box/alert-box.component';
import { GameModule } from './features/game/game.module';
import { ChatsModule } from './features/chats/chats.module';
import { AlertBoxModule } from './features/chats/alert-box/alert-box.module';
import { WaitingRoomComponent } from './features/waiting-room/waiting-room.component';
import { WinnerComponent } from './features/winner/winner.component';
import { authGuard, canActivateChild, loadGuard } from 'projects/tools/src/lib/guards/auth.guard';
import { ErrorHandlerInterceptor } from './features/interceptors/auth.interceptor';
import { QrCodeModule } from './features/qr-code/qr-code.module';
import { UserProfileComponent } from './features/user-profile/components/user-profile.component';

const appRoute: Routes = [
  { path: '', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule) }, // Lazy loading the LandingModule
  { path: 'play', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], component: GameComponent },
  { path: 'chats', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], component: ChatsComponent },
//   { path: '', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], redirectTo: '/waiting-room', pathMatch: 'full' },
  { path: 'waiting-room', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], component: WaitingRoomComponent },
  
  { path: 'user-profile/:userID', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], component: UserProfileComponent },
  { path: 'winner', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], component: WinnerComponent },
  { path: 'profile', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule) }, // Lazy loading the ProfileModule
  { path: 'menu', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], loadChildren: () => import('./features/menu/menu.module').then(m => m.MenuModule) }, // Lazy loading the MenuModule
  { path: 'highscore', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], loadChildren: () => import('./features/highscore/highscore.module').then(m => m.HighscoreModule) }, // Lazy loading the HighscoreModule
  { path: 'users', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule) }, // Lazy loading the UsersModule
  { path: 'lobby', canMatch: [loadGuard], canActivate: [authGuard], canActivateChild: [canActivateChild], loadChildren: () => import('./features/lobby/lobby.module').then(m => m.LobbyModule) }, // Lazy loading the LobbyModule
  { path: 'QR', loadChildren: () => import('./features/qr-code/qr-code.module').then(m => m.QrCodeModule)}
]


@NgModule({
  declarations: [
    AppComponent,
    WaitingRoomComponent,
    WinnerComponent,
  ],
  imports: [
    GameModule,
    CommonModule,
    ChatsModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(appRoute),
    MatIconModule,
    HttpClientModule,
    CoreModule,
    ProfileModule,
    MenuModule,
    HighscoreModule,
    UsersModule,
    LobbyModule,
    LandingModule,
    QrCodeModule
  ],
  providers: [
		AppService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: ErrorHandlerInterceptor,
			multi: true,
		},		
	],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})

export class AppModule {}

export class AppRoutingModule {}