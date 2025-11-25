import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Comment {
  id: number;
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
  badrequestmessage: string = '';
  currentUserId!: number;
  postId!: number;

  limit = 10;
  offset = 0;
  loading = false;
  allLoaded = false;

  // 🧱 Delete confirmation state
  isDeleteConfirmOpen = false;
  commentToDeleteId: number | null = null;

  // 🧱 Edit state
  editingCommentId: number | null = null;
  editedContent = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUserId = user.id;
      if (!user.enabled) {
        this.auth.logout().subscribe(() => {
          this.router.navigate(['/login']);
        });
      }
    });

   
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.postId = Number(id);
      this.loadComments();
    });
  
  }

  // 📜 Load comments
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

  // 📝 Add new comment
  addComment() {
    if (!this.newComment.trim()) {
      this.badrequestmessage = "Comment cannot be empty.";
      setTimeout(() => {
        this.badrequestmessage = '';
      }, 2000);
      return;
    };

    const dto = { userId: this.currentUserId, postId: this.postId, content: this.newComment };

    this.http.post(`http://localhost:8087/posts/${this.postId}/comments`, dto, { withCredentials: true })
      .subscribe({
        next: () => {
          this.comments = [];
          this.offset = 0;
          this.allLoaded = false;
          this.loadComments();
          this.newComment = '';
        },
        error: err => {
          if (err.status === 401 || err.status == 403) {
            this.auth.logout().subscribe();
          } else {
            console.error('Unexpected error:', err);
          }
        },
      });
  }

  // 📜 Infinite scroll
  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 200;
    if (atBottom) {
      this.loadComments();
    }
  }

  // ✏️ Editing comment
  startEdit(comment: Comment) {
    this.editingCommentId = comment.id;
    this.editedContent = comment.content;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editedContent = '';
  }

  saveEdit(comment: Comment) {
    if (!this.editedContent.trim()) return;

    const dto = { userId: this.currentUserId, postId: this.postId, content: this.editedContent };

    this.http.put(`http://localhost:8087/posts/${this.postId}/comments/${comment.id}`, dto, { withCredentials: true })
      .subscribe({
        next: () => {
          comment.content = this.editedContent; // update UI instantly
          this.cancelEdit();
        },
        error: err => console.error('Edit failed', err),
      });
  }

  // 🗑️ Open delete confirmation modal
  deleteComment(commentId: number) {
    this.commentToDeleteId = commentId;
    this.isDeleteConfirmOpen = true;
  }

  // ✅ Confirm delete
  proceedDelete() {
    if (!this.commentToDeleteId) return;
    //console.log(55);
    
    this.http
      .delete(`http://localhost:8087/posts/${this.postId}/comments/${this.commentToDeleteId}?userId=${this.currentUserId}`,
        { withCredentials: true })
      .subscribe({
        next: () => {
          this.comments = [...this.comments.filter(c => c.id !== this.commentToDeleteId)];
          this.isDeleteConfirmOpen = false;
          this.commentToDeleteId = null;
        },
        error: err => {
          console.error('Delete failed', err);
          this.isDeleteConfirmOpen = false;
          this.commentToDeleteId = null;
        },
      });
  }


  cancelDelete() {
    this.isDeleteConfirmOpen = false;
    this.commentToDeleteId = null;
  }
}
