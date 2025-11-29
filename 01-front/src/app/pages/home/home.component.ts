import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { ReportModalComponent } from '../report-modal/report-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs'; // Import forkJoin for parallel uploads

interface MediaPreview {
  url: string | ArrayBuffer | null;
  isVideo: boolean;
}

interface Post {
  id: number;
  title: string;
  content: string;
  // MODIFIED: MediaUrls array
  mediaUrls: string[] | null; 
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
  userIdLoaded = false;
  banned !: boolean;
  isDarkMode: boolean = false;
  posts: Post[] = [];
  newPost: Partial<Post> = { title: '', content: '', likes: 0 };
  limit = 10;
  loading = false;
  noMorePosts = false;
  
  // Error handling
  errorResponse: any = {};
  successMessage: string = '';
  errorMessage: string = '';
  showError: boolean = false;

  // MODIFIED: Media handling now uses arrays
  newMedia: File[] = [];
  mediaPreviewUrls: MediaPreview[] = [];
  readonly MAX_MEDIA_COUNT = 3;
  readonly MAX_FILE_SIZE_MB = 200;

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
    private auth: AuthService,
    private zone: NgZone,
    private toast: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.userIdLoaded = true;
        this.banned = user.enabled;
        if (!this.banned) {
          this.auth.logout().subscribe(() => {
            this.router.navigate(['/login'])
            return;
          })
        }

      },
      error: (err) => {

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
    const lastPost = this.posts.length > 0 ? this.posts[this.posts.length - 1] : null;

    const lastPostCreatedAt = lastPost ? new Date(lastPost.createdAT).toISOString() : null;
    const lastPostId = lastPost ? lastPost.id : null;

    let url = `http://localhost:8087/posts/all?${idParam}limit=${this.limit}`;

    if (lastPostCreatedAt !== null) {
      url += `&lastPostCreatedAt=${lastPostCreatedAt}`;
      url += `&lastPostId=${lastPostId}`;
    }
    this.http
      .get<Post[]>(url, { withCredentials: true })
      .subscribe({
        next: (posts) => {
          const formatted = posts.map(p => ({
            ...p,
            mediaUrls: (p.mediaUrls && Array.isArray(p.mediaUrls)) 
                       ? p.mediaUrls.map(url => `${url}`) 
                       : null,
          }));

          this.posts = [...this.posts, ...formatted];

          if (posts.length < this.limit) {
            this.noMorePosts = true;
          }

          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching posts', err.error);
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

  // NEW: Helper to determine media type
  getMediaType(url: string): 'image' | 'video' | 'unknown' {
    if (url.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
        return 'image';
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return 'video';
    }
    return 'unknown';
  }


  // MODIFIED: Handles multi-file selection
  onFileSelected(event: any) {
    const files: FileList | null = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const filesToAdd: File[] = [];
    let fileError = false;

    // Check files for limits and size
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (this.newMedia.length + filesToAdd.length >= this.MAX_MEDIA_COUNT) {
        this.errorMessage = `You can only upload a maximum of ${this.MAX_MEDIA_COUNT} files.`;
        fileError = true;
        break; 
      }

      // Check size
      if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
        this.errorMessage = `File size exceeds ${this.MAX_FILE_SIZE_MB}MB limit for file: ${file.name}.`;
        fileError = true;
        break; 
      }

      filesToAdd.push(file);
    }
    
    if (this.fileUploadInput) {
      this.fileUploadInput.nativeElement.value = '';
    }

    if (fileError) {
      this.showError = true;
      setTimeout(() => { this.showError = false; }, 2000);
      return; 
    }

    // Add valid files and generate previews
    filesToAdd.forEach(file => {
      this.newMedia.push(file);
      const isVideo = file.type.startsWith("video/");
      const reader = new FileReader();
      reader.onload = () => {
        this.mediaPreviewUrls.push({ url: reader.result, isVideo: isVideo });
      };
      reader.readAsDataURL(file);
    });
  }


  // MODIFIED: Removes a specific media item by index
  cancelMediaPreview(index: number) {
    this.newMedia.splice(index, 1);
    this.mediaPreviewUrls.splice(index, 1);
    
    if (this.newMedia.length === 0 && this.fileUploadInput) {
      this.fileUploadInput.nativeElement.value = '';
    }
  }

  // MODIFIED: Handles parallel media uploads
  submitPost() {
    this.showError = false; 

    if (this.newMedia.length > 0) {
      const uploadObservables = this.newMedia.map(file => {
        const formData = new FormData();
        formData.append("file", file);
        return this.http.post("http://localhost:8087/api/media/upload", formData, { responseType: 'text', withCredentials: true });
      });

      forkJoin(uploadObservables).subscribe({
        next: (mediaUrls: string[]) => {
          this.createPost(mediaUrls); 
        },
        error: (err) => {
          console.error("Media upload failed", err);
          this.errorMessage = "Media upload failed. Please check file formats and size.";
          this.showError = true;
          setTimeout(() => { this.showError = false; }, 3000);
        }
      });
    } else {
      this.createPost([]); 
    }

  }

  // MODIFIED: Accepts an array of media URLs
  createPost(mediaUrls: string[] | null) {

    const postPayload: any = {
      title: this.newPost.title,
      content: this.newPost.content,
      authorId: this.currentUserId,
      createdAt: new Date(),
      mediaUrls: mediaUrls && mediaUrls.length > 0 ? mediaUrls : null
    };

    if (mediaUrls === null && (!postPayload.title || postPayload.title.trim() === '') && (!postPayload.content || postPayload.content.trim() === '')) {
      this.errorMessage = 'Post must contain a title/content or media.';
      this.showError = true;
      setTimeout(() => { this.showError = false; }, 2000);
      return;
    }


    this.http.post<Post>('http://localhost:8087/posts/create', postPayload, { withCredentials: true })
      .subscribe({
        next: post => {
          this.toast.open("Post created successfully", "", {
            duration: 2000,
            horizontalPosition: "end",
            panelClass: "successAction"

          })
          post.authorId = this.currentUserId;
          post.avatar = post.user.avatar;
          post.authorName = post.user.username;
          post.likes = post.likes || 0;
          post.liked = false;
          post.mediaUrls = postPayload.mediaUrls; 
          this.posts.unshift(post);
          this.newPost = { title: '', content: '' };
          this.newMedia = []; 
          this.mediaPreviewUrls = []; 
          this.fileUploadInput.nativeElement.value = ''; // Clear file input element value
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
            this.auth.logout().subscribe();
          } else {
            console.error('Unexpected error:', err);
          }
        }
      });
  }

  toggleLike(post: Post): void {
    if (this.currentUserId == 0) {

      this.auth.logout().subscribe()
      return
    }
    this.postService.toggleLike(post.id).subscribe({
      next: (liked) => {
        post.likes += liked ? 1 : -1;
        post.liked = liked;
      },
      error: (err) => {
        if (err.status === 401 || err.status == 403) {
          this.auth.logout().subscribe()
        } else console.error('Unexpected error:', err);
      }
    });
  }

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

  cancelReportModal() {
    this.isReportModalOpen = false;
  }
  hideReportModal() {
    this.toast.open("report sent successfully", "", {
      duration: 2000,
      horizontalPosition: "end",

    })
    setTimeout(() => { this.successMessage = ''; }, 2000);
    this.isReportModalOpen = false;
  }
}