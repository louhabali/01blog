import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';
import { BehaviorSubject } from 'rxjs';

export interface NotificationDTO {
  id: number;
  actorId: number;
  type: string;
  message: string;
  postId: number | null;
  createdAt: string;
  seen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private notifications$ = new BehaviorSubject<NotificationDTO[]>([]);

  connect(userId: number) {
    const socket = new SockJS('http://localhost:8087/ws-notifications');
    this.stompClient = over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket!');

      // Subscribe to private notifications for this user
      this.stompClient?.subscribe(`/user/${userId}/queue/notifications`, (message) => {
        if (message.body) {
          const notif: NotificationDTO = JSON.parse(message.body);
          const current = this.notifications$.getValue();
          this.notifications$.next([notif, ...current]); // prepend
        }
      });
    });
  }

  getNotifications() {
    return this.notifications$.asObservable();
  }
}
