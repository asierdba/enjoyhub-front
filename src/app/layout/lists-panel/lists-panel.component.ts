import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-lists-panel',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './lists-panel.component.html',
  styleUrl: './lists-panel.component.scss',
})
export class ListsPanelComponent {
  constructor() {
  }
}
