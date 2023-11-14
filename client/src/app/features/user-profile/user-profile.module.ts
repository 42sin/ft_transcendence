import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { ProfileService } from './services/profile.service';
import { UserProfileRoutingModule } from './users-profile-routing.module';
import { UserProfileComponent } from './components/user-profile.component';

@NgModule({
  declarations: [
    UserProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    UserProfileRoutingModule
  ],
//   providers: [
//     profileService
//   ]
})

export class UserProfileModule { }
