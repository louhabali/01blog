import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admindashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.css'],
  providers: [AdminService]
})
export class AdmindashboardComponent implements OnInit {
  // summary stats
  usersCount = 0;
  bannedUsersCount = 0;
  postsCount = 0;
  hiddenPostsCount = 0;

  // users scroll
  users: any[] = [];
  usersOffset = 0;
  usersLimit = 10;
  allUsersLoaded = false;
  loadingUsers = false;

  // posts scroll
  posts: any[] = [];
  postsOffset = 0;
  postsLimit = 10;
  allPostsLoaded = false;
  loadingPosts = false;

  // reports scroll
  reports: any[] = [];
  reportsOffset = 0;
  reportsLimit = 10;
  allReportsLoaded = false;
  loadingReports = false;

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
        this.usersCount = stats.usersCount;
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
    this.adminService.getUsers(this.usersOffset, this.usersLimit).subscribe({
      next: newUsers => {
        if (newUsers.length < this.usersLimit) this.allUsersLoaded = true;
        this.users.push(...newUsers);
        this.usersOffset += newUsers.length;
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
    this.adminService.banUser(user.id).subscribe({
      next: updated => user.enabled = updated.enabled,
      error: () => this.error = 'Failed to change ban status'
    });
  }

  deleteUser(user: any) {
    this.openConfirm(`Are you sure you want to delete ${user.username}'s account?`, () => {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => this.users = this.users.filter(u => u.id !== user.id),
        error: () => this.error = 'Failed to delete user'
      });
    });
  }

  // ------------------- POSTS -------------------
  loadPosts() {
    if (this.loadingPosts || this.allPostsLoaded) return;
    this.loadingPosts = true;
    this.adminService.getPosts(this.postsOffset, this.postsLimit).subscribe({
      next: newPosts => {
        if (newPosts.length < this.postsLimit) this.allPostsLoaded = true;
        this.posts.push(...newPosts);
        this.postsOffset += newPosts.length;
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
    this.adminService.toggleHidePost(post.id).subscribe({
      next: updated => post.appropriate = updated.appropriate,
      error: () => this.error = 'Failed to toggle hide'
    });
  }

  deletePost(post: any) {
    this.openConfirm(`Are you sure you want to delete post number ${post.id} ?`, () => {
      this.adminService.deletePost(post.id).subscribe({
        next: () => this.posts = this.posts.filter(p => p.id !== post.id),
        error: () => this.error = 'Failed to delete post'
      });
    });
  }

  // ------------------- REPORTS -------------------
  loadReports() {
    if (this.loadingReports || this.allReportsLoaded) return;
    this.loadingReports = true;
    this.adminService.getReports(this.reportsOffset, this.reportsLimit).subscribe({
      next: newReports => {
        if (newReports.length < this.reportsLimit) this.allReportsLoaded = true;
        this.reports.push(...newReports);
        this.reportsOffset += newReports.length;
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
    this.adminService.resolveReport(report.id).subscribe({
      next: () => this.reports = this.reports.filter(r => r.id !== report.id),
      error: () => this.error = 'Failed to resolve report'
    });
  }

  deletePostFromReport(postId: number) {
    this.openConfirm(`Are you sure you want to delete the reported post (ID: ${postId})?`, () => {
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
