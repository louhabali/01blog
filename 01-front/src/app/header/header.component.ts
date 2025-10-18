  import { Component, OnInit } from '@angular/core';
  import { Router, NavigationEnd, RouterModule } from '@angular/router';
  import { AuthService } from '../services/auth.service';
  import { filter } from 'rxjs/operators';
  import { CommonModule } from '@angular/common';

  import { UserService } from '../services/user.service';
  import { WebsocketService,  } from '../services/websocket.service';
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
    showBadge = true; // <- control visibility
    notifsnumber: number = 0; // initialize with 0

    currentUserId!: number;
    avatarUrl: string = '';
    role: string = '';
    constructor(public wsService: WebsocketService,public auth: AuthService, private router: Router, private userService : UserService) {}

    ngOnInit() {
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          console.log("user in header",user);
          this.currentUserId = user.id;
          this.avatarUrl = user.avatar || 'default-avatar.png';
          this.role = user.role;

             //this.wsService.connect(this.currentUserId);

        // Subscribe to notifications to update the count live
        this.wsService.getNotifications().subscribe(notifs => {
          if (!this.showBadge) {
            this.notifsnumber = 0;
            return;
          }
          this.notifsnumber = notifs.filter(n => n.actorId!==this.currentUserId && !n.seen).length;
        });
          //this.wsService.connect(this.currentUserId);
          console.log("Logged-in user:", user);
        },
        error: (err) => {
          if (err.status === 401) {
            this.currentUserId = 0; // not logged in
            
          }
        }
      });
      
      
      this.auth.checkAuth().subscribe();
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) =>{
           if (!event.url.includes('/notifications')) {
          this.showBadge = true; // show badge again
        }
            this.auth.checkAuth().subscribe()
        } );

      // Subscribe to theme changes
     
    }
     hideBadge() {
    this.showBadge = false; // hide badge when clicked
    this.notifsnumber = 0;
    // here i want to send request to change seen state of notifs in backend
    this.wsService.markNotificationsAsSeen().subscribe({
      next: () => {
        console.log("Notifications marked as seen");    
      },
      error: (err) => {
        console.error("Failed to mark notifications as seen:", err);
      }
    });
   
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
  }
