import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService, NotificationDTO } from '../../services/websocket.service';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';

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

  constructor(private wsService: WebsocketService, private userService: UserService) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUserId = user.id;

      // Connect WebSocket (fetch stored + listen live)
      this.wsService.connect(this.currentUserId);

      // Subscribe to all notifications (stored + live)
      this.notifications$ = this.wsService.getNotifications();
    });
  }
}
