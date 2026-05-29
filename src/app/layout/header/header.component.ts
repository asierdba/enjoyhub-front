import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faList,
  faUser,
  faChevronDown,
  faBook,
  faFilm,
  faTv,
  faGamepad,
  faRightFromBracket,
  faPen,
  faKey,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { RegisterModalService } from '../../core/services/register-modal.service';
import { EditProfileModalService } from '../../core/services/edit-profile-modal.service';
import { getProfileIcon, PROFILE_ICONS } from '../../core/constants/profile-icons';
import { ContentType } from '../../core/models/content.model';

interface Category {
  id: ContentType;
  label: string;
  icon: IconDefinition;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private themeService     = inject(ThemeService);
  private authService      = inject(AuthService);
  private registerModal    = inject(RegisterModalService);
  private editProfileModal = inject(EditProfileModalService);
  private router           = inject(Router);
  private fb               = inject(FormBuilder);

  icons = { faList, faUser, faChevronDown, faRightFromBracket, faPen, faKey };

  categories: Category[] = [
    { id: 'book',   label: 'Books',       icon: faBook    },
    { id: 'movie',  label: 'Movies',      icon: faFilm    },
    { id: 'series', label: 'Series',      icon: faTv      },
    { id: 'game',   label: 'Videogames', icon: faGamepad },
  ];

  dropdownOpen = signal(false);
  userMenuOpen = signal(false);
  authError    = signal<string | null>(null);
  authLoading  = signal(false);

  currentUser  = this.authService.currentUser;
  profileIcons = PROFILE_ICONS;

  readonly activeCategory      = computed(() => this.themeService.activeCategory());
  readonly activeCategoryLabel = computed(() =>
    this.categories.find(c => c.id === this.activeCategory())?.label ?? ''
  );
  readonly activeCategoryIcon  = computed(() =>
    this.categories.find(c => c.id === this.activeCategory())?.icon ?? faBook
  );
  readonly currentUserIcon     = computed(() => {
    const icon = this.authService.currentUser()?.profileIcon;
    return icon ? getProfileIcon(icon) : faUser;
  });

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  openRegisterModal(): void {
    this.closeUserMenu();
    this.registerModal.open();
  }

  goToDashboard(): void {
    if (this.authService.currentUser()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.registerModal.open();
    }
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
    if (!target.closest('.header__dropdown')) this.dropdownOpen.set(false);
    if (!target.closest('.header__user'))     this.userMenuOpen.set(false);
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
        this.authError.set(err?.error?.message ?? 'Incorrect credentials');
      },
    });
  }

  openEditProfile(): void {
    this.closeUserMenu();
    this.editProfileModal.openProfile();
  }

  openEditPassword(): void {
    this.closeUserMenu();
    this.editProfileModal.openPassword();
  }

  onSelectIcon(iconId: string): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;
    this.authService.updateProfileIcon(userId, iconId).subscribe({
      error: () => {},
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.userMenuOpen.set(false);
    this.router.navigate(['/']);
  }
}
