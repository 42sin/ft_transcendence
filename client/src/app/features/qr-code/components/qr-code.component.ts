import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { User } from 'projects/models/user.interface';
import { ApiService } from 'projects/tools/src/lib/services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.css']
})
export class QrCodeComponent implements OnInit, OnDestroy{
  fileUrl: SafeResourceUrl | null = null;
  codeValue: string = '';
  private sub$: Subscription = new Subscription();
  constructor(private apiService: ApiService,
              private domSanitizer: DomSanitizer,
              private router: Router){
  }
  ngOnInit(): void {
    console.log("qr component onInit")
    const user: User = this.apiService.getUser();
    console.log(user);
    if (user && !user.twoFact)  {
      this.generateQr(); 
    }
  }
  ngOnDestroy(): void {
   this.sub$.unsubscribe(); 
  }
  generateQr(): void{
    this.sub$.add(this.apiService.generateQr()
      .subscribe(
        (res: Blob) =>  {
          this.fileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(res));
        },
        (error) => {
          console.log(error);
        }      
      )
    )
  }

  submitCode(): void {
    if (this.apiService.getUser())  {
      this.apiService.tfaTurnOn(this.codeValue)
      .subscribe(
        res => {
          if (res.success)  {
            this.apiService.updateUser();
            // this.router.navigate(['/profile']).then()
          }
        },
        (error) =>  {
          console.log(error);
          window.alert(error.error.message)
        }
      )
    } else  {
      this.apiService.tfaAuthenticate(this.codeValue)
      .subscribe(
        res =>  {
          if (res.success)  {
            this.apiService.updateUser(); 
            // this.router.navigate(['/menu']).then()
          }
        },
        error => {
          console.log(error);
          window.alert(error.error.message);
        }
      ).add()
    }
      }
}

