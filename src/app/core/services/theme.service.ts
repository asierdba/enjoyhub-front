import { effect, Injectable, signal } from '@angular/core';
import { ContentType } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly activeCategory = signal<ContentType>('book');

  constructor() {
    effect(() => {
      document.documentElement.setAttribute('data-theme', this.activeCategory());
    });
  }

  setCategory(category: ContentType): void {
    this.activeCategory.set(category);
  }
}
