import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

interface MediaPreview {
  url: string | ArrayBuffer | null;
  isVideo: boolean;
}

interface Post {
  id: number;
  title: string;
  content: string;
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
export class PostdetailsComponent {
  @ViewChild('fileUploadInput') fileUploadInput!: ElementRef<HTMLInputElement>;

  post!: Post;
  currentUserId!: number;
  isDarkMode = false;
  errorResponse: any = {};
  errorMessage: string = '';
  showError: boolean = false;
  
  // State for the media slider
  currentMediaIndex: number = 0;
  
  // New media handling for editing
  newMedia: File[] = [];
  mediaPreviewUrls: MediaPreview[] = [];
  readonly MAX_MEDIA_COUNT = 3;
  readonly MAX_FILE_SIZE_MB = 20;

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private auth: AuthService,
    private toast: MatSnackBar
  ) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        if (!user.enabled) {
          this.auth.logout().subscribe(() => {
            this.router.navigate(['/login'])
            return;
          });
        }
        this.fetchPost();
      },
      error: (err) => {
        this.currentUserId = 0;
        this.fetchPost();
      }
    });
  }

  getMediaType(url: string): 'image' | 'video' | 'unknown' {
    if (url.match(/\.(jpeg|jpg|png|gif|webp||avif)$/i)) {
      return 'image';
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return 'video';
    }
    return 'unknown';
  }

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
          if (post.mediaUrls && !Array.isArray(post.mediaUrls)) {
            post.mediaUrls = [post.mediaUrls as any].filter(url => url);
          }
          this.post = post;
        },
        error: (err) => {
          if (err.status === 404 || err.status === 500) {
            this.router.navigate(['/404']);
          }
        }
      });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleLike(post: Post): void {
    if (this.currentUserId == 0) {
      this.auth.logout().subscribe();
      return;
    }
    this.postService.toggleLike(post.id).subscribe({
      next: (liked) => {
        post.likes += liked ? 1 : -1;
        post.liked = liked;
      },
      error: (err) => {
        if (err.status === 401 || err.status == 403) {
          this.auth.logout().subscribe();
        } else {
          console.error('Unexpected error:', err);
          this.toast.open(err.error || 'Failed to toggle like', "", {
            duration: 2000,
            horizontalPosition: "end",
            panelClass: "errorAction"
          });
        }
      }
    });
  }

  // Multi-file selection for editing
  onFileSelected(event: any) {
    const files: FileList | null = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const filesToAdd: File[] = [];
    let fileError = false;

    // Check total media count (existing + new)
    const totalMediaCount = (this.post.mediaUrls?.length || 0) + this.newMedia.length + files.length;
    if (totalMediaCount > this.MAX_MEDIA_COUNT) {
      this.errorMessage = `Maximum ${this.MAX_MEDIA_COUNT} media files allowed. You already have ${this.post.mediaUrls?.length || 0} files.`;
      fileError = true;
    }

    // Check each file
    for (let i = 0; i < files.length && !fileError; i++) {
      const file = files[i];
      
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
      this.toast.open(this.errorMessage, "", {
        duration: 2000,
        horizontalPosition: "end",
        panelClass: "errorAction"
      });
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

  // Remove a specific media item from new media previews
  cancelMediaPreview(index: number) {
    this.newMedia.splice(index, 1);
    this.mediaPreviewUrls.splice(index, 1);
    
    if (this.newMedia.length === 0 && this.fileUploadInput) {
      this.fileUploadInput.nativeElement.value = '';
    }
  }

  // Remove existing media item
  removeExistingMedia(index: number) {
    if (this.post.mediaUrls && this.post.mediaUrls.length > 0) {
      this.post.mediaUrls.splice(index, 1);
      // Reset current index if needed
      if (this.currentMediaIndex >= this.post.mediaUrls.length) {
        this.currentMediaIndex = Math.max(0, this.post.mediaUrls.length - 1);
      }
    }
  }

  editPost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    post.isEditing = true;
    post.originalTitle = post.title;
    post.originalContent = post.content;
    post.originalMediaUrls = post.mediaUrls ? [...post.mediaUrls] : null;
    
    // Reset new media arrays when starting edit
    this.newMedia = [];
    this.mediaPreviewUrls = [];
  }

  async savePost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();

    // Validate that there's at least some content
    if ((!post.title || post.title.trim() === '') && 
        (!post.content || post.content.trim() === '') && 
        (!post.mediaUrls || post.mediaUrls.length === 0) && 
        this.newMedia.length === 0) {
      this.toast.open('Post must contain a title/content or media.', "", {
        duration: 2000,
        horizontalPosition: "end",
        panelClass: "errorAction"
      });
      return;
    }

    // Upload new media files if any
    if (this.newMedia.length > 0) {
      const uploadObservables = this.newMedia.map(file => {
        const formData = new FormData();
        formData.append("file", file);
        return this.http.post("http://localhost:8087/api/media/upload", formData, { 
          responseType: 'text', 
          withCredentials: true 
        });
      });

      try {
        const mediaUrls = await forkJoin(uploadObservables).toPromise() as string[];
        
        // Combine existing media URLs with new ones
        const allMediaUrls = [
          ...(post.mediaUrls || []),
          ...mediaUrls
        ].slice(0, this.MAX_MEDIA_COUNT); // Ensure we don't exceed max

        this.updatePost(post, allMediaUrls);
      } catch (err: any) {
        this.toast.open(err.error || 'Media upload failed.', "", {
          duration: 2000,
          horizontalPosition: "end",
          panelClass: "errorAction"
        });
        return;
      }
    } else {
      // No new media, just update with existing media
      this.updatePost(post, post.mediaUrls || []);
    }
  }

  private updatePost(post: Post, mediaUrls: string[]) {
    this.http.put<Post>(`http://localhost:8087/posts/edit/${post.id}`, {
      title: post.title,
      content: post.content,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : null
    }, { withCredentials: true })
      .subscribe({
        next: (updated) => {
          this.toast.open('Updated successfully', "", {
            duration: 2000,
            horizontalPosition: "end",
            panelClass: "successAction",
          });
          
          post.title = updated.title;
          post.content = updated.content;
          post.mediaUrls = updated.mediaUrls;
          post.isEditing = false;
          post.originalTitle = undefined;
          post.originalContent = undefined;
          post.originalMediaUrls = undefined;
          
          // Clear new media arrays after successful save
          this.newMedia = [];
          this.mediaPreviewUrls = [];
          this.currentMediaIndex = 0;
          
          if (this.fileUploadInput) {
            this.fileUploadInput.nativeElement.value = '';
          }
        },
        error: (err) => {
          if (err.status === 400) {
            this.errorResponse = err.error;
            if (this.errorResponse.title && this.errorResponse.content) {
              this.errorMessage = 'Title and content are required';
            } else if (this.errorResponse.title) {
              this.errorMessage = this.errorResponse.title;
            } else if (this.errorResponse.content) {
              this.errorMessage = this.errorResponse.content;
            }
            this.toast.open(this.errorMessage, "", {
              duration: 2000,
              horizontalPosition: "end",
              panelClass: "errorAction",
            });
          } else {
            this.toast.open(err.error || 'Failed to update post', "", {
              duration: 2000,
              horizontalPosition: "end",
              panelClass: "errorAction",
            });
          }
        }
      });
  }

  cancelEdit(post: Post) {
    post.title = post.originalTitle || post.title;
    post.content = post.originalContent || post.content;
    post.mediaUrls = post.originalMediaUrls || post.mediaUrls;
    this.currentMediaIndex = 0;
    post.isEditing = false;
    
    // Clear new media arrays
    this.newMedia = [];
    this.mediaPreviewUrls = [];
    
    if (this.fileUploadInput) {
      this.fileUploadInput.nativeElement.value = '';
    }
  }

  deletePost(post: Post) {
    if (confirm("Are you sure you want to delete this post?")) {
      this.http.delete(`http://localhost:8087/posts/delete/${post.id}`, { withCredentials: true })
        .subscribe({
          next: () => {
            this.toast.open('Post deleted successfully', "", {
              duration: 2000,
              horizontalPosition: "end",
              panelClass: "successAction"
            });
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.toast.open(err.error || 'Failed to delete post', "", {
              duration: 2000,
              horizontalPosition: "end",
              panelClass: "errorAction"
            });
          }
        });
    }
  }


  stopEvent(event: MouseEvent) {
    event.stopPropagation();
  }

  goToComments(postId: number) {
    this.router.navigate([`/posts/${postId}/comments`]);
  }
}