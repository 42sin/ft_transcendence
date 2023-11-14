import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'projects/tools/src/lib/services/api.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy{
  constructor (private apiService: ApiService,
              private router: Router) {}
  ngOnInit(): void {
    if (!this.apiService.getUser()){
		this.router.navigate([''])
    }
	this.apiService.authStatus();
  }
  ngOnDestroy(): void {
  }
  logout()  {
    console.log('LOG OUT click')
    this.apiService.logout();
  }
}
