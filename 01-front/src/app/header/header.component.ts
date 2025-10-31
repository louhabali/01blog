import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { WebsocketService } from '../services/websocket.service';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // <-- Import HttpClient
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule for ngModel

// --- Import Angular Material Modules for Search ---
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatDividerModule} from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field'; // <-- For search bar
import { MatInputModule } from '@angular/material/input'; // <-- For search bar
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'; // <-- For search "pop-up"

// --- User Interface (from your UsersComponent) ---
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
    FormsModule, // <-- Add to imports
    HttpClientModule, // <-- Add to imports
    MatToolbarModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule, // <-- Add to imports
    MatInputModule, // <-- Add to imports
    MatAutocompleteModule // <-- Add to imports
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isMobile = false;
  menuActive = false;
  showBadge = true;
  notifsnumber: number = 0;

  currentUserId!: number;
  avatarUrl: string = '';
  role: string = '';

  // --- Properties merged from UsersComponent ---
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';

  // --- New property for mobile search toggle ---
  mobileSearchActive: boolean = false;

  constructor(
    public wsService: WebsocketService,
    public auth: AuthService,
    private router: Router,
    private userService: UserService,
    private http: HttpClient // <-- Inject HttpClient
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    
    // --- Load current user details ---
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        console.log("user in header", user);
        this.currentUserId = user.id;
        this.avatarUrl = user.avatar || 'default-avatar.png';
        this.role = user.role;

        this.wsService.getNotifications().subscribe(notifs => {
          if (!this.showBadge) {
            this.notifsnumber = 0;
            return;
          }
          this.notifsnumber = notifs.filter(n => n.actorId !== this.currentUserId && !n.seen).length;
        });
        console.log("Logged-in user:", user);

      },
      error: (err) => {
        if (err.status === 401) {
          this.currentUserId = 0;
        }
      }
    });
    
    // --- Fetch all users for search (from UsersComponent) ---
    this.fetchUsers();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (!event.url.includes('/notifications')) {
          this.showBadge = true;
        }
      });
  }

  // --- Method from UsersComponent ---
  fetchUsers() {
    this.http.get<User[]>('http://localhost:8087/users', { withCredentials: true })
      .subscribe(users => {
        this.allUsers = users;
        // Initially, no users are filtered
        this.filteredUsers = []; 
      });
  }

  // --- Method from UsersComponent (slightly modified) ---
  filterUsers() {
    if (!this.searchQuery) {
      this.filteredUsers = [];
      return;
    }
    this.filteredUsers = this.allUsers.filter(u =>
      u.username.toLowerCase().includes(this.searchQuery)
    );
  }

  // --- New Method: Handle selection from autocomplete ---
  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const user: User = event.option.value;

    // Navigate to the user's profile
    this.router.navigate(['/profile', user.id]);

    // Clear the search bar and results
    this.searchQuery = '';
    this.filteredUsers = [];
    this.mobileSearchActive = false; // Close mobile search if open
  }

  // --- New Method: Toggle mobile search bar ---
  toggleMobileSearch(): void {
    this.mobileSearchActive = !this.mobileSearchActive;
    // If we're closing it, clear the search
    if (!this.mobileSearchActive) {
      this.searchQuery = '';
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

  hideBadge() {
    this.showBadge = false;
    this.notifsnumber = 0;
    this.wsService.markNotificationsAsSeen().subscribe({
      next: () => {
        console.log("Notifications marked as seen");
      },
      error: (err) => {
        console.error("Failed to mark notifications as seen:", err);
      }
    });
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  closeMenu() {
    this.menuActive = false;
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
      this.menuActive = false;
    });
  }
}