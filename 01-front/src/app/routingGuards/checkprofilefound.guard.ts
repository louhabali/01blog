import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class Checkprofilefound implements CanActivate {

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const id = route.paramMap.get('id'); // assuming your route has /posts/:postId
    if (!id) {
      this.router.navigate(['/not-found']);
      return of(false);
    }

    return this.http.get(`http://localhost:8087/users/${id}`, { withCredentials: true }).pipe(
      map(() => true), 
      catchError(err => {
        if (err.status === 404) {
          this.router.navigate(['/not-found']);
        } else if (err.status === 401 || err.status === 403) {
          this.auth.logout().subscribe();
        } else {
          console.error('Unexpected error:', err);
        }
        return of(false); // block navigation
      })
    );
  }
}
