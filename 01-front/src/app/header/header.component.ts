import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
// Removed specific RxJS operators (debounceTime, distinctUntilChanged, switchMap, catchError)
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
// Removed Subject and Subscription, kept Observable and of
import { Observable, of } from 'rxjs'; 
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
currentUserId !: number;
avatarUrl = '';
role = '';
filteredUsers: User[] = [];
userSearchTerm = '';
private searchTimer: any; // Holds the ID for the setTimeout debouncer
mobileSearchActive = false;


constructor(public auth: AuthService, private router: Router, private userService: UserService, private http: HttpClient) {}


ngOnInit() {
this.checkScreenSize();
this.userService.getCurrentUser().subscribe({
next: (u) => { this.currentUserId = u.id; this.avatarUrl = u.avatar || 'default-avatar.png'; this.role = u.role; },
error: () => { this.currentUserId = 0; }
});

}
ngOnDestroy() { 
    if (this.searchTimer) {
        clearTimeout(this.searchTimer);
    }
}


search(term: string) {
    // 1. Clear any pending search timer
    if (this.searchTimer) {
        clearTimeout(this.searchTimer);
    }

    const trimmedTerm = term.trim();
    
    // 2. Clear results if the term is empty
    if (!trimmedTerm) {
        this.filteredUsers = [];
        return;
    }

    // 3. Set a new timer to execute the search after 300ms
    this.searchTimer = setTimeout(() => {
        this.executeSearch(trimmedTerm);
    }, 300);
}

// NEW: Helper method to subscribe to the search Observable
private executeSearch(term: string): void {
    this.searchUsers(term).subscribe({
        next: users => this.filteredUsers = users,
        error: err => {
            //console.error("Search failed:", err);
            this.filteredUsers = []; // Clear results on API error
        }
    });
}

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