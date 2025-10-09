import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UsersComponent } from '../users/users.component';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { FormsModule } from '@angular/forms';
interface Comment {
  id?: number;
  user: { id: number; username: string; avatar?: string };
  content: string;
  createdAt: string;
}

@Component({
  selector: 'app-comments',
  imports : [UsersComponent,TimeAgoPipe,CommonModule,FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  comments: Comment[] = [];
  newComment = '';
  currentUserId = 1; // example
  postId!: number;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    // get postId from route
    this.route.paramMap.subscribe(params => {
      this.postId = Number(params.get('id'));
      console.log(this.postId);
      
      this.loadComments();
      
      
    });
  }

  loadComments() {
    this.http.get<Comment[]>(`http://localhost:8087/posts/${this.postId}/comments`)
      .subscribe(res =>{
        this.comments = res
        console.log(this.comments);
      } );
  }

  addComment() {
    if (!this.newComment.trim()) return;

    const dto = { userId: this.currentUserId, postId: this.postId , content: this.newComment };

    this.http.post(`http://localhost:8087/posts/${this.postId}/comments`, dto)
      .subscribe(() => {
        this.newComment = '';
        this.loadComments();
      });
  }
}
