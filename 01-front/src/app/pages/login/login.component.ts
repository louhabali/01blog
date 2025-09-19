// src/app/login/login.component.ts (relevant parts)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router , RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // <-- use AuthService
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
// my login component logic
export class LoginComponent {
  errorMessage = '';
  formData = { email: '', password: '' };

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.auth.login(this.formData).subscribe({
      next: () => {
        // header will update because the signal was set in AuthService
        this.router.navigate(['/home']);
      },
      error: err => {
        this.errorMessage = err.status === 401 ? err.error?.message || 'Invalid credentials' : 'Something went wrong';
      }
    });
  }
}
