import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserList } from '../models/list.model';

export interface AdminUser {
  userId: number;
  userName: string;
  email: string;
  role: string;
  lists: UserList[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface ImportResult {
  message: string;
  count: number;
  contentIds: number[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${environment.apiUrl}/admin/users`);
  }

  updateUser(userId: number, data: { userName: string; email: string; role: string }): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${environment.apiUrl}/admin/users/${userId}`, data);
  }

  deleteList(listId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/lists/${listId}`);
  }

  getContactMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(`${environment.apiUrl}/admin/contact-messages`);
  }

  importBooks(): Observable<ImportResult> {
    return this.http.post<ImportResult>(`${environment.apiUrl}/admin/import-books`, {});
  }
}
