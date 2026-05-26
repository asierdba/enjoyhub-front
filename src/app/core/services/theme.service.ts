import { Injectable, signal, effect } from '@angular/core';
import { ContentType } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  activeCategory = signal<ContentType>('book');

  constructor() {
    document.documentElement.setAttribute('data-theme', this.activeCategory());

    effect(() => {
      document.documentElement.setAttribute('data-theme', this.activeCategory());
    });
  }

  setCategory(category: ContentType): void {
    this.activeCategory.set(category);
  }
}
