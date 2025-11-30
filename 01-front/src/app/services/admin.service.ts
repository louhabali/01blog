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
 getUsers(limit: number = 10, lastUserId: number | null = null): Observable<any[]> {
  let params = new HttpParams().set('limit', limit);
    
    // Set cursor parameter if provided
  if (lastUserId != null) {
   params = params.set('lastUserId', lastUserId.toString());
  }
    
  return this.http.get<any[]>(`${this.base}/users`, { params, withCredentials: true });
 }

 banUser(userId: number): Observable<any> {
  return this.http.put<any>(`${this.base}/users/${userId}/ban`, {}, { withCredentials: true });
 }

 deleteUser(userId: number): Observable<any> {
  return this.http.delete(`${this.base}/users/${userId}`, { withCredentials: true });
 }

 getPosts(
  limit: number = 10, 
  lastPostCreatedAt: string | null = null, 
  lastPostId: number | null = null
 ): Observable<any[]> {
    
  let params = new HttpParams().set('limit', limit);

    // Set cursor parameters if provided
  if (lastPostCreatedAt != null) {
   params = params.set('lastPostCreatedAt', lastPostCreatedAt);
  }
  if (lastPostId != null) {
   params = params.set('lastPostId', lastPostId.toString());
  }
    
  return this.http.get<any[]>(`${this.base}/posts`, { params, withCredentials: true });
 }

 deletePost(postId: number): Observable<any> {
  return this.http.delete(`${this.base}/posts/${postId}`, { withCredentials: true });
 }

 toggleHidePost(postId: number): Observable<any> {
  return this.http.put<any>(`${this.base}/posts/${postId}/hide`, {}, { withCredentials: true });
 }

 getReports(limit: number = 10, lastReportId: number | null = null): Observable<any[]> {
  let params = new HttpParams().set('limit', limit);
    
    // Set cursor parameter if provided
  if (lastReportId != null) {
   params = params.set('lastReportId', lastReportId.toString());
  }
    
  return this.http.get<any[]>(`${this.base}/reports`, { params, withCredentials: true });
 }

 resolveReport(reportId: number): Observable<any> {
  return this.http.delete(`${this.base}/reports/${reportId}`, { withCredentials: true });
 }
}