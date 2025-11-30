// src/app/login/login.component.ts (relevant parts)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router , RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // <-- use AuthService
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule, // <-- Add to imports
    MatInputModule,],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
// my login component logic
export class LoginComponent {
  errorMessage = '';
  formData = { email: '', password: '' };

  constructor(private auth: AuthService, private router: Router,private toast : MatSnackBar) {}
  showtoast(msg : string){
   this.toast.open(msg, "", {
    duration: 2000,
    horizontalPosition: "end",
    panelClass: "errorAction"
   });
 }
  onSubmit() {
    this.errorMessage = '';
    this.auth.login(this.formData).subscribe({
      next: (t) => {
        if (t.banned == true) {
          this.showtoast(`Your account has been banned, Try later.`)
         
          return;
        }
        // header will update because the signal was set in AuthService
        this.router.navigate(['/home']);
        setTimeout(() => {
          window.location.reload();
        }, 0);
      },
      error: err => {
        //console.log("error is : ",err);
        err.status === 401 ?  this.showtoast(`${err.error.message}`) :  this.showtoast(`something went wrong`);
      }
    });
  }
}
