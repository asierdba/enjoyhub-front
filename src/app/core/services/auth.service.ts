import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  message: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.currentUser.set(res.user)));
  }

  register(userName: string, email: string, password: string, profileIcon: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/register`, { userName, email, password, profileIcon })
      .pipe(tap(res => this.currentUser.set(res.user)));
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
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
