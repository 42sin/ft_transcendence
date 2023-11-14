import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HighscoreComponent } from './components/highscore.component';
// import { ProfileService } from './services/profile.service';
import { HighscoreRoutingModule } from './highscore-routing.module';

@NgModule({
  declarations: [
    HighscoreComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HighscoreRoutingModule
  ],
//   providers: [
//     profileService
//   ]
})

export class HighscoreModule { }
