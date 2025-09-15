import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] // ✅ corrected
})
export class HeaderComponent {
  isLoggedIn = false;
  menuActive = false; // track mobile menu state

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // Check authentication status on load
    this.auth.checkAuth()
      .pipe(tap(res => this.isLoggedIn = res.loggedIn))
      .subscribe();
  }

  // Toggle mobile menu
  toggleMenu(): void {
    this.menuActive = !this.menuActive;
  }

  // Close mobile menu after click
  closeMenu(): void {
    this.menuActive = false;
  }

  // Logout function
  logout(): void {
    this.auth.logout().subscribe(() => {
      this.isLoggedIn = false;
      this.closeMenu();
    });
  }
}
