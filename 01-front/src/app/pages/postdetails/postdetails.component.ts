import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersComponent } from '../users/users.component';
import { PostService } from '../../services/post.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
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
    createdAT : string | Date ;
  isEditing?: boolean; 
  originalTitle?: string;
  originalContent?: string;
  originalImage?: string | null;
  originalVideo?:string | null;
}

@Component({
  selector: 'app-postdetails',
  standalone: true,
  imports: [FormsModule, CommonModule, UsersComponent,TimeAgoPipe],
  templateUrl: './postdetails.component.html',
  styleUrls: ['./postdetails.component.css']
})
export class PostdetailsComponent {
  
  post!: Post;
  currentUserId!: number;
  isDarkMode = false;
  selectedMedia: File | null = null;
   errorResponse: any = {};
errorMessage: string = '';
showError: boolean = false;
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
        this.currentUserId = 0; // not logged in
        this.fetchPost();
        
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

    
   this.http.get<Post>(`http://localhost:8087/posts/${postId}?currentUserId=${this.currentUserId}`, { withCredentials: true })
  .subscribe({
    next: post => {
      this.post = post;
    },
    error: () => {} // redirect if not found
  });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleLike(post: Post): void {
    this.postService.toggleLike(post.id, this.currentUserId).subscribe({
      next: (liked) => {
        
        if (liked == true){
          post.likes += 1;
        }else {
          post.likes -= 1;
        }
        post.liked = liked;
      },
      error: (err) =>{
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }else {
          console.error('Unexpected error:', err);
        }
      } 
    });
  }
  changeMedia(post: Post) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e: any) => this.onMediaSelected(e, post);
    input.click();
  }

  onMediaSelected(event: any, post: Post) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedMedia = file;
    const formData = new FormData();
    formData.append("file", file);

    // 🔼 Upload to backend
    this.http.post("http://localhost:8087/api/media/upload", formData, { responseType: 'text' })
      .subscribe({
        next: (url) => {
          console.log("Uploaded media URL:", url);
          if (url.endsWith(".mp4")) {
            post.videoUrl = url;
            post.imageUrl = null; // reset image if new video
          } else {
            console.log("URL IS " , url);
            
            post.imageUrl = url;
            post.videoUrl = null; // reset video if new image
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
    post.originalImage = post.imageUrl;
    post.originalVideo = post.videoUrl;

  }

savePost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    console.log("IMAAAAAGE :",post.imageUrl);
    
    this.http.put<Post>(`http://localhost:8087/posts/edit/${post.id}`, {
      title: post.title,
      content: post.content,
      imageUrl : post.imageUrl,
      videoUrl : post.videoUrl
    }, { withCredentials: true })
    .subscribe({
      next: (updated) => {
        console.log(updated);
        
        post.title = updated.title;
        post.content = updated.content;
        post.imageUrl = updated.imageUrl;
        post.videoUrl = updated.videoUrl;
        post.isEditing = false;
        post.originalTitle = undefined;
        post.originalContent = undefined;
      },
      error: (err) =>{
         if (err.status === 400) {
          console.log("errror response is ",err.error);
           this.errorResponse = err.error;
        // 🧠 combine messages
        if (this.errorResponse.title && this.errorResponse.content) {
          this.errorMessage = 'Title and content are required';
        }else if (this.errorResponse.title) {
          this.errorMessage = this.errorResponse.title;
        }else if (this.errorResponse.content) {
          this.errorMessage = this.errorResponse.content;
        } 
        this.showError = true;
        setTimeout(() => {
          this.showError = false;
        }, 2000);
        }else {
          console.error('Unexpected error:', err);
        }
      }
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
