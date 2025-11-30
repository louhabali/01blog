import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
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
  reasonmessage: string = '';
  @Output() closed = new EventEmitter<void>();
  // send a variable when submiting post no when canceling
  @Output() submitted = new EventEmitter<void>();

  reportData = {
    reason: '',
  };

  constructor(private http: HttpClient, private router: Router , private auth : AuthService, private toast : MatSnackBar) {}

  close() {
    this.closed.emit();
    // reset form
    this.reportData.reason = '';
  }

  submit() {
 
    if (this.reportData.reason.trim().length > 40) {
      
      this.reasonmessage = "Reason must be less than 40 characters.";
      setTimeout(() => {
        this.reasonmessage = '';
      }, 2000);
       return;
    }else if (this.reportData.reason.trim().length === 0) {
      this.reasonmessage = "Reason cannot be empty.";
      setTimeout(() => {
        this.reasonmessage = '';
      }, 2000);
       return;
    }
    const payload = {
      reporterUser: { id: this.currentUserId },
      reportedUser: { id: this.reportedUserId },
      post: { id: this.postId },
      reason: this.reportData.reason,
    };

    // jd
    
    this.http.post('http://localhost:8087/reports/create', payload, { withCredentials: true })
      .subscribe({
        next: () => {
          this.submitted.emit(); 
          // reset form
          this.reportData.reason = '';
        },
        error: (err) => {
          if (err.status === 401 || err.status == 403){
          this.auth.logout().subscribe()
          }else if (err.status === 500){
            this.close()
          this.toast.open("you can't report this post two times","",{
          duration : 2000,
          horizontalPosition : "end",
          panelClass : "errorAction",
        
         })

        }else  console.error('Unexpected error:', err);
        }
      });
  }
}
