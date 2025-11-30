import { Component, HostListener, OnInit } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { AuthService } from '../../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
interface Post {
  id: number;
  title: string;
  content: string;
  // MODIFIED: Consolidate media into an array for slideshow support
  mediaUrls: string[] | null; 
  author: string;
  authorId: number;
  likes: number;
  avatar?: string;
  liked?: boolean;
  createdAT: string | Date;
  isEditing?: boolean;
  originalTitle?: string;
  originalContent?: string;
  originalMediaUrls?: string[] | null;
}

@Component({
  selector: 'app-postdetails',
  standalone: true,
  imports: [FormsModule, CommonModule, TimeAgoPipe, RouterModule],
  templateUrl: './postdetails.component.html',
  styleUrls: ['./postdetails.component.css']
})
export class PostdetailsComponent implements OnInit { 

  post!: Post;
  currentUserId!: number;
  isDarkMode = false;
  selectedMedia: File | null = null;
  errorResponse: any = {};
  errorMessage: string = '';
  showError: boolean = false;
  
  // State for the media slider
  currentMediaIndex: number = 0; 

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService ,
    private auth : AuthService,
    private toast : MatSnackBar
  ) {}

  ngOnInit() {
    // 1️⃣ Get current logged-in user
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        if (!user.enabled) {
          this.auth.logout().subscribe(() => {
              this.router.navigate(['/login'])
              return;
          })
          };
        this.fetchPost();
      },
      error: (err) => {
        this.currentUserId = 0; // not logged in
        this.fetchPost();
      }
    });
  }

  // Helper to determine media type
  getMediaType(url: string): 'image' | 'video' | 'unknown' {
    if (url.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
        return 'image';
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return 'video';
    }
    return 'unknown';
  }

  // Navigation for the media slider
  nextMedia() {
    if (this.post.mediaUrls && this.post.mediaUrls.length > 1) {
      this.currentMediaIndex = (this.currentMediaIndex + 1) % this.post.mediaUrls.length;
    }
  }

  prevMedia() {
    if (this.post.mediaUrls && this.post.mediaUrls.length > 1) {
      this.currentMediaIndex = (this.currentMediaIndex - 1 + this.post.mediaUrls.length) % this.post.mediaUrls.length;
    }
  }
  
  fetchPost() {
    const postIdStr = this.route.snapshot.paramMap.get('id');
    if (!postIdStr) {
      this.router.navigate(['/']);
      return;
    }

    const postId = Number(postIdStr);

    this.http.get<Post>(`http://localhost:8087/posts/${postId}?currentUserId=${this.currentUserId}`, { withCredentials: true })
      .subscribe({
        next: post => {
          // NOTE: Assuming backend returns media as mediaUrls: string[]
          if (post.mediaUrls && !Array.isArray(post.mediaUrls)) {
            post.mediaUrls = [post.mediaUrls as any].filter(url => url); 
          }
          this.post = post;
        },
        error: (err) => {
          if (err.status === 404 || err.status === 500){
            this.router.navigate(['/404']); // redirect if error
          }
          
        }
      });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleLike(post: Post): void {
     if (this.currentUserId == 0){
          this.auth.logout().subscribe()
          return
    }
    this.postService.toggleLike(post.id).subscribe({
      next: (liked) => {
        post.likes += liked ? 1 : -1;
        post.liked = liked;
      },
      error: (err) => {
        if (err.status === 401 || err.status == 403){
          this.auth.logout().subscribe()
        }else console.error('Unexpected error:', err);
      }
    });
  }
  
  // Modified: changeMedia signature remains the same, implementation doesn't need to change.
  changeMedia(post: Post) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e: any) => this.onMediaSelected(e, post);
    input.click();
  }

  // 🛠️ CORRECTED LOGIC: Update array element at currentMediaIndex
  onMediaSelected(event: any, post: Post) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedMedia = file;
    const formData = new FormData();
    formData.append("file", file);
    
    // IMPORTANT: Ensure mediaUrls is an array before attempting to update it.
    if (!post.mediaUrls || post.mediaUrls.length === 0) {
        post.mediaUrls = ['']; // Initialize with a placeholder if it's null/empty
        this.currentMediaIndex = 0;
    }

    // 🔼 Upload to backend
    this.http.post("http://localhost:8087/api/media/upload", formData, { responseType: 'text' })
      .subscribe({
        next: (url) => {
          // 🚀 FIX: Replace the item at the current index only
          if (post.mediaUrls) {
            post.mediaUrls[this.currentMediaIndex] = url;
            // Trigger change detection manually if needed (often not necessary in Angular, 
            // but good practice when mutating arrays directly):
            post.mediaUrls = [...post.mediaUrls]; 
          }
        },
        error: (err) => console.error("Error uploading media", err)
      });
  }
  
  editPost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    post.isEditing = true;
    post.originalTitle = post.title;
    post.originalContent = post.content;
    post.originalMediaUrls = post.mediaUrls ? [...post.mediaUrls] : null; 
  }

  savePost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();

    // Pass mediaUrls array
    this.http.put<Post>(`http://localhost:8087/posts/edit/${post.id}`, {
      title: post.title,
      content: post.content,
      mediaUrls: post.mediaUrls 
    }, { withCredentials: true })
      .subscribe({
        next: (updated) => {
           this.toast.open(`updated successfully`,"",{
          duration : 2000,
          horizontalPosition : "end",
          panelClass : "successAction",
        
         })
          post.title = updated.title;
          post.content = updated.content;
          post.mediaUrls = updated.mediaUrls;
          post.isEditing = false;
          post.originalTitle = undefined;
          post.originalContent = undefined;
          post.originalMediaUrls = undefined;
        },
        error: (err) => {
          if (err.status === 400) {
            this.errorResponse = err.error;
            // 🧠 combine messages
            if (this.errorResponse.title && this.errorResponse.content) {
              this.errorMessage = 'Title and content are required';
            } else if (this.errorResponse.title) {
              this.errorMessage = this.errorResponse.title;
            } else if (this.errorResponse.content) {
              this.errorMessage = this.errorResponse.content;
            }
            this.toast.open(`${this.errorMessage }`,"",{
          duration : 2000,
          horizontalPosition : "end",
          panelClass : "errorAction",
        
         })
          } else {
            console.error('Unexpected error:', err);
          }
        }
      });
  }

  cancelEdit(post: Post) {
    post.title = post.originalTitle || post.title;
    post.content = post.originalContent || post.content;
    // Restore original media array
    post.mediaUrls = post.originalMediaUrls || post.mediaUrls;
    this.currentMediaIndex = 0;
    post.isEditing = false;
  }

  deletePost(post: Post) {
    if (confirm("Are you sure you want to delete this post?")) {
      // Logic for delete (e.g., call API)
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
}