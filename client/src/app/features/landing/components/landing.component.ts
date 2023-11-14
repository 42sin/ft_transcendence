import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'projects/models/user.interface';
import { ApiService } from 'projects/tools/src/lib/services/api.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  user: User | null = null;
  constructor( private apiService: ApiService,
              private router: Router){
              }
  login(){
    console.log('Landing LOGIN clicked')
    this.apiService.login()//.subscribe();
	this.apiService.authStatus();
  }
  ngOnInit(): void {
	this.apiService.authStatus();
    if (this.apiService.getUser()){
      this.router.navigate(['/menu'])
    }
  }
  ngOnDestroy(): void {
  }
}
