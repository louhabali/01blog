import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface User { 
  id: number; 
  username: string; 
  email: string; 
  avatar?: string; // optional, you can add default in HTML
}

interface Post { 
  id: number; 
  title: string; 
  content: string; 
  author: string; 
  avatar?: string; 
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';

  posts: Post[] = [];
  newPost: Partial<Post> = { title: '', content: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPosts();
    this.fetchUsers();
  }

  fetchPosts() {
    this.http.get<Post[]>('http://localhost:8087/posts/all', { withCredentials: true })
      .subscribe(posts => this.posts = posts);
  }

  fetchUsers() {
    this.http.get<User[]>('http://localhost:8087/users', { withCredentials: true })
      .subscribe(users => {
        console.log(users);
        this.users = users;
        this.filteredUsers = users;
      });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(u =>
      u.username.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

submitPost() {
  const postPayload = {
    title: this.newPost.title,
    content: this.newPost.content,
    authorId: 1 // replace with actual logged-in user id
  };

  this.http.post<Post>('http://localhost:8087/posts/create', postPayload, { withCredentials: true })
    .subscribe({
      next: post => {
        this.posts.unshift(post);
        this.newPost = { title: '', content: '' };
      },
      error: err => console.error('Error creating post', err)
    });
}

  editPost(post: Post) { alert('Edit post: ' + post.id); }
  deletePost(post: Post) { alert('Delete post: ' + post.id); }
  reportPost(post: Post) { alert('Report post: ' + post.id); }
}
