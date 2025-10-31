import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id?: number;
  title: string;
  content: string;
  authorEmail?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
// our post services methods and fetching
export class PostService {

  constructor(private http: HttpClient) {}
  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>('http://localhost:8087/posts/create', post, { withCredentials: true });
  }
  getMyPosts(): Observable<Post[]> {
    return this.http.get<Post[]>('http://localhost:8087/posts/me', { withCredentials: true });
  }
   toggleLike(postId: number, userId: number): Observable<boolean> {
    return this.http.post<boolean>(`http://localhost:8087/interactions/like/${postId}/like?userId=${userId}`, {});
  }
}
