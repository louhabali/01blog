import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],  // ✅ needed for routerLink + routerLinkActive
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menuActive = false;   // ✅ tracks mobile menu state

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    // initial login check
    this.auth.checkAuth().subscribe();

    // re-check login on navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.auth.checkAuth().subscribe());
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;   // ✅ open/close menu
  }

  closeMenu() {
    this.menuActive = false;              // ✅ close menu after clicking a link
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/']);
      this.menuActive = false; // ✅ also close menu after logout
    });
  }
}
