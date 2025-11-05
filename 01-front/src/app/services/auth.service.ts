// auth.service.ts
import { Injectable, signal ,NgZone }from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs'; // <-- Import ReplaySubject
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
// Define your auth response interface
interface AuthCheckResponse {
  loggedIn: boolean;
  role: string;
  currentUserId: number;
}

  interface LoginResponse {
    message: string;
    banned: boolean;
  }

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signals are still great for your templates
  isLoggedIn = signal(false);
  currentUserId = signal<number | null>(null);
      private meUrl = 'http://localhost:8087/users/me';


  // This is the magic: A subject that holds the result of the *one* initial check
  private authCheckResult$ = new ReplaySubject<AuthCheckResponse>(1);

  constructor(private http: HttpClient,private router : Router ,private zone: NgZone) {
    // Run the check *immediately* when the service is created
    this.runInitialAuthCheck();
  }

  private runInitialAuthCheck(): void {
    this.http.get<AuthCheckResponse>('http://localhost:8087/auth/check', { withCredentials: true })
      .subscribe({
        next: (res) => {
          // Update signals
          this.isLoggedIn.set(res.loggedIn);
          this.currentUserId.set(res.currentUserId);
          // Broadcast the full result to all waiting subscribers
          this.authCheckResult$.next(res);
        },
        error: (err) => {
          // If the check fails, we are a guest
          this.isLoggedIn.set(false);
          this.currentUserId.set(null);

          // Broadcast the "guest" result
          this.authCheckResult$.next({ loggedIn: false, role: '', currentUserId: 0 });
        }
      });
  }

  /**
   * This is the new public method everyone will use.
   * It returns an observable that will *immediately* give the
   * cached auth status (or wait for it if the check isn't done).
   */
  public getAuthCheckResult(): Observable<AuthCheckResponse> {
    return this.authCheckResult$.asObservable();
  }

  // Your checkAuth() is no longer needed, but if you do keep it, 
  // just make it return this.getAuthCheckResult()

  // ... your login/logout methods ...
  // (Make sure login/logout also call this.authCheckResult$.next(...) 
  // to update the cached value!)

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
          tap(() =>{
            this.isLoggedIn.set(false);
            this.authCheckResult$.next({ loggedIn: false, role: '', currentUserId: 0 });
            this.router.navigate(["/login"]);
          })
        );
    }
}