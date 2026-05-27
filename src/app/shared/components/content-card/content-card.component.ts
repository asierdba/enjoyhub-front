import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Content } from '../../../core/models/content.model';

@Component({
  selector: 'app-content-card',
  imports: [CommonModule],
  templateUrl: './content-card.component.html',
  styleUrl: './content-card.component.scss',
})
export class ContentCardComponent {
  content = input.required<Content>();
}
