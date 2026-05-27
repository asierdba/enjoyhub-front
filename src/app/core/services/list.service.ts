import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserList } from '../models/list.model';
import { Content } from '../models/content.model';
import { environment } from '../../../environments/environment';

interface ListItemResponse {
  listId: number;
  contentId: number;
}

@Injectable({ providedIn: 'root' })
export class ListService {
  private http = inject(HttpClient);

  getListsByUser(userId: number): Observable<UserList[]> {
    return this.http.get<UserList[]>(`${environment.apiUrl}/users/${userId}/lists`);
  }

  createList(userId: number, name: string, description?: string): Observable<UserList> {
    return this.http.post<UserList>(`${environment.apiUrl}/users/${userId}/lists`, { name, description });
  }

  getItemsByList(listId: number): Observable<Content[]> {
    return this.http.get<Content[]>(`${environment.apiUrl}/lists/${listId}/items`);
  }

  addItemToList(listId: number, contentId: number): Observable<ListItemResponse> {
    return this.http.post<ListItemResponse>(`${environment.apiUrl}/lists/${listId}/items`, { contentId });
  }

  deleteItemFromList(listId: number, contentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/lists/${listId}/items/${contentId}`);
  }

  updateList(listId: number, name: string, description?: string): Observable<UserList> {
    return this.http.patch<UserList>(`${environment.apiUrl}/lists/${listId}`, { name, description });
  }

  deleteList(listId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/lists/${listId}`);
  }
}
