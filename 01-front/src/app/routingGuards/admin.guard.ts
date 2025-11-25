import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.getAuthCheckResult().pipe(
      map(res => {
        // Check if logged in AND role is ADMIN
        if (res.loggedIn && res.role === 'ADMIN') {
          return true;
        } else {
          // If not admin, redirect to home or forbidden page
          return this.router.parseUrl('/home');
        }
      })
    );
  }
}
