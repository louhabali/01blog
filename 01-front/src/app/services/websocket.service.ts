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
    
    const socket = new SockJS('http://localhost:8087/ws-notifications');
    console.log(7777777)
    this.stompClient = over(socket);
    
    this.stompClient.connect({}, () => {
      this.fetchStoredNotifications(userId);
      console.log('Connected to WebSocket!');

      // Subscribe to live notifications
      this.stompClient?.subscribe(`/user/queue/notifications`, (message) => {
        if (message.body) {
          console.log("notification is : ",message.body);
          
          const notif: NotificationDTO = JSON.parse(message.body);
          const current = this.notifications$.getValue();
          if (!current.some(n => n.id === notif.id)) {
            this.notifications$.next([notif, ...current]);
          }
        }
      });
    });

    
  }

  // Observable for the component
  getNotifications() {
    return this.notifications$.asObservable();
  }
  private storedFetched = false;
  // Fetch stored notifications from backend
  fetchStoredNotifications(userId: number) {
    if (this.storedFetched) return;
    this.storedFetched = true;

    this.http.get<NotificationDTO[]>(`http://localhost:8087/api/notifications/${userId}`)
      .subscribe(fetchedNotifs => {
        // dont show notifs that comes from you 
        console.log("fetchedNotifs",fetchedNotifs);
        fetchedNotifs = fetchedNotifs.filter(n => n.actorId !== userId);


        const current = this.notifications$.getValue();
        this.notifications$.next([...fetchedNotifs, ...current]); // prepend stored notifications
      });
  }
  markNotificationsAsSeen() {
    return this.http.post(`http://localhost:8087/api/notifications/mark-as-seen`, {});
  }
}
