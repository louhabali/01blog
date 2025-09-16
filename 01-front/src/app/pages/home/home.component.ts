import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  searchQuery = '';

  users = [
    { id: 1, name: 'Ali', avatar: 'https://i.pravatar.cc/50?img=1' },
    { id: 2, name: 'Nouhaila', avatar: 'https://i.pravatar.cc/50?img=2' },
    { id: 3, name: 'Othman', avatar: 'https://i.pravatar.cc/50?img=3' },
    { id: 4, name: 'abdeladim', avatar: 'https://i.pravatar.cc/50?img=4' },
    { id: 5, name: 'btissam', avatar: 'https://i.pravatar.cc/50?img=5' },
  ];
  filteredUsers = [...this.users];

  posts = [
    { id: 1, title: 'My First Post', content: 'Hello world!', author: 'Ali', avatar: 'https://i.pravatar.cc/50?img=1' },
    { id: 2, title: 'Angular Tips', content: 'Use standalone components!', author: 'Nouhaila', avatar: 'https://i.pravatar.cc/50?img=2' },
    { id: 3, title: 'Spring Boot', content: 'REST APIs are awesome!', author: 'othman', avatar: 'https://i.pravatar.cc/50?img=3' },
    { id: 4, title: 'Learning CSS', content: 'Grid and Flexbox are powerful.', author: 'abdeladim', avatar: 'https://i.pravatar.cc/50?img=4' },
  ];

  newPost = { title: '', content: '' };

  filterUsers() {
    const q = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(u => u.name.toLowerCase().includes(q));
  }

  submitPost() {
    if (!this.newPost.title || !this.newPost.content) return;
    this.posts.unshift({
      id: this.posts.length + 1,
      title: this.newPost.title,
      content: this.newPost.content,
      author: 'You',
      avatar: 'https://i.pravatar.cc/50?img=6'
    });
    this.newPost = { title: '', content: '' };
  }

  editPost(post: any) { alert('Edit: ' + post.title); }
  deletePost(post: any) { this.posts = this.posts.filter(p => p.id !== post.id); }
  reportPost(post: any) { alert('Report: ' + post.title); }
}
