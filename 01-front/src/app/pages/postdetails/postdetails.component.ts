import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersComponent } from '../users/users.component';
import { PostService } from '../../services/post.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';

interface Post { 
  id: number; 
  title: string; 
  content: string; 
  imageUrl : string | null;
  videoUrl :string | null;
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
  selector: 'app-postdetails',
  standalone: true,
  imports: [FormsModule, CommonModule, UsersComponent],
  templateUrl: './postdetails.component.html',
  styleUrls: ['./postdetails.component.css']
})
export class PostdetailsComponent {

  post!: Post;
  currentUserId!: number;
  isDarkMode = false;

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit() {
    // 1️⃣ Get current logged-in user
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.fetchPost();
      },
      error: (err) => {
        console.error("Failed to fetch user:", err);
        this.router.navigate(['/']);
      }
    });
  }

  fetchPost() {
    const postIdStr = this.route.snapshot.paramMap.get('id');
    if (!postIdStr) {
      this.router.navigate(['/']);
      return;
    }

    const postId = Number(postIdStr);

    // ✅ Fetch single post by ID (if API supports it)
    // this.http.get<Post>(`http://localhost:8087/posts/${postId}?currentUserId=${this.currentUserId}`, { withCredentials: true })
    //   .subscribe({
    //     next: (post) => {
    //       this.post = post;
    //     },
    //     error: (err) => {
    //       console.error("Failed to fetch post:", err);
    //       this.router.navigate(['/']);
    //     }
    //   });

    
    this.http.get<Post[]>(`http://localhost:8087/posts/all?currentUserId=${this.currentUserId}`, { withCredentials: true })
      .subscribe({
        next: posts => {
          this.post = posts.find(p => p.id === postId)!;
          if (!this.post) this.router.navigate(['/']);
        },
        error: () => this.router.navigate(['/'])
      });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleLike(post: Post) {
    this.postService.toggleLike(post.id, this.currentUserId).subscribe({
      next: (liked) => {
        post.likes += liked ? 1 : -1;
        post.liked = liked;
      },
      error: (err) => console.error('Error toggling like', err)
    });
  }

  editPost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    post.isEditing = true;
    post.originalTitle = post.title;
    post.originalContent = post.content;
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

  cancelEdit(post: Post) {
    post.title = post.originalTitle || post.title;
    post.content = post.originalContent || post.content;
    post.isEditing = false;
  }

  deletePost(post: Post) {
    if (confirm("Are you sure you want to delete this post?")) {
      // optionally: call API to delete
      this.router.navigate(['/']); // back to home
    }
  }

  reportPost(post: Post) {
    alert(`Reported post ${post.id}`);
  }

  stopEvent(event: MouseEvent) {
    event.stopPropagation();
  }

  goToComments(postId: number) {
    this.router.navigate([`/posts/${postId}/comments`]);
  }

  changePicture(post: Post) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => this.onImageChange(e, post);
    input.click();
  }

  onImageChange(event: any, post: Post) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => post.imageUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }
}
