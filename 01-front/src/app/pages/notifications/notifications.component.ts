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
  constructor(private wsService: WebsocketService,private userservice: UserService) {}

  ngOnInit() {
    // suppose the logged-in user has id=1
     this.userservice.getCurrentUser().subscribe(user => {
      this.currentUserId = user.id;
   
      this.wsService.connect(this.currentUserId);
      this.notifications$ = this.wsService.getNotifications();
    });
  }
} 
