// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// just getting the connected one
export class UserService {
  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`http://localhost:8087/users/me`, { withCredentials: true });
  }
toggleFollow(followerId: number, followingId: number) {
  return this.http.post<boolean>(
    `http://localhost:8087/subscriptions/toggle`,
    { followerId, followingId }, // send JSON body
    { withCredentials: true }
  );
}

getFollowersCount(userId: number) {
  return this.http.get<number>(`http://localhost:8087/subscriptions/followers/${userId}`, { withCredentials: true });
}

getFollowingCount(userId: number) {
  return this.http.get<number>(`http://localhost:8087/subscriptions/following/${userId}`, { withCredentials: true });
}
}
