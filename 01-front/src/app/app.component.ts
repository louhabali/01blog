import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {ActivatedRoute,Router,NavigationError } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderComponent } from './header/header.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { WebsocketService , NotificationDTO} from './services/websocket.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  isLoggedIn = false;
  email = '';
  notifId !: number;
  constructor(private auth: AuthService , private wsService :WebsocketService , private router: Router ,
    private http : HttpClient , private toast : MatSnackBar

   ) {
      this.router.events.subscribe(event => {
      if (event instanceof NavigationError) {
        // Redirect to not-found page for any navigation errors
        this.router.navigate(['/404']);
      }
    });
  }

  ngOnInit() {
    
    this.auth.getAuthCheckResult().subscribe((res: any) => {
      if (res.currentUserId){

        this.wsService.connect(res.currentUserId);
        const lastSeenNotifId = Number(localStorage.getItem("lastnotifid") || 0);
        
        this.wsService.getNotifications().subscribe(notifications => {
          if (notifications && notifications.length > 0) {
            const newestNotif = notifications[0]; 
            //console.log("new",newestNotif);
                  
                  if (newestNotif.id > lastSeenNotifId) {
                     this.showToast(newestNotif);
                  }
                  
                  // Update the 'lastnotifid' in localStorage after processing
                  localStorage.setItem("lastnotifid", String(newestNotif.id));
                }
              });
        this.isLoggedIn = res.loggedIn;
      }
      this.email = res.email || '';
    });
  }
  showToast(notif: NotificationDTO) {
      if (notif.sender == null){
        return;
      }
      let message = '';
      if (notif.type === 'FOLLOW') {
          message = `${notif.sender} started following you!`;
      } else if (notif.type === 'POST') {
          message = `${notif.sender} just posted new update`; // Assuming postTitle is in DTO
      } else {
          message = `New Notification: ${notif.type}`;
      }

      this.toast.open(message, "View", { 
          duration: 3000, 
          horizontalPosition: "end",
          verticalPosition: "bottom",
          panelClass: "successAction"
      }).onAction().subscribe(() => {
          this.handleNotificationClick(notif);
      });
  }

   handleNotificationClick(n: any) {
    //console.log("Notification clicked:", n);
    // coonvert n.id to number 
    this.notifId = Number(n.id);
    if (n.type === 'FOLLOW') {
      this.router.navigate(['/profile', n.actorId]); // or whatever field contains user id
    } else if (n.type === 'POST') {
      this.router.navigate(['/posts', n.postId]);
    }
      if (!n.seen) {
        this.http
          .post<{seen: boolean}>(`http://localhost:8087/api/notifications/mark-as-seen/${this.notifId}`, {}, { withCredentials: true }).subscribe({
            next: (seenobject) => {
              n.seen = seenobject.seen;
            },
            error: (err) => {
              if (err.status === 401 || err.status == 403){
                this.auth.logout().subscribe()
              }else if (err.status === 500) {
                 this.toast.open(err.error, "View", { 
                  duration: 2000, 
                  horizontalPosition: "end",
                  verticalPosition: "bottom",
                  panelClass: "errorAction"
      })
              }
                
              //console.error('Error marking notification as seen', err);
            }
          });
      }
    
  }
  logout() {
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    this.isLoggedIn = false;
    this.email = '';
  }
}
