import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // signal to track login state
  isLoggedIn = signal(false);

  constructor(private http: HttpClient) {}

  checkAuth(): Observable<{ loggedIn: boolean }> {
    return this.http
      .get<{ loggedIn: boolean }>('http://localhost:8087/auth/check', { withCredentials: true })
      .pipe(
        tap(res => this.isLoggedIn.set(res.loggedIn))
      );
  }

  login(data: { email: string; password: string }) {
    return this.http
      .post('http://localhost:8087/auth/login', data, { withCredentials: true })
      .pipe(
        tap(() => this.isLoggedIn.set(true))
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
