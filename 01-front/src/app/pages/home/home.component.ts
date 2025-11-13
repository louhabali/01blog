import { Component, OnInit, ViewChild, ElementRef, AfterViewInit,NgZone  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { ReportModalComponent } from '../report-modal/report-modal.component';

interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  authorName: string;
  authorId: number;
  createdAT: string | Date;
  user: any;
  appropriate: boolean;
  likes: number;
  avatar: string;
  liked?: boolean;
  isEditing?: boolean;
  originalTitle?: string;
  originalContent?: string;
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, TimeAgoPipe, ReportModalComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('postsPanel') postsPanel!: ElementRef;
  @ViewChild('fileUploadInput') fileUploadInput!: ElementRef<HTMLInputElement>;

  currentUserId!: number;
  banned !: boolean;
  isDarkMode: boolean = false;
  posts: Post[] = [];
  newPost: Partial<Post> = { title: '', content: '', likes: 0 };
  currentOffset = 0;
  limit = 10;
  loading = false;
  noMorePosts = false;

  // Error handling
  errorResponse: any = {};
  errorMessage: string = '';
  showError: boolean = false;

  // Media handling
  newMedia: File | null = null;
  mediaPreviewUrl: string | ArrayBuffer | null = null;

  // Report modal
  isReportModalOpen = false;
  selectedPostId = 0;
  selectedReportedUserId = 0;

  // Delete confirmation modal
  isDeleteConfirmOpen = false;
  postToDelete: Post | null = null;

  constructor(
    private http: HttpClient,
    private postService: PostService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private auth : AuthService,
    private zone : NgZone
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.banned = user.enabled;
           if (!this.banned) {
          //console.log("aaaaaaaaaaaaaa")
          this.auth.logout().subscribe(() => {
              this.router.navigate(['/login'])
              return;
          })
    }
        
       
      },
      error: (err) => {
        console.log("hhhhhhhhhhhhhhh",err.status)
        if (err.status === 401) {
          this.currentUserId = 0; // not logged in
          
        }
      }
    });
  }

  fetchPosts() {
    
    if (this.loading || this.noMorePosts) return;

    this.loading = true;
    const idParam = this.currentUserId ? `currentUserId=${this.currentUserId}&` : '';
    this.http
      .get<Post[]>(`http://localhost:8087/posts/all?${idParam}offset=${this.currentOffset}&limit=${this.limit}`,
        { withCredentials: true })
      .subscribe({
        next: (posts) => {
          const formatted = posts.map(p => ({
            ...p,
            imageUrl: p.imageUrl ? `${p.imageUrl}` : null,
            videoUrl: p.videoUrl ? `${p.videoUrl}` : null,
          }));

          this.posts = [...this.posts, ...formatted];
          console.log("Fetched posts:", formatted);

          if (posts.length < this.limit) {
            this.noMorePosts = true;
          } else {
            this.currentOffset += this.limit;
          }

          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading posts:', err);
          this.loading = false;
        }
      });
  }

  ngAfterViewInit() {
    this.fetchPosts();
    this.postsPanel.nativeElement.addEventListener('scroll', () => {
      this.handleScroll();
    });
  }

  handleScroll() {
    const element = this.postsPanel.nativeElement;
    const threshold = 200; // pixels before reaching bottom

    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - threshold && !this.loading && !this.noMorePosts) {
      this.fetchPosts();
    }
  }
  isvideo : boolean = false;
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newMedia = file;
      const reader = new FileReader();
      reader.onload = () => { 
        this.mediaPreviewUrl = reader.result; 
        this.isvideo = file.type.startsWith("video/");
      };
      reader.readAsDataURL(file);
    } else {
      this.cancelMediaPreview();
    }
  }

  cancelMediaPreview() {
    this.newMedia = null;
    this.mediaPreviewUrl = null;
    if (this.fileUploadInput) {
      this.fileUploadInput.nativeElement.value = '';
    }
  }

  submitPost() {
    if (this.newMedia) {
      const formData = new FormData();
      formData.append("file", this.newMedia);

      this.http.post("http://localhost:8087/api/media/upload", formData, { responseType: 'text' ,withCredentials:true})
        .subscribe(url => { this.createPost(url); });
    } else {
      this.createPost(null);
    }
  }

  createPost(mediaUrl: string | null) {
    // check if user is banned
    
    const postPayload: any = {
      title: this.newPost.title,
      content: this.newPost.content,
      authorId: this.currentUserId,
      createdAt: new Date()
    };

    if (mediaUrl) {
      if (mediaUrl.endsWith(".mp4")) postPayload.videoUrl = mediaUrl;
      else postPayload.imageUrl = mediaUrl;
    }

    this.http.post<Post>('http://localhost:8087/posts/create', postPayload, { withCredentials: true })
      .subscribe({
        next: post => {
          post.authorId = this.currentUserId;
          post.authorName = post.user.username;
          post.likes = post.likes || 0;
          post.liked = false;
          this.posts.unshift(post);
          this.newPost = { title: '', content: '' };
          this.cancelMediaPreview();
        },
        error: err => {
          if (err.status === 400) {
            this.errorResponse = err.error;
            if (this.errorResponse.title && this.errorResponse.content) this.errorMessage = 'Title and content are required';
            else if (this.errorResponse.title) this.errorMessage = this.errorResponse.title;
            else if (this.errorResponse.content) this.errorMessage = this.errorResponse.content;

            this.showError = true;
            setTimeout(() => { this.showError = false; }, 2000);
          } else if (err.status === 401 || err.status === 403) {
            this.router.navigate(["/login"]);
          } else {
            console.error('Unexpected error:', err);
          }
        }
      });
  }

  toggleLike(post: Post): void {
    if (this.currentUserId == 0){
        console.log("liked btn")
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

  // ✅ Delete Confirmation Logic
  confirmDelete(post: Post) {
    this.postToDelete = post;
    this.isDeleteConfirmOpen = true;
  }
  
  cancelDelete() {
    this.postToDelete = null;
    this.isDeleteConfirmOpen = false;
  }
  
  proceedDelete() {
    if (!this.postToDelete) return;
 

    this.http.delete(`http://localhost:8087/posts/delete/${this.postToDelete.id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== this.postToDelete!.id);
          this.cancelDelete();
        },
        error: err => {
          console.error("Error deleting post", err);
          this.cancelDelete();
        }
      });
  }

  goTopostdetails(post: Post) {
    this.router.navigate([`/posts/${post.id}`]);
  }

  reportPost(post: Post) {
    this.isReportModalOpen = true;
    this.selectedPostId = post.id;
    this.selectedReportedUserId = post.authorId;
  }

  closeReportModal() {
    this.isReportModalOpen = false;
  }
}
