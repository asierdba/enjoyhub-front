import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  faList,
  faUser,
  faChevronDown,
  faBook,
  faFilm,
  faTv,
  faGamepad,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { ContentType } from '../../core/models/content.model';

interface Category {
  id: ContentType;
  label: string;
  icon: any;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  private authService  = inject(AuthService);
  private fb           = inject(FormBuilder);

  icons = { faList, faUser, faChevronDown, faRightFromBracket };

  categories: Category[] = [
    { id: 'book',   label: 'Libros',      icon: faBook    },
    { id: 'movie',  label: 'Películas',   icon: faFilm    },
    { id: 'series', label: 'Series',      icon: faTv      },
    { id: 'game',   label: 'Videojuegos', icon: faGamepad },
  ];

  dropdownOpen = signal(false);
  userMenuOpen = signal(false);
  authError    = signal<string | null>(null);
  authLoading  = signal(false);

  currentUser  = this.authService.currentUser;

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get activeCategory() {
    return this.themeService.activeCategory();
  }

  get activeCategoryLabel() {
    return this.categories.find(c => c.id === this.activeCategory)?.label ?? '';
  }

  get activeCategoryIcon() {
    return this.categories.find(c => c.id === this.activeCategory)?.icon;
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
    this.dropdownOpen.set(false);
    this.authError.set(null);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  selectCategory(category: Category): void {
    this.themeService.setCategory(category.id);
    this.dropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__dropdown')) {
      this.dropdownOpen.set(false);
    }
    if (!target.closest('.header__user')) {
      this.userMenuOpen.set(false);
    }
  }

  onLogin(): void {
    if (this.loginForm.invalid || this.authLoading()) return;
    this.authError.set(null);
    this.authLoading.set(true);
    const { email, password } = this.loginForm.value;
    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.authLoading.set(false);
        this.userMenuOpen.set(false);
        this.loginForm.reset();
      },
      error: (err) => {
        this.authLoading.set(false);
        this.authError.set(err?.error?.message ?? 'Credenciales incorrectas');
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.userMenuOpen.set(false);
  }
}
