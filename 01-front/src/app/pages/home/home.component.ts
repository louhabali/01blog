import { Component, OnInit, HostListener,ViewChild,ElementRef,AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { UsersComponent } from '../users/users.component';
import { Router } from '@angular/router';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
interface Post { 
  id: number; 
  title: string; 
  content: string; 
  imageUrl : string | null;
  videoUrl :string | null;
  authorName: string;
  authorId : number;
  createdAT : string | Date ;
  user: any ;
  likes : number; 
  avatar: string; 
  liked?: boolean;
  isEditing?: boolean; 
  originalTitle?: string;
  originalContent?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, UsersComponent,TimeAgoPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('postsPanel') postsPanel!: ElementRef;
  currentUserId!: number;
  isDarkMode: boolean = false;
  posts: Post[] = [];
  newPost: Partial<Post> = { title: '', content: '', likes: 0 };
  currentOffset = 0;
  limit = 10;
  loading = false;
  noMorePosts = false;

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
  toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
}
  fetchPosts() {
  if (this.loading || this.noMorePosts) return;

  this.loading = true;

  this.http
    .get<Post[]>(`http://localhost:8087/posts/all?currentUserId=${this.currentUserId}&offset=${this.currentOffset}&limit=${this.limit}`, 
      { withCredentials: true }
    )
    .subscribe({
      next: (posts) => {
        const formatted = posts.map(p => ({
          ...p,
          imageUrl: p.imageUrl ? `${p.imageUrl}` : null,
          videoUrl: p.videoUrl ? `${p.videoUrl}` : null,
        }));

        // Append to existing posts
        this.posts = [...this.posts, ...formatted];
        console.log("Fetched posts:", formatted);
        // If fewer than limit → no more posts
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

  // when near bottom:
  if (scrollTop + clientHeight >= scrollHeight - threshold && !this.loading && !this.noMorePosts) {
    this.fetchPosts();
  }
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
        this.posts.unshift(post);
        
        this.newPost = { title: '', content: '' };
        this.newMedia = null;
    
      },
      error: err => console.error('Error creating post', err)
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
      error: (err) => console.error('Error toggling like', err)
    });
  }

  deletePost(post: Post) {
  this.http.delete<Post[]>(`http://localhost:8087/posts/delete/${post.id}`, { withCredentials: true })
    .subscribe({
      next: () => {
        // Remove post locally without re-fetching
        this.posts = this.posts.filter(p => p.id !== post.id);
      },
      error: err => console.error("Error deleting post", err)
    });
}

  goTopostdetails(post: Post) {
     this.router.navigate([`/posts/${post.id}`]);
  }

  ///// REPORT 
  isReportModalOpen = false;
  reportData = {
  reason: '',
  description: '',
  postId: 0,
  reportedUserId: 0,
  reporterUserId: this.currentUserId
};

// Open the modal and store post info
reportPost(post: Post) {
  this.isReportModalOpen = true;
  this.reportData = {
    reason: '',
    description: '',
    postId: post.id,
    reportedUserId: post.authorId,
    reporterUserId: this.currentUserId
  };
}

// Close the modal
closeReportModal() {
  this.isReportModalOpen = false;
}

// Handle report submission
submitReport(event: Event) {
  event.preventDefault();

 const payload = {
  reporterUser: { id: this.currentUserId },
  reportedUser: { id: this.reportData.reportedUserId },
  post: { id: this.reportData.postId },
  reason: this.reportData.reason,
  description: this.reportData.description
};


  this.http.post('http://localhost:8087/reports/create', payload, { withCredentials: true })
    .subscribe({
      next: () => {
        alert('Report submitted successfully');
        this.closeReportModal();
      },
      error: (err) => {
        console.error('Error submitting report', err);
        alert('Failed to submit report');
      }
    });
}
}
