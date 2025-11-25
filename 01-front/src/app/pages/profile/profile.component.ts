import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { ReportModalComponent } from '../report-modal/report-modal.component';

interface Post {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorId: number;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAT: string | Date;
  likes: number;
  avatar?: string;
  liked?: boolean;
  isEditing?: boolean;
  originalTitle?: string;
  originalContent?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  followersCount?: number;
  followingCount?: number;
  isFollowed?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeAgoPipe, ReportModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('centerPanel') centerPanel!: ElementRef<HTMLDivElement>;
  
  // NEW: ViewChild for file input
  @ViewChild('fileUploadInput') fileUploadInput!: ElementRef<HTMLInputElement>;

  currentUserId!: number;
  isDarkMode = false;
  posts: Post[] = [];
  numberOfposts = 0;
  user: User = { id: 0, username: '', email: '', avatar: '' };
  newPost: Partial<Post> = { title: '', content: '' };
  errorResponse: any = {};
  errorMessage: string = '';
  showError = false;
  successMessage: string = '';
  followmessage: string = '';
  offset = 0;
  limit = 10;
  loading = false;
  noMorePosts = false;

  newMedia: File | null = null;
  
  // NEW: Property for preview URL
  mediaPreviewUrl: string | ArrayBuffer | null = null;
  isvideo : boolean = false;
  isReportModalOpen = false;
  selectedPostId = 0;
  selectedReportedUserId = 0;

  isDeleteConfirmOpen = false;
  postToDelete: Post | null = null;
  constructor(
    private http: HttpClient,
    private postService: PostService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private auth :AuthService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          // check if profile exists
       
          if (id) this.loadProfile(Number(id));
        });
      },
      error: (err) => {
        if (err.status === 401) {
          this.currentUserId = 0;
          this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) this.loadProfile(Number(id));
          });
        }
      }
    });
  }

  triggerAvatarUpload() {
    this.avatarInput.nativeElement.click();
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('avatar', file);

      this.http.post<{ avatarUrl: string }>(
        `http://localhost:8087/users/${this.currentUserId}/avatar`,
        formData,
        { withCredentials: true }
      ).subscribe({
        next: (res) => this.user.avatar = res.avatarUrl,
        error: (err) => console.error('Error uploading avatar', err)
      });
    }
  }

  private loadProfile(id: number) {
    // Reset pagination before loading
    this.offset = 0;
    this.noMorePosts = false;
    this.posts = [];

    this.http.get<User>(`http://localhost:8087/users/${id}`, { withCredentials: true })
      .subscribe(profile => {
        this.user = profile;
        if (this.user.id !== this.currentUserId) this.refreshFollowStatus();
        else this.refreshFollowCounts();
      });

    this.fetchPosts(id);
    this.refreshPostCount(id);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleFollow() {
    if (!this.currentUserId || !this.user.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.toggleFollow(this.currentUserId, this.user.id).subscribe({
      next: (isNowFollowed) => {
        this.user.isFollowed = isNowFollowed;
        if (this.user.isFollowed) {
          this.followmessage = 'You are now following ' + this.user.username;
          setTimeout(() => { this.followmessage = ''; }, 2000);
        }
        this.refreshFollowCounts();
      },
      error: err => console.error('Error toggling follow', err)
    });
  }

  private refreshFollowStatus() {
    this.userService.getFollowersCount(this.user.id).subscribe(count => this.user.followersCount = count);
    this.userService.getFollowingCount(this.user.id).subscribe(count => this.user.followingCount = count);

    this.http.get<boolean>(
      `http://localhost:8087/subscriptions/status?followerId=${this.currentUserId}&followedId=${this.user.id}`,
      { withCredentials: true }
    ).subscribe(isFollowing => this.user.isFollowed = isFollowing);
  }

  private refreshFollowCounts() {
    this.userService.getFollowersCount(this.user.id).subscribe(count => this.user.followersCount = count);
    this.userService.getFollowingCount(this.user.id).subscribe(count => this.user.followingCount = count);
  }

  private refreshPostCount(userId: number) {
    this.http.get<number>(`http://localhost:8087/posts/user/${userId}/count`, { withCredentials: true })
      .subscribe(count => this.numberOfposts = count);
  }

  fetchPosts(userId: number, append = false) {
    if (this.loading || this.noMorePosts) return;

    this.loading = true;
    const params = `currentUserId=${this.currentUserId}&offset=${this.offset}&limit=${this.limit}`;

    this.http.get<Post[]>(`http://localhost:8087/posts/user/${userId}?${params}`, { withCredentials: true })
      .subscribe({
        next: posts => {
          //console.log("profiel posssssssssss",posts);
          
          if (posts.length === 0) {
            this.noMorePosts = true;
          } else {
            if (append) this.posts = [...this.posts, ...posts];
            else this.posts = posts;
            this.offset += this.limit;
          }
          this.loading = false;
        },
        error: err => {
          console.error('Error fetching posts:', err);
          this.loading = false;
        }
      });
  }

ngAfterViewInit() {
  this.centerPanel.nativeElement.addEventListener('scroll', () => {
    const element = this.centerPanel.nativeElement;
    const scrollBottom = element.scrollTop + element.clientHeight;
    const threshold = element.scrollHeight - 150; // ✅ safe distance

    if (scrollBottom >= threshold && !this.loading && !this.noMorePosts) {
      this.fetchPosts(this.user.id, true);
    }
  });
}

  // UPDATED: Functionality from home.component.ts
  onFileSelected(event: any) {
    const file = event.target.files[0];
      
    if (file) {
      this.newMedia = file;
      //console.log("selected media is ", this.newMedia);

      // 3. Use FileReader to create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.mediaPreviewUrl = reader.result;
        this.isvideo = file.type.startsWith("video/");
      };
      reader.readAsDataURL(file);

    } else {
      // User cancelled the file dialog
      this.cancelMediaPreview();
    }
  }

  // NEW: Function from home.component.ts
  cancelMediaPreview() {
    this.newMedia = null;
    this.mediaPreviewUrl = null;
    
    // Reset the file input element
    if (this.fileUploadInput) {
      this.fileUploadInput.nativeElement.value = '';
    }
  }

  submitPost() {
    if (this.newMedia) {
      const formData = new FormData();
      formData.append("file", this.newMedia);
      this.http.post("http://localhost:8087/api/media/upload", formData, { responseType: 'text' })
        .subscribe(url => this.createPost(url));
    } else {
      this.createPost(null);
    }
  }

  createPost(mediaUrl: string | null) {
    const postPayload: any = {
      title: this.newPost.title,
      content: this.newPost.content,
      authorId: this.currentUserId
    };

    if (mediaUrl) {
      if (mediaUrl.endsWith(".mp4")) postPayload.videoUrl = mediaUrl;
      else postPayload.imageUrl = mediaUrl;
    }

    this.http.post<Post>('http://localhost:8087/posts/create', postPayload, { withCredentials: true })
      .subscribe({
        next: post => {
          this.successMessage = 'Post created successfully!';
          setTimeout(() => { this.successMessage = ''; }, 2000);
          post.authorId = this.currentUserId;
          // You might need to add authorName and avatar from the current user object
          post.authorName = this.user.username; 
          post.avatar = this.user.avatar;
           post.likes = post.likes || 0;
          post.liked = false;
          this.posts.unshift(post);
          this.newPost = { title: '', content: '' };
          
          // UPDATED: Reset the preview
          this.cancelMediaPreview(); 
          
          this.refreshPostCount(this.user.id); // Update total count
        },
        error: err => {
          if (err.status === 400) {
            this.errorResponse = err.error;
            if (this.errorResponse.title && this.errorResponse.content)
              this.errorMessage = 'Title and content are required';
            else if (this.errorResponse.title)
              this.errorMessage = this.errorResponse.title;
            else if (this.errorResponse.content)
              this.errorMessage = this.errorResponse.content;

            this.showError = true;
            setTimeout(() => (this.showError = false), 2000);
          } else {
            console.error('Unexpected error:', err);
          }
        }
      });
  }

  toggleLike(post: Post): void {
     if (this.currentUserId == 0){
        //console.log("liked btn")
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

  enableEdit(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.posts.forEach(p => p.isEditing = false);
    post.originalTitle = post.title;
    post.originalContent = post.content;
    post.isEditing = true;
  }

  savePost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.http.put<Post>(
      `http://localhost:8087/posts/edit/${post.id}`,
      { title: post.title, content: post.content },
      { withCredentials: true }
    ).subscribe(updated => {
      post.title = updated.title;
      post.content = updated.content;
      post.isEditing = false;
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
    this.router.navigate([`/posts/${post.id}`], { state: { post } });
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
    this.centerPanel.nativeElement.scrollTop = 0;
    this.successMessage = 'Report submitted successfully!';
    setTimeout(() => { this.successMessage = ''; }, 2000);
    this.isReportModalOpen = false;
  }
}