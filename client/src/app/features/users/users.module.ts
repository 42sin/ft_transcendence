import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersComponent } from './components/users.component';
// import { ProfileService } from './services/profile.service';
import { UsersRoutingModule } from './users-routing.module';

@NgModule({
  declarations: [
    UsersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    UsersRoutingModule
  ],
//   providers: [
//     profileService
//   ]
})

export class UsersModule { }
