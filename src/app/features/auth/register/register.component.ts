import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RegisterModalService } from '../../../core/services/register-modal.service';
import { AuthService } from '../../../core/services/auth.service';
import { PROFILE_ICONS } from '../../../core/constants/profile-icons';

function passwordMatchValidator(control: AbstractControl) {
  const pass    = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
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
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    profileIcon:     ['1', Validators.required],
  }, { validators: passwordMatchValidator });

  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') &&
           !!this.form.get('confirmPassword')?.dirty;
  }

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
        this.authError.set(err?.error?.message ?? 'Error al crear la cuenta');
      },
    });
  }
}
