import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

const API = 'http://127.0.0.1:8000/enjoyhub';

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${API}/books`);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${API}/books/${id}`);
  }
}
