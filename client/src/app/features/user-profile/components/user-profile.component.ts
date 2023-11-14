import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { User, GameResult } from 'projects/models/user.interface';
import { ApiService } from 'projects/tools/src/lib/services/api.service';
import { Subject, takeUntil, Subscription, Observable, forkJoin } from 'rxjs';
import { environment } from 'enviroments/environment.prod';
import { IntegerType } from 'typeorm';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy{
  authenticatedUserName: string = '';
  user: User | undefined;
  users: User[] = [];
  userID: string = '';
  username: string = '';
  foundName: string | undefined = '';
  foundAvatar: string | undefined = '';
  foundMail: string | undefined = '';
  foundUserID: number = 500;
	wins: number = 0;
	losses: number = 0;
	winPercentage: number = 0;
	lossPercentage: number = 0;
  matchHistory: GameResult[] = [];
  loaded: boolean = false;
  subs$ = new Subject();
  private routeSub: Subscription = new Subscription();
  apiUrl = environment.apiUrl + "/users/avatar/";
  constructor(private apiService: ApiService,
              private router: Router,
              private route: ActivatedRoute){}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
    this.userID = params['userID'] || '';
    this.username = params['userID'] || '';
    console.log('username', this.username);
    //   if (this.apiService.getMatchHistory(this.username)) {
    //     this.apiService.getMatchHistory(this.username).pipe(
    //       takeUntil(this.subs$)
    //     ).subscribe((matchHistory: GameResult[]) => {
    //       this.matchHistory = matchHistory;
    //     });
    //   }
      if (this.apiService.getUser()) {
        this.apiService.getUsers().pipe(
          takeUntil(this.subs$)
          ).subscribe(
            res => {
              this.users = res;
              this.getUserProfile();
              const matchingUser = this.users.find(user => user?.username.toLowerCase() === this.username.toLowerCase());
              if (matchingUser !== undefined) {
                this.user = matchingUser
                for (let j = 0; j < this.user?.gamesPlayed; j++) {
                  let newResult : GameResult = new GameResult(this.user?.gameWins[j], this.user?.opponents[j], this.user?.scores[j]);
                  this.matchHistory.push(newResult);
                }
                if (this.user.gamesPlayed > 0) {
                  this.loaded = true;
                }
                this.foundName = matchingUser.username;
                this.foundAvatar = matchingUser.avatar;
                this.foundMail = matchingUser.email;
                this.foundUserID = matchingUser.userID;
                const totalGames = this.user.gamesPlayed;
                this.winPercentage = (totalGames > 0) ? (this.user?.wins / totalGames) * 100 : 0;
              }
            },
            error => {
              console.error('Error fetching users:', error);
              this.router.navigate(['']);
            }
            );
      } else {
        this.router.navigate(['']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subs$.next(null);
    this.subs$.complete();
    this.routeSub.unsubscribe();
  }

  getUserProfile(): void{
    this.apiService.getMyProfile().pipe(
      takeUntil(this.subs$)
    ).subscribe(res => {
      this.authenticatedUserName = res.username
      console.log('authenticated User: ' + this.authenticatedUserName); // LOGGED USER

      const relations: Observable<User>[] = [];
      if (this.user?.friends && this.user?.friends.length > 0)  {
        const friends = this.user?.friends.map(id =>
          this.apiService.getProfileByID(id)
        );
        relations.push(...friends);
      }
      if (this.user?.pending && this.user?.pending.length > 0)  {
        const invites = this.user?.pending.map(id =>
          this.apiService.getProfileByID(id)
        );
        relations.push(...invites);
      }
      if (this.user?.blocked && this.user?.blocked.length > 0)  {
        const blocked = this.user?.blocked.map(id =>
          this.apiService.getProfileByID(id)
        );
        relations.push(...blocked);
      }
      console.log(this.user)
    });
  }

  addFriend(userID: number) {
    this.apiService.addFriend(userID).subscribe(
      res => {
        this.apiService.updateUser();
        if (res.success) {
          window.alert('Success!');
          this.getUserProfile();
        }
      },
      error => {
        window.alert('Error: ' + error.error.message);
      }
      );
    }

    blockUser(userID: number) {
      this.apiService.blockUser(userID)
      .subscribe(res => {
        this.apiService.updateUser();
        if (res.success)  {
          window.alert('Success')
          this.getUserProfile();
      }
    },
    error =>  {
      window.alert('Error: ' + error.error.message)
    })
  }

  isButtonVisible(): boolean {
    const hasUser = Boolean(this.user);
    const isSameUser = this.authenticatedUserName === this.foundName;
    return hasUser && isSameUser;
  }

  getLoaded(): boolean {
	return this.loaded;
  }

  generateHTMLForMatchHistory(): string {
	let html = '';

	for (let result of this.matchHistory) {
		html += `
		<li>
		  <span>${result.win ? 'VICTORY' : 'DEFEAT'}</span>
		  <span>${result.opponentName}</span>
		  <span>${result.endScores}</span>
    </li>
	  `;
	}
	return html;
  }

}