import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersComponent } from '../users/users.component';

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule,UsersComponent],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  postId!: number;
  comments: Comment[] = [];
  newComment: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchComments();
  }

  fetchComments() {
    this.http.get<Comment[]>(`http://localhost:8087/comments/post/${this.postId}`, { withCredentials: true })
      .subscribe(comments => this.comments = comments);
  }

  submitComment() {
    const payload = { content: this.newComment, postId: this.postId };
    this.http.post<Comment>('http://localhost:8087/comments/create', payload, { withCredentials: true })
      .subscribe(comment => {
        this.comments.push(comment);
        this.newComment = '';
      });
  }
}
