import { Component, input } from '@angular/core';
import { Content } from '../../../core/models/content.model';

@Component({
  selector: 'app-content-card',
  imports: [],
  templateUrl: './content-card.component.html',
  styleUrl: './content-card.component.scss',
})
export class ContentCardComponent {
  content = input.required<Content>();
}
