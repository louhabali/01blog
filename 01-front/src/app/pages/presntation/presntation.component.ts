import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './presntation.component.html',
  styleUrl: './presntation.component.css'
})
export class PresntationComponent {}
