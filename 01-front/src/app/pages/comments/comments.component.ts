import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';

interface Comment {
  id?: number;
  user: { id: number; username: string; avatar?: string };
  content: string;
  createdAt: string;
}

@Component({
  selector: 'app-comments',
  imports: [CommonModule, FormsModule, TimeAgoPipe, RouterModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit {
  comments: Comment[] = [];
  newComment = '';
  currentUserId!: number;
  postId!: number;

  limit = 10;
  offset = 0;
  loading = false;
  allLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUserId = user.id;
    });

    this.route.paramMap.subscribe(params => {
      this.postId = Number(params.get('id'));
      this.loadComments();
    });
  }

  loadComments() {
    if (this.loading || this.allLoaded) return;

    this.loading = true;

    this.http
      .get<Comment[]>(`http://localhost:8087/posts/${this.postId}/comments?limit=${this.limit}&offset=${this.offset}`)
      .subscribe(res => {
        if (res.length < this.limit) this.allLoaded = true;
        this.comments.push(...res);
        this.offset += this.limit;
        this.loading = false;
      });
  }

  addComment() {
    if (!this.newComment.trim()) return;

    const dto = { userId: this.currentUserId, postId: this.postId, content: this.newComment };

    this.http
      .post(`http://localhost:8087/posts/${this.postId}/comments`, dto, { withCredentials: true })
      .subscribe({
        next: () => {
          this.comments = [];
          this.offset = 0;
          this.allLoaded = false;
          this.loadComments();
          this.newComment = '';
        },
        error: err => {
          if (err.status === 401) this.router.navigate(['/login']);
        },
      });
  }

  // 🧠 Detect scroll bottom
 onScroll(event: Event) {
  const element = event.target as HTMLElement;
  const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 200;

  if (atBottom) {
    this.loadComments();
  }
}
}
