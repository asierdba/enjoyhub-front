import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  readonly currentUser = signal<User | null>(null);
  readonly isLoggedIn  = computed(() => this.currentUser() !== null);
  readonly isAdmin     = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<User>(`${environment.apiUrl}/me`).subscribe({
        next: user => this.currentUser.set(user),
        error: ()  => localStorage.removeItem('token'),
      });
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  register(userName: string, email: string, password: string, profileIcon: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/register`, { userName, email, password, profileIcon })
      .pipe(tap(res => this.handleAuth(res)));
  }

  updateProfile(userId: number, data: { userName?: string; email?: string }): Observable<User> {
    return this.http
      .patch<User>(`${environment.apiUrl}/users/${userId}/profile`, data)
      .pipe(tap(user => this.currentUser.set(user)));
  }

  updatePassword(userId: number, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/users/${userId}/password`, {
      currentPassword,
      newPassword,
    });
  }

  updateProfileIcon(userId: number, profileIcon: string): Observable<void> {
    return this.http
      .patch<void>(`${environment.apiUrl}/users/${userId}/icon`, { profileIcon })
      .pipe(tap(() => {
        const user = this.currentUser();
        if (user) this.currentUser.set({ ...user, profileIcon });
      }));
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }

  private handleAuth(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    this.currentUser.set(res.user);
  }
}
