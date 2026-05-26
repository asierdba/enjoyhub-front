import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Content } from '../models/content.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);

  getBooks(): Observable<Content[]> {
    return this.http.get<Content[]>(`${environment.apiUrl}/books`);
  }

  getBookById(id: number): Observable<Content> {
    return this.http.get<Content>(`${environment.apiUrl}/books/${id}`);
  }

  getBooksByEmotion(emotionId: number): Observable<Content[]> {
    return this.http.get<Content[]>(`${environment.apiUrl}/books/by-emotion/${emotionId}`);
  }
}
