import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule, MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
// my register cmp
export class RegisterComponent {
  formData = { username: '', email: '', password: '' };
    errorMessage: string = '';
    showError: boolean = false;

 constructor(private http: HttpClient, private router: Router) {}
  onSubmit() {
     this.http.post('http://localhost:8087/auth/register', this.formData)
      .subscribe({
        next: (res: any) => {
        console.log('registration successed', res);
         this.router.navigate(['/login']);
         console.log("rani jit mn spring");
        },
        error: err => {
          if (err.status === 400) {
            console.error('Registration failed:', err.error);
            const errors = err.error;
    if (errors.username && errors.email) {
      this.errorMessage = errors.username;
    } else if (errors.username) {
      this.errorMessage = errors.username;
    } else if (errors.email) {
      this.errorMessage = errors.email;
    } else if (errors.password) {
      this.errorMessage = errors.password;
    } else {
      this.errorMessage = 'Registration failed due to unknown error.';
    }

    this.showError = true;
    setTimeout(() => this.showError = false, 3000);
  }
  }
      });
  }
}
