import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, GameResult } from 'projects/models/user.interface';
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
// import { environment } from 'enviroments/environment.prod';
import { environment } from 'enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private URL = `${environment.apiUrl}:${environment.port}`;
  private authState$ = new BehaviorSubject<Boolean>(false);
  private user: User | null = null
  private user$ = new BehaviorSubject<User | null>(this.user);
  constructor(private httpClient: HttpClient,
              private router: Router) {
                // console.log(this.URL)
                // console.log(`${this.URL}/auth/status`)
    lastValueFrom(this.httpClient.get<{ status: boolean, user: User}>(`${this.URL}/auth/status`,
      {withCredentials: true}))
      .then(res => {
        this.authState$.next(res.status);
      console.log(res.user)
        if (res.status) {
          this.user = res.user;
          this.user$.next(this.user);
          this.setUser(this.user);
		  const originalPath = this.router.url;
		  sessionStorage.setItem('originalPath', originalPath);
		  if (originalPath && originalPath != '/') {
			this.router.navigate([originalPath]);
			sessionStorage.removeItem('originalPath');
		  }
		  else 
          	this.router.navigate(['/menu']).then();
        }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  incrementWins(winner: string | null, opponent: string | null, score: string | null): Observable<{ success: boolean }> {
	const requestData = {
		'winner': winner,
		'opponent': opponent,
		'score': score
	}
    return this.httpClient.post<{ success: boolean }>(`${this.URL}/users/increment-wins`, requestData, {
      withCredentials: true
    });
  }
  incrementLosses(): Observable<{ success: boolean }> {
    return this.httpClient.post<{ success: boolean }>(`${this.URL}/users/increment-losses`, null, {
      withCredentials: true
    });
  }
  //from localstorage
  getMatchHistory(username: string): Observable<GameResult[]> {
    const url = `${this.URL}/users/${username}/match-history`; // Replace with your actual API endpoint

    return this.httpClient.get<GameResult[]>(url);
  }
  updateMatchHistory(win: boolean, opponentName: string|null, endScores: { player: number; opponent: number }): Observable<{ success: boolean }> {
    const requestData = {
      win,
      opponentName,
      endScores
    };
  
    return this.httpClient.post<{ success: boolean }>(`${this.URL}/users/update-match-history`, requestData, {
      withCredentials: true
    });
  }

  login(){
    console.log(`${this.URL}/auth/42/login`)
    return window.location.href = `http://${window.location.hostname}:3000/auth/42/login`
    // return this.httpClient.get<any>(`${this.URL}/auth/42/login`, {
    //   // headers,
    //   withCredentials: true
    // }).pipe(
    //   tap((value /*: AuthRes*/) => {
    //     console.log("WTF")
    //     if (value.success){
    //       this.authState$.next(true);
    //       this.user$.next(value.user);
    //     } else  {
    //       this.authState$.next(false)
    //     }
    //   })
    // )
  }
  setUser(user: User){
    localStorage.setItem('user', JSON.stringify(user))
  }

  //from localstorage
  getUser(){
    return JSON.parse(<string>localStorage.getItem('user'))
  }
  updateUser()  {
    const tempUser = this.user;
    lastValueFrom(this.httpClient.get<{ status: boolean, user: User}>(`${this.URL}/auth/status`,
      {withCredentials: true}))
      .then(res => {
        this.authState$.next(res.status);
      // console.log(res.user)
        if (res.status) {
          this.user = res.user;
          this.user$.next(this.user);
          this.setUser(this.user);
          if (tempUser) {
            this.router.navigate(['profile']).then();
          } else  {
            this.router.navigate(['']).then();
          }
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }
  authStatus() {
	lastValueFrom(this.httpClient.get<{ status: boolean, user: User}>(`${this.URL}/auth/status`,
	{withCredentials: true}))
	.then(res => {
	  this.authState$.next(res.status);
	// console.log(res.user)
	})
	.catch((error) => {
	})
  }
  logout(){
    this.httpClient.post<{success: boolean}>(`${this.URL}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap((res) => {
        this.user$.next(null)
        localStorage.removeItem('user');
      })
    ).subscribe(() => {
      this.router.navigate(['/']).then()
    })
  }
  getUsers(): Observable<User[]>{
    return this.httpClient.get<User[]>(`${this.URL}/users`,{
      withCredentials: true
    });
  }
  getMyProfile(): Observable<User>  {
    return this.httpClient.get<User>(`${this.URL}/users/me`, {
      withCredentials: true
    })
  }
  getAuthState(): Observable<Boolean>{
    return this.authState$.asObservable();
  }
  getUserObservable() {
    return this.user$.asObservable();
  }
  changeUsername(newUsername: string) {
    const body = {username: newUsername}
    return this.httpClient.post<{success: boolean}>(`${this.URL}/users/change-username`, body,{
      withCredentials: true
    });
  }
  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');

    return this.httpClient.post<{success: boolean}>(`${this.URL}/users/upload-avatar`, formData, {
     withCredentials: true
    });
   }
  addFriend(userID: number) {
    console.log('addFriend apiService, userID', userID)
    return this.httpClient.post<{success: boolean}>(`${this.URL}/users/add-friend/${userID}`, {}, {
      withCredentials: true
    })
  }
  acceptFriend(userID: number)  {
    return this.httpClient.post<{success: boolean}>(`${this.URL}/users/accept-friend/${userID}`, {}, {
      withCredentials: true
    })
  }
  getProfileByID(userID: number): Observable<User>  {
    return this.httpClient.get<User>(`${this.URL}/users/id/${userID}`, {
      withCredentials: true
    })
  }
  blockUser(userId: number) {
    return this.httpClient.post<{success: boolean}>(`${this.URL}/users/block/${userId}`, {}, {
      withCredentials: true
    })
  }
  //TODO remove friend
  /*
  **
  */

  generateQr(): Observable<Blob>  {
  console .log('apiService generate QR ')
  return this.httpClient.post<Blob>(`${this.URL}/auth/tfa/generate`, {},{
      withCredentials: true,
      responseType: 'blob' as 'json'
    })
  }

  tfaTurnOn(code: string)  {
    console.log('send QR code', code)
    return this.httpClient.post<{success: boolean}>(`${this.URL}/auth/tfa/turn-on`, {tfaCode: code}, {
      withCredentials: true
    })
  }
  tfaTurnOff()  {
    return this.httpClient.post<{success: boolean}>(`${this.URL}/auth/tfa/turn-off`, {}, {
      withCredentials: true
    })
  }
  tfaAuthenticate(code: string) {
    return this.httpClient.post<{success: boolean}>(`${this.URL}/auth/tfa/authenticate`, {tfaCode: code}, {
      withCredentials: true
    })
  }
  // userStatus(): Promise<boolean>  {
  //   try {
  //     const res = lastValueFrom(this.httpClient.get<{ status: boolean, user: User}>(`${this.URL}/auth/status`, {
  //         withCredentials: true
  //       })
  //     );
  //     return res.status``
  //   } catch (error) {
  //     console.log(error);
  //     return false
  //   }
}






