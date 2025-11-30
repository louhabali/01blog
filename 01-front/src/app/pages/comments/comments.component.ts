import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private auth: AuthService,
    private toast : MatSnackBar
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

  
  addComment() {
    if (!this.newComment.trim()) {
      this.badrequestmessage = "Comment cannot be empty.";
      this.toast.open(this.badrequestmessage, "", {
             duration: 2000,
             horizontalPosition: "end",
             panelClass: "errorAction"
 
           })
      return;
    };
    if (this.newComment.trim().length >100){
        
        this.badrequestmessage = "Comment cannot exceed 100 characters.";
        this.toast.open(this.badrequestmessage, "", {
             duration: 2000,
             horizontalPosition: "end",
             panelClass: "errorAction"
 
           })
           return;
      }
    const dto = { userId: this.currentUserId, postId: this.postId, content: this.newComment };

    this.http.post(`http://localhost:8087/posts/${this.postId}/comments`, dto, { withCredentials: true })
      .subscribe({
        next: () => {
          this.toast.open("comment posted successfully", "", {
             duration: 2000,
             horizontalPosition: "end",
             panelClass: "successAction"
 
           })
          this.comments = [];
          this.offset = 0;
          this.allLoaded = false;
          this.loadComments();
          this.newComment = '';
        },
        error: err => {
          if (err.status === 401 || err.status == 403) {
            this.auth.logout().subscribe();
          } else if (err.status === 400) {
              this.badrequestmessage = "Comment cannot exceed 100 characters.";
              this.toast.open(this.badrequestmessage, "", {
              duration: 2000,
              horizontalPosition: "end",
              panelClass: "errorAction"
 
           })
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
    if (comment.content.trim().length >100){
        this.badrequestmessage = "Comment cannot exceed 100 characters.";
        this.toast.open(this.badrequestmessage, "", {
             duration: 2000,
             horizontalPosition: "end",
             panelClass: "errorAction"
 
           })
           return;
      }
    const dto = { userId: this.currentUserId, postId: this.postId, content: this.editedContent };

    this.http.put(`http://localhost:8087/posts/${this.postId}/comments/${comment.id}`, dto, { withCredentials: true })
      .subscribe({
        next: () => {
          this.toast.open("comment updated successfully", "", {
             duration: 2000,
             horizontalPosition: "end",
             panelClass: "successAction"
 
           })
          comment.content = this.editedContent; // update UI instantly
          this.cancelEdit();
        },
        error: err => {
          if (err.status === 400) {
              this.badrequestmessage = "Comment cannot exceed 100 characters.";
              this.toast.open(this.badrequestmessage, "", {
              duration: 2000,
              horizontalPosition: "end",
              panelClass: "errorAction"
              })
          }
        },

      })
      
    }


  deleteComment(commentId: number) {
    this.commentToDeleteId = commentId;
    this.isDeleteConfirmOpen = true;
  }
  proceedDelete() {
    if (!this.commentToDeleteId) return;
    this.http
      .delete(`http://localhost:8087/posts/${this.postId}/comments/${this.commentToDeleteId}?userId=${this.currentUserId}`,
        { withCredentials: true })
      .subscribe({
        next: () => {

          this.toast.open("comment deleted successfully", "", {
             duration: 2000,
             horizontalPosition: "end",
             panelClass: "successAction"
 
           })
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
