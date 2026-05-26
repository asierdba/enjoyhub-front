import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

const API = 'http://127.0.0.1:8000/enjoyhub';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${API}/auth/login`, { email, password }).pipe(
      tap(res => {
        this.currentUser.set(res.user);
        this.token.set(res.token);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${API}/auth/register`, { name, email, password }).pipe(
      tap(res => {
        this.currentUser.set(res.user);
        this.token.set(res.token);
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
