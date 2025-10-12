import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminGuard } from '../../services/admin.guard';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  // lists
  users: any[] = [];
  posts: any[] = [];
  reports: any[] = [];

  // UI state
  loading = false;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.reloadAll();
  }

  reloadAll() {
    this.loading = true;
    this.error = null;

    // parallel-ish fetching; simple approach
    this.adminService.getStats().subscribe({
      next: stats => {
        this.usersCount = stats.usersCount;
        this.bannedUsersCount = stats.bannedUsersCount;
        this.postsCount = stats.postsCount;
        this.hiddenPostsCount = stats.hiddenPostsCount;
      },
      error: err => this.error = 'Failed to load stats'
    });

    this.adminService.getUsers().subscribe({
      next: users => this.users = users,
      error: err => this.error = 'Failed to load users'
    });

    this.adminService.getPosts().subscribe({
      next: posts => this.posts = posts,
      error: err => this.error = 'Failed to load posts'
    });

    this.adminService.getReports().subscribe({
      next: r => {
        this.reports = r;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load reports';
        this.loading = false;
      }
    });
  }

  // user actions
  toggleBan(user: any) {
    this.adminService.banUser(user.id).subscribe({
      next: updated => {
        user.enabled = updated.enabled;
        // update counts
        this.reloadAll();
      },
      error: () => this.error = 'Failed to change ban status'
    });
  }

  deleteUser(user: any) {
    if (!confirm(`Delete user ${user.username}?`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.reloadAll();
      },
      error: () => this.error = 'Failed to delete user'
    });
  }

  // posts
  hidePost(post: any) {
    this.adminService.toggleHidePost(post.id).subscribe({
      next: updated => {
        post.hidden = updated.hidden;
        this.reloadAll();
      },
      error: () => this.error = 'Failed to toggle hide'
    });
  }

  deletePost(post: any) {
    if (!confirm(`Delete post "${post.title}"?`)) return;
    this.adminService.deletePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
        this.reloadAll();
      },
      error: () => this.error = 'Failed to delete post'
    });
  }

  // reports
  resolveReport(report: any) {
    this.adminService.resolveReport(report.id).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r.id !== report.id);
        this.reloadAll();
      },
      error: () => this.error = 'Failed to resolve report'
    });
  }

  deletePostFromReport(postId: number) {
    if (!confirm(`Delete post ${postId} reported?`)) return;
    this.adminService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== postId);
        this.reports = this.reports.filter(r => r.postId !== postId);
        this.reloadAll();
      },
      error: () => this.error = 'Failed to delete post'
    });
  }
}
