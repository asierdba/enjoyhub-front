import { Component, inject, signal, HostListener } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RegisterModalService } from '../../../core/services/register-modal.service';
import { AuthService } from '../../../core/services/auth.service';
import { PROFILE_ICONS } from '../../../core/constants/profile-icons';
import { passwordMatchValidator } from '../../../core/validators/password-match.validator';

@Component({
  selector: 'app-register',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  modalService        = inject(RegisterModalService);
  private authService = inject(AuthService);
  private fb          = inject(FormBuilder);

  profileIcons = PROFILE_ICONS;
  authError    = signal<string | null>(null);
  authLoading  = signal(false);

  form = this.fb.group({
    userName:        ['', [Validators.required, Validators.minLength(3)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).*$/)]],
    confirmPassword: ['', Validators.required],
    profileIcon:     ['1', Validators.required],
  }, { validators: passwordMatchValidator('password', 'confirmPassword') });

  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') &&
           !!this.form.get('confirmPassword')?.dirty;
  }

  get pwValue(): string { return this.form.get('password')?.value ?? ''; }
  get pwHasLength(): boolean { return this.pwValue.length >= 8; }
  get pwHasUpper(): boolean { return /[A-Z]/.test(this.pwValue); }
  get pwHasNumber(): boolean { return /[0-9]/.test(this.pwValue); }

  selectIcon(id: string): void {
    this.form.patchValue({ profileIcon: id });
  }

  close(): void {
    this.modalService.close();
    this.form.reset({ profileIcon: '1' });
    this.authError.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalService.isOpen()) this.close();
  }

  onSubmit(): void {
    if (this.form.invalid || this.authLoading()) return;
    this.authError.set(null);
    this.authLoading.set(true);
    const { userName, email, password, profileIcon } = this.form.value;
    this.authService.register(userName!, email!, password!, profileIcon!).subscribe({
      next: () => {
        this.authLoading.set(false);
        this.close();
      },
      error: (err) => {
        this.authLoading.set(false);
        this.authError.set(err?.error?.message ?? 'Error creating account');
      },
    });
  }
}
