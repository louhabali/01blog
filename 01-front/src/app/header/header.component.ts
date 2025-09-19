import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../services/theme.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
// this is my header component
export class HeaderComponent implements OnInit {
  menuActive = false;
  theme!: Theme;
  currentUserId!: number;
  constructor(public auth: AuthService, private router: Router, private themeService: ThemeService , private userService : UserService) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        console.log("Logged-in user:", user);
      },
      error: (err) => {
        console.error("Failed to fetch user:", err);
      }
    });
    this.auth.checkAuth().subscribe();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.auth.checkAuth().subscribe());

    // Subscribe to theme changes
    this.themeService.theme$.subscribe(t => this.theme = t);
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  closeMenu() {
    this.menuActive = false;
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/']);
      this.menuActive = false;
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
