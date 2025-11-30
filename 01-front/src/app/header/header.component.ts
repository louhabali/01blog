import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


interface User { id: number; username: string; avatar?: string; }


@Component({
selector: 'app-header',
standalone: true,
imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, MatToolbarModule, MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
templateUrl: './header.component.html',
styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
isMobile = false;
menuActive = false;
currentUserId!: number;
avatarUrl = '';
role = '';
filteredUsers: User[] = [];
userSearchTerm = '';
private searchTerms = new Subject<string>();
private searchSubscription!: Subscription;
mobileSearchActive = false;


constructor(public auth: AuthService, private router: Router, private userService: UserService, private http: HttpClient) {}


ngOnInit() {
this.checkScreenSize();
this.userService.getCurrentUser().subscribe({
next: (u) => { this.currentUserId = u.id; this.avatarUrl = u.avatar || 'default-avatar.png'; this.role = u.role; },
error: () => { this.currentUserId = 0; }
});
this.searchSubscription = this.searchTerms.pipe(
debounceTime(300), distinctUntilChanged(), switchMap(term => term.trim() ? this.searchUsers(term) : of([])),
catchError(() => of([]))
).subscribe(users => this.filteredUsers = users);
}


ngOnDestroy() { if (this.searchSubscription) this.searchSubscription.unsubscribe(); }


search(term: string) { this.searchTerms.next(term); }


private searchUsers(term: string): Observable<User[]> {
return this.http.get<User[]>(`http://localhost:8087/users/search?name=${term}`, { withCredentials: true });
}


onUserSelected(user: User) {
this.router.navigate(['/profile', user.id]);
this.userSearchTerm = '';
this.filteredUsers = [];
this.mobileSearchActive = false;
}


toggleMobileSearch() {
this.mobileSearchActive = !this.mobileSearchActive;
if (!this.mobileSearchActive) { this.userSearchTerm = ''; this.filteredUsers = []; }
}


checkScreenSize() { this.isMobile = window.innerWidth < 768; }


@HostListener('window:resize') onResize() { this.checkScreenSize(); }


logout() { this.auth.logout().subscribe(() => this.menuActive = false); }
}