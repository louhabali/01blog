import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService, NotificationDTO } from '../../services/websocket.service';
import { UserService } from '../../services/user.service';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications$!: Observable<NotificationDTO[]>;
  currentUserId!: number;

  constructor(private wsService: WebsocketService, private userService: UserService,private router: Router,
    private auth : AuthService
  ) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      //console.log("user in notifications",user);
      this.currentUserId = user.id;
      if (!user.enabled) {
          this.auth.logout().subscribe(() => {
              this.router.navigate(['/login'])
        
              return;
          })
          };
      // Connect WebSocket (fetch stored + listen live)
      //this.wsService.connect(this.currentUserId);

      // Subscribe to all notifications (stored + live)
      // i want if a notif is duplicated , i want to show the last one wahci has the closest created at to now
      
        this.notifications$ = this.wsService.getNotifications().pipe(
          map((notifications: NotificationDTO[]) => {
          const map = new Map<string, NotificationDTO>();

          notifications.forEach(n => {
          const key = `${n.actorId}-${n.type}${n.createdAt}`;
          const existing = map.get(key);
          // Keep the latest one
          if (!existing || new Date(n.createdAt) > new Date(existing.createdAt)) {
            map.set(key, n);
          }
          });
          return Array.from(map.values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); 
          })
        );
     

    });
    
  }
    handleNotificationClick(n: any) {
      //console.log("Notification clicked:", n);
    if (n.type === 'FOLLOW') {
      this.router.navigate(['/profile', n.actorId]); // or whatever field contains user id
    } else if (n.type === 'POST') {
      this.router.navigate(['/posts', n.postId]);
    }
  }
}
