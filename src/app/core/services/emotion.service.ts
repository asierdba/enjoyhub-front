import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Emotion } from '../models/emotion.model';
import { Content } from '../models/content.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmotionService {
  private http = inject(HttpClient);

  getEmotions(): Observable<Emotion[]> {
    return this.http.get<Emotion[]>(`${environment.apiUrl}/emotions`);
  }

  getContentByEmotion(emotionId: number): Observable<Content[]> {
    return this.http.get<Content[]>(`${environment.apiUrl}/books/by-emotion/${emotionId}`);
  }
}
