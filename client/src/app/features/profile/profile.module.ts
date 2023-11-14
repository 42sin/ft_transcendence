import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './components/profile.component';
// import { ProfileService } from './services/profile.service';
import { ProfileRoutingModule } from './profile-routing.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProfileRoutingModule,
    RouterModule
  ],
//   providers: [
//     profileService
//   ]
})

export class ProfileModule { }
