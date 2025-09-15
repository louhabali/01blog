import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


// import { Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    errorMessage = '';

  formData = { email: '', password: '' };
  constructor(private http: HttpClient, private router: Router) {}
  
  onSubmit() {
    this.errorMessage = '';
   

     console.log(this.http);
    this.http.post('http://localhost:8087/auth/login',this.formData).subscribe({
        next: (res: any) => {
        console.log('connection successed', res);
         this.router.navigate(['/']);
         console.log("rani jit mn spring login");
        },
        error: err => {
         if (err.status === 401) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Something went wrong, try again.';
        }
          
        }
      })
  }
}
