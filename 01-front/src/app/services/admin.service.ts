import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = 'http://localhost:8087/admin'; // secured admin endpoints

  constructor(private http: HttpClient) {}

  // stats endpoint (implement server-side to return counts)
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/stats`, { withCredentials: true });
  }

  // users
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/users`, { withCredentials: true });
  }
  banUser(userId: number) { return this.http.put<any>(`${this.base}/users/${userId}/ban`, {}, { withCredentials: true }); }
  deleteUser(userId: number) { return this.http.delete(`${this.base}/users/${userId}`, { withCredentials: true }); }

  // posts
  getPosts() { return this.http.get<any[]>(`${this.base}/posts`, { withCredentials: true }); }
  deletePost(postId: number) { return this.http.delete(`${this.base}/posts/${postId}`, { withCredentials: true }); }
  toggleHidePost(postId: number) { return this.http.put<any>(`${this.base}/posts/${postId}/hide`, {}, { withCredentials: true }); }

  // reports
  getReports() { return this.http.get<any[]>(`${this.base}/reports`, { withCredentials: true }); }
  resolveReport(reportId: number) { return this.http.delete(`${this.base}/reports/${reportId}`, { withCredentials: true }); }
}
