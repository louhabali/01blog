import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService, NotificationDTO } from '../../services/websocket.service';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
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
  
  constructor(private wsService: WebsocketService, private userService: UserService,private router: Router) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      console.log("user in notifications",user);
      this.currentUserId = user.id;

      // Connect WebSocket (fetch stored + listen live)
      //this.wsService.connect(this.currentUserId);

      // Subscribe to all notifications (stored + live)
      this.notifications$ = this.wsService.getNotifications();
    });
    
  }
    handleNotificationClick(n: any) {
      console.log("Notification clicked:", n);
    if (n.type === 'FOLLOW') {
      this.router.navigate(['/profile', n.actorId]); // or whatever field contains user id
    } else if (n.type === 'POST') {
      this.router.navigate(['/posts', n.postId]);
    }
  }
}
