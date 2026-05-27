import { Component, effect, inject, signal, HostListener } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { EditProfileModalService } from '../../../core/services/edit-profile-modal.service';
import { AuthService } from '../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../core/validators/password-match.validator';

@Component({
  selector: 'app-edit-profile-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './edit-profile-modal.component.html',
  styleUrl: './edit-profile-modal.component.scss',
})
export class EditProfileModalComponent {
  modalService        = inject(EditProfileModalService);
  private authService = inject(AuthService);
  private fb          = inject(FormBuilder);

  icons = { faXmark };

  loading = signal(false);
  error   = signal<string | null>(null);
  success = signal<string | null>(null);

  profileForm = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator('newPassword', 'confirmPassword') });

  constructor() {
    effect(() => {
      const mode = this.modalService.mode();
      if (mode === 'profile') {
        const user = this.authService.currentUser();
        this.profileForm.patchValue({ userName: user?.userName ?? '', email: user?.email ?? '' });
      }
      if (mode === null) this.reset();
    });
  }

  get passwordMismatch(): boolean {
    return this.passwordForm.hasError('passwordMismatch') &&
           !!this.passwordForm.get('confirmPassword')?.dirty;
  }

  close(): void {
    this.modalService.close();
    this.reset();
  }

  private reset(): void {
    this.profileForm.reset();
    this.passwordForm.reset();
    this.error.set(null);
    this.success.set(null);
    this.loading.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalService.mode() !== null) this.close();
  }

  submitProfile(): void {
    if (this.profileForm.invalid || this.loading()) return;
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;
    this.error.set(null);
    this.loading.set(true);
    const { userName, email } = this.profileForm.value;
    this.authService.updateProfile(userId, { userName: userName!, email: email! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Perfil actualizado correctamente');
        setTimeout(() => this.close(), 1200);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Error al actualizar el perfil');
      },
    });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid || this.loading()) return;
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;
    this.error.set(null);
    this.loading.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.updatePassword(userId, currentPassword!, newPassword!).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Contraseña actualizada correctamente');
        setTimeout(() => this.close(), 1200);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Error al cambiar la contraseña');
      },
    });
  }
}
