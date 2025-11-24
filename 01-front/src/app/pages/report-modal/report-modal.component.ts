import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css']
})

export class ReportModalComponent {
  @Input() isOpen = false;
  @Input() currentUserId!: number;
  @Input() postId!: number;
  @Input() reportedUserId!: number;

  @Output() closed = new EventEmitter<void>();

  reportData = {
    reason: '',
    description: ''
  };

  constructor(private http: HttpClient, private router: Router , private auth : AuthService) {}

  close() {
    this.closed.emit();
  }

  submitReport(event: Event) {
    event.preventDefault();
    //console.log("Submitting report:", this.currentUserId);
    const payload = {
      reporterUser: { id: this.currentUserId },
      reportedUser: { id: this.reportedUserId },
      post: { id: this.postId },
      reason: this.reportData.reason,
      description: this.reportData.description
    };

    this.http.post('http://localhost:8087/reports/create', payload, { withCredentials: true })
      .subscribe({
        next: () => {
          this.close();
        },
        error: (err) => {
           if (err.status === 401 || err.status == 403){
          this.auth.logout().subscribe()
        }else console.error('Unexpected error:', err);
        }
      });
  }
}
