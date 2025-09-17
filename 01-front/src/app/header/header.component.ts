import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../services/theme.service';

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

  constructor(public auth: AuthService, private router: Router, private themeService: ThemeService) {}

  ngOnInit() {
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
