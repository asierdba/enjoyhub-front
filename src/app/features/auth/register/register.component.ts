import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router      = inject(Router);
  private fb          = inject(FormBuilder);

  icons = { faUserPlus };

  authError   = signal<string | null>(null);
  authLoading = signal(false);

  form = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.authLoading()) return;
    this.authError.set(null);
    this.authLoading.set(true);
    const { userName, email, password } = this.form.value;
    this.authService.register(userName!, email!, password!).subscribe({
      next: () => {
        this.authLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.authLoading.set(false);
        this.authError.set(err?.error?.message ?? 'Error al crear la cuenta');
      },
    });
  }
}
