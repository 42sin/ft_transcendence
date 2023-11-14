import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { User } from 'projects/models/user.interface';
import { ApiService } from 'projects/tools/src/lib/services/api.service';
import { Subject, takeUntil } from 'rxjs';
// import { environment } from 'enviroments/environment.prod';
import { environment } from 'enviroments/environment';


@Component({
  selector: 'app-highscore',
  templateUrl: './highscore.component.html',
  styleUrls: ['./highscore.component.css'],
})
export class HighscoreComponent implements OnInit, OnDestroy {
  users: User[] = [];
  subs$ = new Subject();
  apiUrl = environment.apiUrl + ':' + environment.port + "/users/avatar/";
  rankedUsers: { rank: number, user: User, score: number }[] = []; // New array to store ranked users with scores

  constructor(private apiService: ApiService,
              private router: Router,
              private route: ActivatedRoute){}

  ngOnInit(): void {
    if (this.apiService.getUser()) {
      this.apiService.getUsers().pipe(
        takeUntil(this.subs$)
      ).subscribe(res => {
        this.users = res;
        this.rankUsers();
      });
    } else {
      this.router.navigate(['']);
    }
  }

  ngOnDestroy(): void {
    this.subs$.next(null);
    this.subs$.complete();
  }

  private rankUsers(): void {
    // Calculate the score (wins - losses) for each user and sort the users by score (descending order)
    this.users.sort((a, b) => b.wins - a.wins);
  
    // Initialize the rank and rankCounter
    let rank = 1;
    let rankCounter = 1;
  
    // Create a new array with the rank, user, and score objects
    this.rankedUsers = this.users.map((user, index) => {
      if (index > 0 && user.wins !== (this.users[index - 1].wins)) {
        rank += rankCounter;
        rankCounter = 1;
      }
      return { rank, user, score: user.wins - user.loses };
    });
  }

  addFriend(userID: number) {
    this.apiService.addFriend(userID)
      .subscribe(res => {
        if (res.success) {
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
        if (res.success) {
          window.alert('Success')
        }
      },
      error => {
        window.alert('Error: ' + error.error.message)
      })
  }
}
