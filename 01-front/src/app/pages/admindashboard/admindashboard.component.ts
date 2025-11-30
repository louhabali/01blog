import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TimeAgoPipe } from '../../services/time-ago.pipe';

@Component({
 selector: 'app-admindashboard',
 standalone: true,
 imports: [CommonModule, FormsModule, RouterModule ,TimeAgoPipe],
 templateUrl: './admindashboard.component.html',
 styleUrls: ['./admindashboard.component.css'],
 providers: [AdminService ]
})
export class AdmindashboardComponent implements OnInit {
 // summary stats
 usersCount = 0;
 bannedUsersCount = 0;
 postsCount = 0;
 hiddenPostsCount = 0;

 // ------------------- USERS CURSOR -------------------
 users: any[] = [];
 usersLimit = 10;
 allUsersLoaded = false;
 loadingUsers = false;
 // ✅ Keyset Cursor: Last User ID processed
 lastUserId: number | null = null; 

 // ------------------- POSTS CURSOR -------------------
 posts: any[] = [];
 postsLimit = 10;
 allPostsLoaded = false;
 loadingPosts = false;
 // ✅ Keyset Cursor: Last Post CreatedAt timestamp and ID processed
 lastPostCreatedAt: string | null = null; 
 lastPostId: number | null = null; 

 // ------------------- REPORTS CURSOR -------------------
 reports: any[] = [];
 reportsLimit = 10;
 allReportsLoaded = false;
 loadingReports = false;
 // ✅ Keyset Cursor: Last Report ID processed
 lastReportId: number | null = null;

 // general UI
 loading = false;
 error: string | null = null;

 // custom confirm modal
 showConfirm = false;
 confirmMessage = '';
 confirmCallback: (() => void) | null = null;

 constructor(private adminService: AdminService, private router: Router) {}

 ngOnInit(): void {
  this.loadStats();
  this.loadUsers();
  this.loadPosts();
  this.loadReports();
 }

 navigateToPost(postId: number) {
  this.router.navigate(['/posts', postId]);
 }

 // ------------------- CONFIRM MODAL -------------------
 openConfirm(message: string, onConfirm: () => void) {
  this.confirmMessage = message;
  this.confirmCallback = onConfirm;
  this.showConfirm = true;
 }

 confirmDelete() {
  if (this.confirmCallback) this.confirmCallback();
  this.closeConfirm();
 }

 closeConfirm() {
  this.showConfirm = false;
  this.confirmCallback = null;
 }

 // ------------------- STATS -------------------
 loadStats() {
  this.adminService.getStats().subscribe({
   next: stats => {
    this.usersCount = stats.usersCount -1;
    this.bannedUsersCount = stats.bannedUsersCount;
    this.postsCount = stats.postsCount;
    this.hiddenPostsCount = stats.hiddenPostsCount;
   },
   error: () => this.error = 'Failed to load stats'
  });
 }

 // ------------------- USERS -------------------
 loadUsers() {
  if (this.loadingUsers || this.allUsersLoaded) return;
  this.loadingUsers = true;
  
  // 🔄 Updated service call: using limit and lastUserId
  this.adminService.getUsers(this.usersLimit, this.lastUserId).subscribe({
   next: newUsers => {

    if (newUsers.length < this.usersLimit) this.allUsersLoaded = true;
    this.users.push(...newUsers);
    if (newUsers.length > 0) {
     this.lastUserId = newUsers[newUsers.length - 1].id;
    }
    
    this.loadingUsers = false;
   },
   error: () => { this.error = 'Failed to load users'; this.loadingUsers = false; }
  });
 }

 onUsersScroll(event: any) {
  const div = event.target;
  if (div.scrollTop + div.clientHeight >= div.scrollHeight - 50) {
   this.loadUsers();
  }
 }

 toggleBan(user: any) {
  let action = ""
  if (user.enabled){
    action = "ban"
  }else {
    action = "unban"
  }
  this.openConfirm(`Are you sure you want to ${action} this user ?`, () => {
  this.adminService.banUser(user.id).subscribe({
   next: updated =>{
    user.enabled = updated.enabled
    if (user.enabled){
    this.bannedUsersCount -= 1
    }else {
    this.bannedUsersCount += 1
    }
   } ,
   error: () => this.error = 'Failed to change ban status'
  });
})
 }

 deleteUser(user: any) {
  this.openConfirm(`Are you sure you want to delete this user?`, () => {
   this.adminService.deleteUser(user.id).subscribe({
    next: () =>{
     this.users = this.users.filter(u => u.id !== user.id)
     this.usersCount -=1
    } ,
    error: () => this.error = 'Failed to delete user'
   });
  });
 }

 // ------------------- POSTS -------------------
 loadPosts() {
  if (this.loadingPosts || this.allPostsLoaded) return;
  this.loadingPosts = true;
  
  // 🔄 Updated service call: using limit, lastPostCreatedAt, and lastPostId
  this.adminService.getPosts(this.postsLimit, this.lastPostCreatedAt, this.lastPostId).subscribe({
   next: newPosts => {
    if (newPosts.length < this.postsLimit) this.allPostsLoaded = true;
    this.posts.push(...newPosts);

    // 🚀 Update Keyset Cursor
    if (newPosts.length > 0) {
     const lastPost = newPosts[newPosts.length - 1];
     this.lastPostCreatedAt = lastPost.createdAt; 
     this.lastPostId = lastPost.id;
    }
    
    this.loadingPosts = false;
   },
   error: () => { this.error = 'Failed to load posts'; this.loadingPosts = false; }
  });
 }

 onPostsScroll(event: any) {
  const div = event.target;
  if (div.scrollTop + div.clientHeight >= div.scrollHeight - 50) {
   this.loadPosts();
  }
 }

 hidePost(post: any) {
   let action = ""
  if (post.appropriate){
    action = "hide"
  }else {
    action = "unhide"
  }
  this.openConfirm(`Are you sure you want to ${action} this post ?`, () => {
  this.adminService.toggleHidePost(post.id).subscribe({
   next: updated =>{
    post.appropriate = updated.appropriate
    if (post.appropriate){
    this.hiddenPostsCount -= 1
    }else {
    this.hiddenPostsCount += 1
    }
   } ,
   error: () => this.error = 'Failed to toggle hide'
  });
})
 }

 deletePost(post: any) {
  this.openConfirm(`Are you sure you want to delete this post?`, () => {
   this.adminService.deletePost(post.id).subscribe({
    next: () =>{
     this.posts = this.posts.filter(p => p.id !== post.id)
     this.postsCount -= 1
    } ,
    error: () => this.error = 'Failed to delete post'
   });
  });
 }

 // ------------------- REPORTS -------------------
 loadReports() {
  if (this.loadingReports || this.allReportsLoaded) return;
  this.loadingReports = true;

  this.adminService.getReports(this.reportsLimit, this.lastReportId).subscribe({
   next: newReports => {
    if (newReports.length < this.reportsLimit) this.allReportsLoaded = true;
    this.reports.push(...newReports);

    // 🚀 Update Keyset Cursor
    if (newReports.length > 0) {
     this.lastReportId = newReports[newReports.length - 1].id;
    }
    
    this.loadingReports = false;
   },
   error: () => { this.error = 'Failed to load reports'; this.loadingReports = false; }
  });
 }

 onReportsScroll(event: any) {
  const div = event.target;
  if (div.scrollTop + div.clientHeight >= div.scrollHeight - 50) {
   this.loadReports();
  }
 }

 resolveReport(report: any) {

  this.openConfirm(`Are you sure you want to make this report as resolved ?`, () => {
  this.adminService.resolveReport(report.id).subscribe({
   next: () => this.reports = this.reports.filter(r => r.id !== report.id),
   error: () => this.error = 'Failed to resolve report'
  });
 })
 }

 deletePostFromReport(postId: number) {
  this.openConfirm(`Are you sure you want to delete this reported post?`, () => {
   this.adminService.deletePost(postId).subscribe({
    next: () => {
     this.posts = this.posts.filter(p => p.id !== postId);
     this.reports = this.reports.filter(r => r.post.id !== postId);
    },
    error: () => this.error = 'Failed to delete post'
   });
  });
 }
}