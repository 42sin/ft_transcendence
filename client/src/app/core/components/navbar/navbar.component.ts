import { Component } from '@angular/core';
import { User } from 'projects/models/user.interface';
import { ApiService } from 'projects/tools/src/lib/services/api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  icons = [
    {
      'src': 'assets/icons/nav-game-icon.svg',
      'alt': 'Game Nav Icon',
      'link': '/lobby',
    },
    {
      'src': 'assets/icons/nav-chat-icon.svg',
      'alt': 'Chat Nav Icon',
      'link': '/chats',
    },
    {
      'src': 'assets/icons/nav-highscore-icon.svg',
      'alt': 'Highscore Nav Icon',
      'link': '/highscore',
    },
    {
      'src': 'assets/icons/nav-users-icon.svg',
      'alt': 'Users Nav Icon',
      'link': '/users',
    },
    {
      'src': 'assets/icons/nav-profile-icon.svg',
      'alt': 'Profile Nav Icon',
      'link': '/profile',
    },
  ]

  // user: User | null;
  constructor (private apiService: ApiService){
    // this.user = this.apiService.getUser();  
  }
  //TODO tmp login
  login(){
    console.log('LOGIN clicked')
    this.apiService.login()//.subscribe();
  }
  
  logout()  {
    console.log('LOG OUT click')
    this.apiService.logout();
  }
}



// import { Component } from '@angular/core'
// import { AppService } from '../app.service';

// @Component ({
// 	selector: 'app-header',
// 	templateUrl: 'header.component.html',
// 	styleUrls: ['header.component.css']
// })
// export class HeaderComponent {

// 	readonly logoSrc: string = "../../assets/logo.png";

// 	readonly appService: AppService = new AppService;
// }
