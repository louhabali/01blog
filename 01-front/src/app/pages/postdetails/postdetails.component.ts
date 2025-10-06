import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsersComponent } from '../users/users.component';
import { PostService } from '../../services/post.service';
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

  constructor(private router: Router ,private postService: PostService,) {
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
    console.log(post.id , "sssssss" , this.currentUserId);
    
    this.postService.toggleLike(post.id, this.currentUserId).subscribe({
      next: (liked) => {
        if (liked == true){
          post.likes += 1;
        }else {
          post.likes -= 1;
        }
        post.liked = liked;
      },
      error: (err) => console.error('Error toggling like', err)
    });
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


  goToComments(postid: Number) {
     this.router.navigate([`/posts/${postid}/comments`]);
  }
  changePicture(post: Post) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e: any) => this.onImageChange(e, post);
  input.click();
}

onImageChange(event: any, post: Post) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      post.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
}
