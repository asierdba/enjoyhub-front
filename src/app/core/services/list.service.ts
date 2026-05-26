import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookList } from '../models/list.model';
import { Book } from '../models/book.model';

const API = 'http://127.0.0.1:8000/enjoyhub';

@Injectable({ providedIn: 'root' })
export class ListService {
  private http = inject(HttpClient);

  getListsByUser(userId: number): Observable<BookList[]> {
    return this.http.get<BookList[]>(`${API}/users/${userId}/lists`);
  }

  addBookToList(listId: number, book: Book): Observable<BookList> {
    return this.http.post<BookList>(`${API}/lists/${listId}/books`, { bookId: book.id });
  }

  removeBookFromList(listId: number, bookId: number): Observable<BookList> {
    return this.http.delete<BookList>(`${API}/lists/${listId}/books/${bookId}`);
  }
}
