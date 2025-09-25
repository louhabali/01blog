import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService, NotificationDTO } from '../../services/websocket.service';
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

  constructor(private wsService: WebsocketService) {}

  ngOnInit() {
    // suppose the logged-in user has id=1
    this.wsService.connect(1);
    this.notifications$ = this.wsService.getNotifications();
  }
}
