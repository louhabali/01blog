import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
// 🛑 Changed imports for dynamic search
import { filter, debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { NotificationDTO, WebsocketService } from '../services/websocket.service';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms'; 
import { Observable, Subject, Subscription, of } from 'rxjs'; // 🛑 New RxJS imports

// --- Import Angular Material Modules for Search ---
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'; 


// --- User Interface ---
interface User {
 id: number;
 username: string;
 email: string;
 avatar?: string;
}

@Component({
 selector: 'app-header',
 standalone: true,
 imports: [
  CommonModule,
  RouterModule,
  FormsModule,
  HttpClientModule,
  MatToolbarModule,
  MatButtonModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatFormFieldModule,
  MatInputModule,
  MatAutocompleteModule
 ],
 templateUrl: './header.component.html',
 styleUrls: ['./header.component.css']
})
// 🛑 Implement OnDestroy to clean up the subscription
export class HeaderComponent implements OnInit, OnDestroy {
 isMobile = false;
 menuActive = false;
 currentUserId!: number;
 avatarUrl: string = '';
 role: string = '';

 // 🛑 Removed 'allUsers' - we no longer fetch all users
 filteredUsers: User[] = [];
 
 // 🛑 Use a public property bound to ngModel in the template
 public userSearchTerm: string = '';
 
 // 🛑 The Subject acts as a stream for search term changes
 private searchTerms = new Subject<string>();
 private searchSubscription!: Subscription;

 mobileSearchActive: boolean = false;
 
 constructor(
  public wsService: WebsocketService,
  public auth: AuthService,
  private router: Router,
  private userService: UserService,
  private http: HttpClient ,

 ) { }

 ngOnInit() {
  
  this.checkScreenSize();
  this.userService.getCurrentUser().subscribe({
   next: (user) => {
    this.currentUserId = user.id;
    this.avatarUrl = user.avatar || 'default-avatar.png';
    this.role = user.role;
    
  },
  error: (err) => {
   if (err.status === 401) {
    this.currentUserId = 0;
   }
  }
 });
    
    // 🛑 START search stream setup
    this.setupSearchStream();
 }
    
 ngOnDestroy(): void {
  // 🛑 Clean up the subscription to prevent memory leaks
  if (this.searchSubscription) {
   this.searchSubscription.unsubscribe();
  }
 }

 private setupSearchStream(): void {
  this.searchSubscription = this.searchTerms.pipe(
   // Wait for 300ms pause after each keystroke
   debounceTime(300), 
   // Ignore if the search term is the same as the previous one
   distinctUntilChanged(), 
   switchMap((term: string) => {
    return term.trim() ? this.searchUsers(term) : of([]);
   }),
      catchError(error => {
          console.error('Error during search:', error);
          return of([]); 
      })
  ).subscribe(users => {
   this.filteredUsers = users;
  });
 }
 public search(term: string): void {
  this.searchTerms.next(term);
 }
 private searchUsers(term: string): Observable<User[]> {
  return this.http.get<User[]>(`http://localhost:8087/users/search?name=${term}`, { withCredentials: true });
 }

 onUserSelected(event: MatAutocompleteSelectedEvent): void {
  const user: User = event.option.value;
  this.router.navigate(['/profile', user.id]);
  this.userSearchTerm = '';
  this.filteredUsers = [];
  this.mobileSearchActive = false; 
 }
 toggleMobileSearch(): void {
  this.mobileSearchActive = !this.mobileSearchActive;
  if (!this.mobileSearchActive) {
   this.userSearchTerm = '';
   this.filteredUsers = [];
  }
 }

 checkScreenSize() {
  if (typeof window !== 'undefined') {
   this.isMobile = window.innerWidth < 768;
  }
 }

 @HostListener('window:resize')
 onResize() {
  this.checkScreenSize();
 }


 toggleMenu() {
  this.menuActive = !this.menuActive;
 }

 closeMenu() {
  this.menuActive = false;
 }

 logout() {
  this.auth.logout().subscribe(() => {
   this.menuActive = false;
  });
 }
}