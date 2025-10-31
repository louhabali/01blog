import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './presntation.component.html',
  styleUrl: './presntation.component.css'
})
// just my static presentation of website
export class PresntationComponent {
   constructor(
    private userService: UserService,
    private router: Router,
    private auth : AuthService
  ) {
    this.userService.getCurrentUser().subscribe(
      {
      next: (user) => {

           if (!user.enabled) {
      
              this.auth.logout().subscribe(() => {
                  this.router.navigate(['/login'])
                  return;
              })
          }
      }
    }
    )
  }
  
}
