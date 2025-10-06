import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
// handling if he's alredy or not logged
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.checkAuth().pipe(
      map(res => {
        if (res.loggedIn) {
          // User is logged in, allow access
          return true;
        } else {
          // Not logged in, redirect to login
          console.log(111111111);
          
          return this.router.parseUrl('/login');
        }
      })
    );
  }
}
