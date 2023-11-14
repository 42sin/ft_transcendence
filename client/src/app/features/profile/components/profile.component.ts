import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'projects/models/user.interface';
import { ApiService } from 'projects/tools/src/lib/services/api.service';
import { Observable, forkJoin } from 'rxjs';
import { Subject, takeUntil} from 'rxjs'
import { Location } from '@angular/common';
import { ThemeService } from '../services/theme.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user!: User;
  selectedFile: File | undefined;
  subs$ = new Subject();
  newUsername: string = '';

  constructor(private route: ActivatedRoute,
              private apiService: ApiService,
              private router: Router,
              private themeService: ThemeService){}
  ngOnInit(): void {
    if (this.apiService.getUser())  {
      this.getUserProfile() 
    } else {
      this.router.navigate(['']);
    }
  }
  ngOnDestroy(): void{
    this.subs$.next(null);
    this.subs$.complete();
  }
  getUserProfile(): void{
    this.apiService.getMyProfile().pipe(
      takeUntil(this.subs$)
    ).subscribe(res => {
      this.user = res
      console.log(this.user)
      const relations: Observable<User>[] = [];
      if (this.user.friends && this.user.friends.length > 0)  {
        const friends = this.user.friends.map(id =>
          this.apiService.getProfileByID(id)
        );
        relations.push(...friends);
      }
      if (this.user.pending && this.user.pending.length > 0)  {
        const invites = this.user.pending.map(id =>
          this.apiService.getProfileByID(id)
        );
        relations.push(...invites);
      }
      if (this.user.blocked && this.user.blocked.length > 0)  {
        const blocked = this.user.blocked.map(id =>
          this.apiService.getProfileByID(id)
        );
        relations.push(...blocked);
      }
      forkJoin(relations).subscribe(users =>{
        this.user.friendProfiles = users.splice(0, this.user.friends.length);
        this.user.pendingProfiles = users.splice(0, this.user.pending.length);
        this.user.blockedProfiles = users.splice(0, this.user.blocked.length)
      })
      console.log(this.user)
    });
      
  }
  submitUsername() {
    console.log('new username', this.newUsername)
    this.apiService.changeUsername(this.newUsername)
    .subscribe(res => {
      this.apiService.updateUser();
      this.newUsername = '';
      if (res.success)  {
		window.location.reload();
        this.getUserProfile();
      }
    },
    error => {
      this.newUsername = '';
      window.alert('Error: ' + error)
    });

  }

  handleFileInput(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      // Display a preview of the selected image if needed
      this.previewImage(this.selectedFile);
    }
  }
  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  uploadAvatar(): void {
    if (this.selectedFile) 
    {
      this.apiService.uploadAvatar(this.selectedFile).subscribe(
        (res: any) => {
          if (res.success) {
            this.getUserProfile();
          }
        },
        error => {
          window.alert('Error: ' + error.error.message)
        }
      );
    }
  }
  acceptFriend(userID: number)  {
    this.apiService.acceptFriend(userID)
    .subscribe(res => {
      this.apiService.updateUser();
      if (res.success)  {
        window.alert('You have a new friend!')
        this.getUserProfile();
      }
    },
    error => {
      window.alert(error.error.message)
    }
    )
  }
  turnOnTfa() {
    this.router.navigate(['/QR'])
      .then( () =>  {
        this.getUserProfile();
      }
      )

  }
  turnOffTfa()  {
    this.apiService.tfaTurnOff()
      .subscribe( () =>  {
        this.apiService.updateUser();
        this.getUserProfile()
      },
      error => {
        console.log(error.error.message);
        window.alert(error.error.message)
      }) 
  }

  changeTheme(color: string) {
    this.themeService.setTheme(color);
  }
}