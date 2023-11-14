import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { User } from 'projects/models/user.interface';
import { ApiService } from 'projects/tools/src/lib/services/api.service';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'enviroments/environment.prod';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],

})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  subs$ = new Subject();
  apiUrl = environment.apiUrl + "/users/avatar/";
  constructor(private apiService: ApiService,
              private router: Router,
              private route: ActivatedRoute){}
  ngOnInit(): void {
    if (this.apiService.getUser()) {
      this.apiService.getUsers().pipe(
        takeUntil(this.subs$)
      ).subscribe(res => {
        this.users = res;
      });
    } else {
      this.router.navigate(['']);
    }
  }
  ngOnDestroy(): void {
    this.subs$.next(null);
    this.subs$.complete();
  }
  addFriend(userID: number) {
    this.apiService.addFriend(userID)
    .subscribe(res => {
      if (res.success)  {
        window.alert("Success!")
      }
    },
    error => {
      window.alert('Error: ' + error.error.message)
    })
  }
  blockUser(userID: number) {
    this.apiService.blockUser(userID)
    .subscribe(res => {
      if (res.success)  {
        window.alert('Success')
      }
    },
    error =>  {
      window.alert('Error: ' + error.error.message)
    })
  }
}