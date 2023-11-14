import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { tap } from 'rxjs/operators'

//TODO only works with chat component, wtf
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  // const auth = inject(ApiService);
  const user = localStorage.getItem('user')
  const router = inject(Router);

  console.log('AUTHGUARD user value:', user)
  if (user){
    return true;
  } else  {
    router.navigate(['/']);
    return false;
  }
  // auth.getAuthState().pipe(
  //   tap(value =>  {
  //     if (!value){
  //       router.navigate(['/']).then();
  //       return false;
  //     } else  {
  //       return true
  //     }
  //   })
  // )
};
export const loadGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const user = localStorage.getItem('user')

  console.log("LOAD GUARD", user)
  const router = inject(Router);
  if (user){
    return true;
  } else  {
    router.navigate(['/']);
    return false;
  }
};

export const canActivateChild: CanActivateChildFn = (
  route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => authGuard(route, state)