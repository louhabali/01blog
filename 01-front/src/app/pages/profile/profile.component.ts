import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersComponent } from '../users/users.component';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';

interface Post { 
  id: number; 
  title: string; 
  content: string; 
  author: string;
  authorId : number;
  likes : number; 
  avatar?: string; 
  liked?: boolean;
  isEditing?: boolean; 
  originalTitle?: string;
  originalContent?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, UsersComponent, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUserId!: number;
  isDarkMode: boolean = false;
  posts: Post[] = [];
  numberOfposts!: number;
  user: any = { id: 0, username: '', email: '' };
  newPost: Partial<Post> = { title: '', content: '' };

  constructor(
    private http: HttpClient,
    private postService: PostService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Load current logged-in user
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        console.log('Logged-in user:', user);

        // Listen to profile ID changes
        this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          console.log('++++id is :', id);

          if (id) {
            this.loadProfile(id);
          }
        });
      }
    });
  }

  private loadProfile(id: string) {
    this.http.get(`http://localhost:8087/users/${id}`, { withCredentials: true })
      .subscribe(res => {
        this.user = res;
      });

    this.fetchPosts(id);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  fetchPosts(id: any) {
    id = Number(id);
    this.http
      .get<Post[]>(`http://localhost:8087/posts/all/${id}?currentUserId=${this.currentUserId}`, { withCredentials: true })
      .subscribe(posts => {
        console.log('++++ posts are : ', posts);
        this.posts = posts;
        this.numberOfposts = this.posts.length;
      });
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
        if (liked) {
          post.likes += 1;
        } else {
          post.likes -= 1;
        }
        post.liked = liked;
      },
      error: (err) => console.error('Error toggling like', err)
    });
  }

  enableEdit(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.posts.forEach(p => p.isEditing = false);
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
        error: (err) => console.error('Error updating post', err)
      });
  }

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

  stopEvent(event: MouseEvent) {
    event.stopPropagation();
  }

  deletePost(post: Post) {
    this.http.delete<Post[]>(`http://localhost:8087/posts/delete/${post.id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== post.id);
        },
        error: err => console.error('Error deleting post', err)
      });
  }

  reportPost(post: Post) {
    alert('Report post: ' + post.id);
  }

  goToComments(postId: number) {
    this.router.navigate([`/posts/${postId}/comments`]);
  }
}
