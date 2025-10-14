import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = 'http://localhost:8087/admin'; // secured admin endpoints

  constructor(private http: HttpClient) {}

  // ---------------- STATS ----------------
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/stats`, { withCredentials: true });
  }

  // ---------------- USERS ----------------
  getUsers(offset: number = 0, limit: number = 10): Observable<any[]> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<any[]>(`${this.base}/users`, { params, withCredentials: true });
  }

  banUser(userId: number): Observable<any> {
    return this.http.put<any>(`${this.base}/users/${userId}/ban`, {}, { withCredentials: true });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.base}/users/${userId}`, { withCredentials: true });
  }

  // ---------------- POSTS ----------------
  getPosts(offset: number = 0, limit: number = 10): Observable<any[]> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<any[]>(`${this.base}/posts`, { params, withCredentials: true });
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.base}/posts/${postId}`, { withCredentials: true });
  }

  toggleHidePost(postId: number): Observable<any> {
    return this.http.put<any>(`${this.base}/posts/${postId}/hide`, {}, { withCredentials: true });
  }

  // ---------------- REPORTS ----------------
  getReports(offset: number = 0, limit: number = 10): Observable<any[]> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<any[]>(`${this.base}/reports`, { params, withCredentials: true });
  }

  resolveReport(reportId: number): Observable<any> {
    return this.http.delete(`${this.base}/reports/${reportId}`, { withCredentials: true });
  }
}
