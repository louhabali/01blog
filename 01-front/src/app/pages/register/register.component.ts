import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http'; 
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule,HttpClientModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  formData = { username: '', email: '', password: '' };
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
          console.error('register failed', err);
        }
      });
  }
}
