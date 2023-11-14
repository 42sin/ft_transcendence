import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from 'projects/tools/src/lib/services/api.service';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   constructor(private router: Router, private apiService: ApiService) {}

//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
// 	const user = localStorage.getItem('user');
// 	if (user) {
// 		const user2 = JSON.parse(user);
// 		if (user2 && user2.token) {
// 			request = request.clone({
// 				setHeaders: {
// 					'Content-Type': 'application/json',
// 					Authorization: `JWT ${user2.token}`
// 				}
// 			});
// 		}
// 	}
//     return next.handle(request).pipe(
// 		tap(
// 			() => {},
// 	  (err: any) => {
// 		if (err instanceof HttpErrorResponse) {
// 			if (err.status !== 401) {
// 				return;
// 			}
// 			localStorage.clear()
// 			localStorage.removeItem('user');
// 			this.router.navigate(['/']);
// 		}
// 	  }));
//     }
// }


@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            localStorage.clear();
			localStorage.removeItem('user');
			this.router.navigate(['/']);
          }
        }
        return throwError(error);
      })
    );
  }
}