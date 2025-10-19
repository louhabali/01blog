import { Component, OnInit, HostListener ,ViewChild, ElementRef} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersComponent } from '../users/users.component';
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
  imageUrl : string | null;
  videoUrl :string | null;
  createdAT : string | Date;
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
  isFollowed?: boolean; // only for UI
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, UsersComponent, FormsModule,TimeAgoPipe,ReportModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
   @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  currentUserId!: number;
  isDarkMode = false;
  posts: Post[] = [];
  numberOfposts!: number;
  user: User = { id: 0, username: '', email: '' , avatar: '' };
  newPost: Partial<Post> = { title: '', content: '' };
   errorResponse: any = {};
errorMessage: string = '';
showError: boolean = false;
  constructor(
    private http: HttpClient,
    private postService: PostService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
  this.userService.getCurrentUser().subscribe({
    next: (user) => {
      // ✅ Logged-in user
      this.currentUserId = user.id;

      // When user is logged in, load the target profile
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) this.loadProfile(Number(id));
      });
    },
    error: (err) => {
      if (err.status === 401) {
        console.warn('Guest user browsing without login');
        // 👇 Guest mode — no current user
        this.currentUserId = 0;

        // Still load profile even as guest
        this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          if (id) this.loadProfile(Number(id));
        });
      } else {
        console.error('Unexpected error fetching user:', err);
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

      // Send request to backend
      this.http.post<{ avatarUrl: string }>(
        `http://localhost:8087/users/${this.currentUserId}/avatar`,
        formData,
        { withCredentials: true }
      ).subscribe({
        next: (res) => {
          // Update avatar locally
          console.log('Avatar uploaded successfully', res);
          
          this.user.avatar = res.avatarUrl;
        },
        error: (err) => {
          console.error('Error uploading avatar', err);
        }
      });
    }
  }
  private loadProfile(id: number) {
    // Load profile user data
    this.http.get<User>(`http://localhost:8087/users/${id}`, { withCredentials: true })
      .subscribe(profile => {
        this.user = profile;

        // Fetch follow status and counts
        if (this.user.id !== this.currentUserId) {
          this.userService.toggleFollow(this.currentUserId, this.user.id); // only toggle after click
          this.refreshFollowStatus();
        } else {
          // For own profile, counts still useful
          this.refreshFollowCounts();
        }
      });

    // Load posts
    this.fetchPosts(id);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleFollow() {
    if (!this.currentUserId || !this.user.id){
      this.router.navigate(['/login']);
      return;
    } 
      

    this.userService.toggleFollow(this.currentUserId, this.user.id).subscribe({
      next: (isNowFollowed) => {
        this.user.isFollowed = isNowFollowed;
        this.refreshFollowCounts();
      },
      error: err => console.error('Error toggling follow', err)
    });
  }

  private refreshFollowStatus() {
    this.userService.getFollowersCount(this.user.id).subscribe(count => this.user.followersCount = count);
    this.userService.getFollowingCount(this.user.id).subscribe(count => this.user.followingCount = count);

    // Check if current user follows this profile
    this.http.get<boolean>(
      `http://localhost:8087/subscriptions/status?followerId=${this.currentUserId}&followedId=${this.user.id}`,
      { withCredentials: true }
    ).subscribe(isFollowing => this.user.isFollowed = isFollowing);
  }

  private refreshFollowCounts() {
    this.userService.getFollowersCount(this.user.id).subscribe(count => this.user.followersCount = count);
    this.userService.getFollowingCount(this.user.id).subscribe(count => this.user.followingCount = count);
  }

  fetchPosts(userId: number) {
    const idParam = `currentUserId=${this.currentUserId}`;
    this.http.get<Post[]>(`http://localhost:8087/posts/user/${userId}?${idParam}`, { withCredentials: true })
      .subscribe({
        next: posts => {
          this.posts = posts;
          this.numberOfposts = posts.length;
        },
        error: err => console.error('Error fetching posts:', err)
      });
  }
newMedia: File | null = null;

onFileSelected(event: any) {
  this.newMedia = event.target.files[0];
  console.log("selected media is ",this.newMedia);
  
}

  submitPost() {
  if (this.newMedia) {
    const formData = new FormData();
    formData.append("file", this.newMedia);

    this.http.post("http://localhost:8087/api/media/upload", formData, { responseType: 'text' })
      .subscribe(url => {
  console.log("url media is ",url);

        this.createPost(url);
      });
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
        post.authorId = this.currentUserId;
        this.posts.unshift(post);
        this.newPost = { title: '', content: '' };
        this.newMedia = null;
      },
      error: err =>{
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

  enableEdit(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.posts.forEach(p => p.isEditing = false);
    post.originalTitle = post.title;
    post.originalContent = post.content;
    post.isEditing = true;
  }

  savePost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.http.put<Post>(`http://localhost:8087/posts/edit/${post.id}`, { title: post.title, content: post.content }, { withCredentials: true })
      .subscribe(updated => {
        post.title = updated.title;
        post.content = updated.content;
        post.isEditing = false;
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
    this.http.delete(`http://localhost:8087/posts/delete/${post.id}`, { withCredentials: true })
      .subscribe(() => this.posts = this.posts.filter(p => p.id !== post.id));
  }

  goToComments(postId: number) {
    this.router.navigate([`/posts/${postId}/comments`]);
  }
   goTopostdetails(post: Post) {
     this.router.navigate([`/posts/${post.id}`], { state: { post } });
  }
  isReportModalOpen = false;
selectedPostId = 0;
selectedReportedUserId = 0;

reportPost(post: Post) {
  this.isReportModalOpen = true;
  this.selectedPostId = post.id;
  this.selectedReportedUserId = post.authorId;
}

closeReportModal() {
  this.isReportModalOpen = false;
}
}
