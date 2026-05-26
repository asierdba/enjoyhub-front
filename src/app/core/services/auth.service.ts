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

  register(userName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/register`, { userName, email, password })
      .pipe(tap(res => this.currentUser.set(res.user)));
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
