import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable ,map} from 'rxjs';
interface LoginResponse {
  message: string;
  banned: boolean;
}
@Injectable({ providedIn: 'root' })
// changing state 
export class AuthService {
  // signal to track login state
  isLoggedIn = signal(false);
  private meUrl = 'http://localhost:8087/users/me';
  constructor(private http: HttpClient) {}

  checkAuth(): Observable<{ loggedIn: boolean , role: string}> {
    return this.http
      .get<{ loggedIn: boolean , role : string}>('http://localhost:8087/auth/check', { withCredentials: true })
      .pipe(
        tap(res => this.isLoggedIn.set(res.loggedIn))
      );
  }
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(this.meUrl, { withCredentials: true });
  }
  isAdmin(): Observable<boolean> {
    return this.getCurrentUser().pipe(map(u => !!u && (u.role === 'ADMIN' || u.role === 'ROLE_ADMIN')));
  } 

  login(data: { email: string; password: string }) {
    return this.http
      .post<LoginResponse>('http://localhost:8087/auth/login', data, { withCredentials: true })
      .pipe(
        tap((d) =>{
          if (!d.banned) {
            this.isLoggedIn.set(true)
          }
        } )
      );
  }

  logout() {
    return this.http
      .post('http://localhost:8087/auth/logout', {}, { withCredentials: true })
      .pipe(
        tap(() => this.isLoggedIn.set(false))
      );
  }
}
