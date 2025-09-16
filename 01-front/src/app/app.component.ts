import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './header/header.component';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  isLoggedIn = false;
  email = '';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.checkAuth().subscribe((res: any) => {
      this.isLoggedIn = res.loggedIn;
      this.email = res.email || '';
    });
  }

  logout() {
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    this.isLoggedIn = false;
    this.email = '';
  }
}
