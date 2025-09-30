import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  connect(userId: number) {
    // Fetch stored notifications first
    this.fetchStoredNotifications(userId);

    const socket = new SockJS('http://localhost:8087/ws-notifications');
    this.stompClient = over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket!');

      // Subscribe to live notifications
      this.stompClient?.subscribe(`/topic/notifications`, (message) => {
        if (message.body) {
          console.log("notification is : ",message.body);
          
          const notif: NotificationDTO = JSON.parse(message.body);
          const current = this.notifications$.getValue();
          this.notifications$.next([notif, ...current]); // prepend live notification
        }
      });
    });
  }

  // Observable for the component
  getNotifications() {
    return this.notifications$.asObservable();
  }

  // Fetch stored notifications from backend
  fetchStoredNotifications(userId: number) {
    this.http.get<NotificationDTO[]>(`http://localhost:8087/api/notifications/${userId}`)
      .subscribe(fetchedNotifs => {
        const current = this.notifications$.getValue();
        this.notifications$.next([...fetchedNotifs, ...current]); // prepend stored notifications
      });
  }
}
