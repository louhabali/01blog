import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { UsersComponent } from '../users/users.component';
import { Router } from '@angular/router';

interface Post { 
  id: number; 
  title: string; 
  content: string; 
  author: string; 
  avatar?: string; 
  liked?: boolean;
  isEditing?: boolean; 
  originalTitle?: string;
  originalContent?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, UsersComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUserId!: number;
  posts: Post[] = [];
  newPost: Partial<Post> = { title: '', content: '' };

  constructor(
    private http: HttpClient,
    private postService: PostService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        console.log("Logged-in user:", user);
        this.fetchPosts();
      },
      error: (err) => {
        console.error("Failed to fetch user:", err);
      }
    });
  }

  fetchPosts() {
    this.http
      .get<Post[]>(`http://localhost:8087/posts/all?currentUserId=${this.currentUserId}`, { withCredentials: true })
      .subscribe(posts => this.posts = posts);
  }

  submitPost() {
    const postPayload = {
      title: this.newPost.title,
      content: this.newPost.content,
      authorId: this.currentUserId
    };

    this.http.post<Post>('http://localhost:8087/posts/create', postPayload, { withCredentials: true })
      .subscribe({
        next: post => {
          this.posts.unshift(post);
          this.newPost = { title: '', content: '' };
        },
        error: err => console.error('Error creating post', err)
      });
  }

  toggleLike(post: Post): void {
    this.postService.toggleLike(post.id, this.currentUserId).subscribe({
      next: (liked) => {
        post.liked = liked;
      },
      error: (err) => console.error('Error toggling like', err)
    });
  }

  enableEdit(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    // Cancel other edits
    this.posts.forEach(p => p.isEditing = false);
    // Save original values
    post.originalTitle = post.title;
    post.originalContent = post.content;
    post.isEditing = true;
  }

  savePost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.http.put<Post>(`http://localhost:8087/posts/edit/${post.id}`, {
      title: post.title,
      content: post.content
    }, { withCredentials: true })
    .subscribe({
      next: (updated) => {
        post.title = updated.title;
        post.content = updated.content;
        post.isEditing = false;
        post.originalTitle = undefined;
        post.originalContent = undefined;
      },
      error: (err) => console.error("Error updating post", err)
    });
  }

  // Cancel editing if clicking outside and restore original content
  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.post-card')) {
      this.posts.forEach(p => {
        if (p.isEditing) {
          p.title = p.originalTitle || p.title;
          p.content = p.originalContent || p.content;
          p.isEditing = false;
        }
      });
    }
  }

  // Prevent outside click while interacting inside post
  stopEvent(event: MouseEvent) {
    event.stopPropagation();
  }

  deletePost(post: Post) { 
    alert('Delete post: ' + post.id); 
  }

  reportPost(post: Post) { 
    alert('Report post: ' + post.id); 
  }

  goToComments(postId: number) {
    this.router.navigate([`/posts/${postId}/comments`]);
  }
}
