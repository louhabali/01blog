import { Component, OnInit, HostListener,ViewChild,ElementRef,AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { Router ,ActivatedRoute } from '@angular/router';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { ReportModalComponent } from '../report-modal/report-modal.component';

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
  appropriate: boolean;
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
  imports: [FormsModule, CommonModule,TimeAgoPipe,ReportModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('postsPanel') postsPanel!: ElementRef;
  @ViewChild('fileUploadInput') fileUploadInput!: ElementRef<HTMLInputElement>;
  currentUserId!: number;
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


  constructor(
    private http: HttpClient,
    private postService: PostService,
    private userService: UserService,
    private router: Router ,    private route : ActivatedRoute
  ) {}    
  ngOnInit(): void {
     
  
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        console.log("Logged-in user:", user);
        this.loading = true;
        setTimeout(() => {

          this.loading = false;
          this.fetchPosts();
        }, 1000);
      },
      error: (err) => {
        if (err.status === 401) {

        this.currentUserId = 0; // not logged in
          this.fetchPosts();
        }
        
      }
    });
  }
  toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
}
  fetchPosts() {
  if (this.loading || this.noMorePosts) return;

  this.loading = true;
  const idParam = this.currentUserId ? `currentUserId=${this.currentUserId}&` : '';
  this.http
    .get<Post[]>(`http://localhost:8087/posts/all?${idParam}offset=${this.currentOffset}&limit=${this.limit}`, 
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
mediaPreviewUrl: string | ArrayBuffer | null = null;
onFileSelected(event: any) {
  const file = event.target.files[0];
    
    if (file) {
      this.newMedia = file;
      console.log("selected media is ", this.newMedia);

      // 3. Use FileReader to create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.mediaPreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);

    } else {
      // User cancelled the file dialog
      this.cancelMediaPreview();
    }
  
}
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
        this.cancelMediaPreview();
      },
      error: err =>{
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

        // ✅ Show it
        this.showError = true;

        // ⏳ Hide after 2 seconds
        setTimeout(() => {
          this.showError = false;
        }, 2000);
        }else if (err.status === 401) {
          this.router.navigate(['/login']);

        } else {
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
