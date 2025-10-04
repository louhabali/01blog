import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsersComponent } from '../users/users.component';

interface Post { 
  id: number; 
  title: string; 
  content: string; 
  imageUrl : string | null;
  videoUrl :string | null;
  author: string;
  authorId : number;
  likes : number; 
  avatar?: string; 
  liked?: boolean;
  isEditing?: boolean; 
  originalTitle?: string;
  originalContent?: string;
}

@Component({
  selector: 'app-postdetails',
  standalone: true,
  imports: [FormsModule, CommonModule, UsersComponent],
  templateUrl: './postdetails.component.html',
  styleUrls: ['./postdetails.component.css']
})
export class PostdetailsComponent {
  post!: Post;
  currentUserId!: number;
  isDarkMode = false;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state && nav.extras.state['post']) {
      this.post = nav.extras.state['post'] as Post;
      this.currentUserId = this.post.authorId; // for demo; replace with actual current user from service
      console.log("Post received via state:", this.post);
    } else {
      console.warn("No post passed via state!");
      this.router.navigate(['/']); // back to home if no post
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleLike(post: Post) {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
  }

  editPost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    post.isEditing = true;
    post.originalTitle = post.title;
    post.originalContent = post.content;
  }

  savePost(post: Post, event?: MouseEvent) {
    if (event) event.stopPropagation();
    post.isEditing = false;
    post.originalTitle = undefined;
    post.originalContent = undefined;
    // optionally: call API to save changes
  }

  cancelEdit(post: Post) {
    post.title = post.originalTitle || post.title;
    post.content = post.originalContent || post.content;
    post.isEditing = false;
  }

  deletePost(post: Post) {
    if (confirm("Are you sure you want to delete this post?")) {
      console.log("Deleted post:", post);
      this.router.navigate(['/']); // back to home
      // optionally: call API to delete
    }
  }

  reportPost(post: Post) {
    alert(`Reported post ${post.id}`);
  }



  stopEvent(event: MouseEvent) {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.post-card') && this.post.isEditing) {
      this.cancelEdit(this.post);
    }
  }
  goToComments(postid: Number) {
     this.router.navigate([`/posts/${postid}/comments`]);
  }
}
