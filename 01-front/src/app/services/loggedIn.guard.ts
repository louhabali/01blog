
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
// logged in logic
export class LoggedInGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.checkAuth().pipe(
      map(res => {
        if (res.loggedIn) {
          // Already logged in → redirect to home or dashboard
          return this.router.parseUrl('/home');
        } else {
          // Not logged in → allow access
          return true;
        }
      })
    );
  }
}
