import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../services/time-ago.pipe';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
interface Comment {
  id?: number;
  user: { id: number; username: string; avatar?: string };
  content: string;
  createdAt: string;
}

@Component({
  selector: 'app-comments',
  imports : [TimeAgoPipe,CommonModule,FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  comments: Comment[] = [];
  newComment = '';
  currentUserId!:number ; // example
  postId!: number;

  constructor(private route: ActivatedRoute, private http: HttpClient,
    private userService: UserService, private router: Router,
  ) {}

  ngOnInit() {
    // get postId from route
    this.userService.getCurrentUser().subscribe(user => {
      
      this.currentUserId = user.id;
      console.log("Current user id is : ",this.currentUserId);
      
    });
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
        console.log("comments are : ",this.comments);
      } );
  }

  addComment() {
    if (!this.newComment.trim()) return;

    const dto = { userId: this.currentUserId, postId: this.postId , content: this.newComment };
    console.log("DTO is : ",dto);
     this.http.post(`http://localhost:8087/posts/${this.postId}/comments`, dto, { withCredentials: true })
    .subscribe({
      next: () => {
        this.newComment = '';
        this.loadComments();
      },
      error: (err) => {
        if (err.status === 401) {
          // User not logged in → redirect to login
          this.router.navigate(['/login']);
        } else {
         
        }
      }
    });
}
}
