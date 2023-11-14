import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from './components/menu.component';
// import { ProfileService } from './services/profile.service';
import { MenuRoutingModule } from './menu-routing.module';

@NgModule({
  declarations: [
    MenuComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MenuRoutingModule
  ],
//   providers: [
//     profileService
//   ]
})

export class MenuModule { }
